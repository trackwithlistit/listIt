import axios from 'axios';
import anilistAPI from './anilist.js';
import { formatCharacterName } from './kitsuAdapter.js';

// Simple Levenshtein distance for generic fuzzy matching
export function levenshteinDistance(a, b) {
  a = (a || '').toLowerCase().trim();
  b = (b || '').toLowerCase().trim();
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Prefetch popular AniList characters pool in background for client-side fuzzy fallback
let cachedPopularCharacters = null;

export async function prefetchPopularCharacters() {
  if (cachedPopularCharacters) return cachedPopularCharacters;
  try {
    const cached = localStorage.getItem('listit_popular_chars_cache');
    if (cached) {
      cachedPopularCharacters = JSON.parse(cached);
      return cachedPopularCharacters;
    }
  } catch (e) {}

  try {
    const res = await anilistAPI.getPopularChars({ page: 1, perPage: 50 });
    const chars = res.Page?.characters || [];
    cachedPopularCharacters = chars;
    try {
      localStorage.setItem('listit_popular_chars_cache', JSON.stringify(chars));
    } catch (e) {}
    return chars;
  } catch (e) {
    return [];
  }
}

/**
 * Universal Generic Character Search Engine
 * Communicates with backend Flask route /api/search/character (AniList GraphQL + Gemini AI)
 * Performs generic fuzzy/alias ranking without ANY hardcoded character rules.
 */
export async function intelligentCharacterSearch(query, options = {}) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) {
    return {
      query: '',
      target: null,
      characters: [],
      relatedCharacters: [],
      similarCharacters: [],
      correction: null,
      suggestedCorrection: null
    };
  }

  // 1. Attempt Backend API Call (/api/search/character)
  try {
    const res = await axios.post('/api/search/character', { query: cleanQuery }, {
      signal: options.signal,
      timeout: 6000
    });
    
    if (res.data) {
      const data = res.data;
      const target = data.target || (data.nameMatches && data.nameMatches[0]) || null;
      const allMatches = data.nameMatches || [];
      const correctionObj = data.correction || null;

      return {
        query: cleanQuery,
        target: target,
        characters: allMatches,
        relatedCharacters: data.relatedCharacters || [],
        similarCharacters: data.similarCharacters || [],
        correction: correctionObj,
        suggestedCorrection: correctionObj ? correctionObj.suggested : null,
        meta: data.meta
      };
    }
  } catch (err) {
    if (axios.isCancel(err)) throw err; // Don't intercept canceled requests
    console.warn('[SmartSearch]: Backend route unavailable, performing client-side fallback.');
  }

  // 2. Client-Side Generic Fallback (AniList GraphQL Direct + Levenshtein Matching)
  let rawData = await anilistAPI.searchCharacters({ search: cleanQuery, perPage: 25 });
  let rawResults = rawData.Page?.characters || [];

  let formattedResults = rawResults.map(c => ({
    ...c,
    name: {
      ...c.name,
      full: formatCharacterName(c.name?.full)
    }
  }));

  // Deduplicate by full name
  const seenNames = new Set();
  const uniqueResults = [];
  for (const item of formattedResults) {
    const norm = (item.name?.full || '').toLowerCase().trim();
    if (!seenNames.has(norm)) {
      seenNames.add(norm);
      uniqueResults.push(item);
    }
  }

  // Generic Levenshtein ranking for typo tolerance
  const normQuery = cleanQuery.toLowerCase();
  uniqueResults.sort((a, b) => {
    const aName = (a.name?.full || '').toLowerCase();
    const bName = (b.name?.full || '').toLowerCase();
    
    if (aName === normQuery) return -1;
    if (bName === normQuery) return 1;

    const aDist = Math.min(...aName.split(' ').map(tok => levenshteinDistance(normQuery, tok)));
    const bDist = Math.min(...bName.split(' ').map(tok => levenshteinDistance(normQuery, tok)));

    if (aDist !== bDist) return aDist - bDist;
    return (b.favourites || 0) - (a.favourites || 0);
  });

  const target = uniqueResults[0] || null;
  const targetAnime = target?.media?.nodes?.[0]?.title?.english || target?.media?.nodes?.[0]?.title?.romaji;

  const related = [];
  const similar = [];

  if (target) {
    for (const c of uniqueResults.slice(1)) {
      const cAnime = c.media?.nodes?.[0]?.title?.english || c.media?.nodes?.[0]?.title?.romaji;
      if (cAnime && targetAnime && cAnime.toLowerCase() === targetAnime.toLowerCase()) {
        related.push(c);
      } else {
        similar.push(c);
      }
    }
  }

  return {
    query: cleanQuery,
    target: target,
    characters: uniqueResults,
    relatedCharacters: related,
    similarCharacters: similar,
    correction: null,
    suggestedCorrection: null
  };
}
