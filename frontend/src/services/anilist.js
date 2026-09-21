import axios from 'axios';
import { FALLBACK_ANIME, FALLBACK_CHARACTERS } from './anilistFallback.js';

const ANILIST_URL = 'https://graphql.anilist.co';
const PROXY_URL = '/api/proxy/anilist';

let anilistBlockedUntil = 0;

const queryCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes TTL

async function query(queryStr, variables = {}) {
  const cacheKey = JSON.stringify({ queryStr, variables });
  const now = Date.now();

  // 1. Check in-memory cache
  if (queryCache.has(cacheKey)) {
    const cached = queryCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  // 2. Check sessionStorage (persists across page refreshes)
  try {
    const sessionCached = sessionStorage.getItem(`anilist_cache_${cacheKey}`);
    if (sessionCached) {
      const parsed = JSON.parse(sessionCached);
      if (now - parsed.timestamp < CACHE_TTL) {
        queryCache.set(cacheKey, parsed);
        return parsed.data;
      }
    }
  } catch (e) {
    // Storage quota or restriction - ignore
  }

  // Circuit Breaker: If AniList recently failed/timed out, skip network wait instantly (0ms)
  if (now < anilistBlockedUntil) {
    return null;
  }

  // 3. Make HTTP Request (6000ms timeout)
  let responseData = null;
  try {
    const res = await axios.post(ANILIST_URL, { query: queryStr, variables }, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      timeout: 6000,
    });
    responseData = res.data;
  } catch (directErr) {
    try {
      const proxyRes = await axios.post(PROXY_URL, { query: queryStr, variables }, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 6000,
      });
      responseData = proxyRes.data;
    } catch (proxyErr) {
      // Short 10-second circuit breaker recovery window
      anilistBlockedUntil = now + 10 * 1000;
      return null;
    }
  }

  if (responseData?.errors && !responseData?.data) {
    throw new Error(responseData.errors[0].message);
  }

  if (responseData?.data) {
    const cacheObj = { timestamp: now, data: responseData.data };
    queryCache.set(cacheKey, cacheObj);
    try {
      sessionStorage.setItem(`anilist_cache_${cacheKey}`, JSON.stringify(cacheObj));
    } catch (e) {}
    return responseData.data;
  }

  return responseData?.data || {};
}

// ── FRAGMENTS ──
const MEDIA_FRAGMENT = `
  fragment MediaFull on Media {
    id title { romaji english native }
    coverImage { extraLarge large medium color }
    bannerImage
    description(asHtml: false)
    genres
    averageScore meanScore popularity
    episodes duration
    status format
    season seasonYear
    startDate { year month day }
    endDate   { year month day }
    studios { nodes { id name } }
    nextAiringEpisode { episode airingAt timeUntilAiring }
    trailer { id site }
    isAdult
    siteUrl
  }
`;

const MEDIA_CARD_FRAGMENT = `
  fragment MediaCard on Media {
    id title { romaji english }
    coverImage { large medium color }
    bannerImage
    description
    genres averageScore popularity
    status format episodes season seasonYear isAdult
    nextAiringEpisode { episode airingAt }
  }
`;

// ── QUERIES ──

export const TRENDING_ANIME = `
  ${MEDIA_CARD_FRAGMENT}
  query TrendingAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(type: ANIME, sort: TRENDING_DESC) { ...MediaCard }
    }
  }
`;

export const POPULAR_ANIME = `
  ${MEDIA_CARD_FRAGMENT}
  query PopularAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(type: ANIME, sort: POPULARITY_DESC) { ...MediaCard }
    }
  }
`;

export const TOP_RATED_ANIME = `
  ${MEDIA_CARD_FRAGMENT}
  query TopRatedAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(type: ANIME, sort: SCORE_DESC, minimumTagRank: 60) { ...MediaCard }
    }
  }
`;

export const SEASONAL_ANIME = `
  ${MEDIA_CARD_FRAGMENT}
  query SeasonalAnime($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC) { ...MediaCard }
    }
  }
`;

export const SEARCH_ANIME = `
  ${MEDIA_CARD_FRAGMENT}
  query SearchAnime($search: String, $genre: String, $status: MediaStatus, $format: MediaFormat, $season: MediaSeason, $year: Int, $sort: [MediaSort], $page: Int, $perPage: Int, $isAdult: Boolean) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(type: ANIME, search: $search, genre: $genre, status: $status, format: $format, season: $season, seasonYear: $year, sort: $sort, isAdult: $isAdult) { ...MediaCard }
    }
  }
`;

export const ANIME_DETAIL = `
  ${MEDIA_FRAGMENT}
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
      ...MediaFull
      relations {
        edges {
          relationType(version: 2)
          node { id title { romaji english } coverImage { large } type format status }
        }
      }
      characters(sort: [ROLE, RELEVANCE], perPage: 24) {
        edges {
          role
          node { id name { full } image { large } description }
          voiceActors(language: JAPANESE) { id name { full } image { large } languageV2 }
        }
      }
      staff(perPage: 12) {
        edges {
          role
          node { id name { full } image { large } }
        }
      }
      recommendations(sort: RATING_DESC, perPage: 12) {
        nodes {
          rating
          mediaRecommendation { id title { romaji english } coverImage { large } averageScore genres format }
        }
      }
      reviews(sort: RATING_DESC, perPage: 6) {
        nodes { id summary score rating ratingAmount createdAt
          user { id name avatar { large } }
        }
      }
      streamingEpisodes { title thumbnail url site }
    }
  }
`;

export const AIRING_SCHEDULE = `
  query AiringSchedule($from: Int, $to: Int, $page: Int) {
    Page(page: $page, perPage: 50) {
      airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
        id airingAt episode
        media { id title { romaji english } coverImage { large } }
      }
    }
  }
`;

export const CHARACTER_SEARCH = `
  query CharacterSearch($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      characters(search: $search, sort: [SEARCH_MATCH]) {
        id name { full native alternative } image { large }
        media(perPage: 1) { nodes { id title { romaji english } coverImage { large } } }
      }
    }
  }
`;

export const STUDIO_SEARCH = `
  query StudioSearch($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      studios(search: $search) {
        id name isAnimationStudio siteUrl
        media(sort: POPULARITY_DESC, perPage: 4, isMain: true) {
          nodes { id title { romaji english } coverImage { medium } }
        }
      }
    }
  }
`;

export const POPULAR_CHARACTERS = `
  query PopularCharacters($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      characters(sort: FAVOURITES_DESC) {
        id name { full native alternative } image { large }
        media(perPage: 1) { nodes { id title { romaji english } coverImage { medium } } }
        favourites
      }
    }
  }
`;

import { kitsuAPI } from './kitsuAdapter.js';

function mapMediaItem(media) {
  if (!media) return media;
  if (media.isAdult && media.genres) {
    if (!media.genres.includes('Hentai')) {
      media.genres = ['Hentai', ...media.genres];
    }
  }
  return media;
}

// ── API FUNCTIONS WITH MULTI-SOURCE SCRAPER FALLBACK ──

export const anilistAPI = {
  getTrending: async (vars = {}) => {
    const res = await query(TRENDING_ANIME, { page: 1, perPage: 20, ...vars });
    if (res?.Page?.media?.length) {
      res.Page.media.forEach(mapMediaItem);
      return res;
    }
    const kitsuRes = await kitsuAPI.getTrending(vars);
    if (kitsuRes?.Page?.media?.length) return kitsuRes;
    return { Page: { media: FALLBACK_ANIME.map(mapMediaItem), pageInfo: { hasNextPage: false } } };
  },

  getPopular: async (vars = {}) => {
    const res = await query(POPULAR_ANIME, { page: 1, perPage: 20, ...vars });
    if (res?.Page?.media?.length) {
      res.Page.media.forEach(mapMediaItem);
      return res;
    }
    const kitsuRes = await kitsuAPI.getPopular(vars);
    if (kitsuRes?.Page?.media?.length) return kitsuRes;
    return { Page: { media: FALLBACK_ANIME.map(mapMediaItem), pageInfo: { hasNextPage: false } } };
  },

  getTopRated: async (vars = {}) => {
    const res = await query(TOP_RATED_ANIME, { page: 1, perPage: 20, ...vars });
    if (res?.Page?.media?.length) {
      res.Page.media.forEach(mapMediaItem);
      return res;
    }
    const kitsuRes = await kitsuAPI.getTopRated(vars);
    if (kitsuRes?.Page?.media?.length) return kitsuRes;
    return { Page: { media: FALLBACK_ANIME.map(mapMediaItem), pageInfo: { hasNextPage: false } } };
  },

  getSeasonal: async (vars = {}) => {
    const res = await query(SEASONAL_ANIME, { page: 1, perPage: 30, ...vars });
    if (res?.Page?.media?.length) {
      res.Page.media.forEach(mapMediaItem);
      return res;
    }
    const kitsuRes = await kitsuAPI.getSeasonal(vars);
    if (kitsuRes?.Page?.media?.length) return kitsuRes;
    return { Page: { media: FALLBACK_ANIME.map(mapMediaItem), pageInfo: { hasNextPage: false } } };
  },

  searchAnime: async (vars = {}) => {
    const queryVars = { ...vars };
    if (queryVars.genre === 'Hentai') {
      queryVars.isAdult = true;
      delete queryVars.genre;
    }
    const res = await query(SEARCH_ANIME, { page: 1, perPage: 24, ...(queryVars.search ? {} : { sort: ['POPULARITY_DESC'] }), ...queryVars });
    if (res !== null) {
      if (res?.Page?.media?.length) {
        res.Page.media.forEach(mapMediaItem);
      }
      return res;
    }
    // Network error: try Kitsu
    const kitsuRes = await kitsuAPI.searchAnime(vars);
    if (kitsuRes !== null) return kitsuRes;
    
    // Both failed: return empty array if searching or filtering by Hentai, or fallback list if browsing
    return { Page: { media: (vars.search || vars.genre === 'Hentai') ? [] : FALLBACK_ANIME.map(mapMediaItem), pageInfo: { hasNextPage: false } } };
  },

  getAnimeDetail: async (id) => {
    const res = await query(ANIME_DETAIL, { id });
    if (res?.Media?.id) {
      mapMediaItem(res.Media);
      if (res.Media.relations?.edges) {
        res.Media.relations.edges.forEach(e => {
          if (e.node) mapMediaItem(e.node);
        });
      }
      if (res.Media.recommendations?.nodes) {
        res.Media.recommendations.nodes.forEach(n => {
          if (n.mediaRecommendation) mapMediaItem(n.mediaRecommendation);
        });
      }
      return res;
    }
    const kitsuRes = await kitsuAPI.getAnimeDetail(id);
    if (kitsuRes?.Media?.id) return kitsuRes;
    return { Media: mapMediaItem(FALLBACK_ANIME[0]) };
  },

  getAiringSchedule: (vars={}) => query(AIRING_SCHEDULE, { page: 1, ...vars }),
  
  searchCharacters: async (vars={}) => {
    const res = await query(CHARACTER_SEARCH, { page: 1, perPage: 20, ...vars });
    if (res !== null) {
      // Direct successful result
      return res;
    }
    // Network error: try Kitsu
    const kitsuRes = await kitsuAPI.searchCharacters(vars);
    if (kitsuRes !== null) return kitsuRes;

    // Both failed
    return { Page: { characters: vars.search ? [] : FALLBACK_CHARACTERS, pageInfo: { hasNextPage: false } } };
  },
  
  searchStudios: async (vars={}) => {
    const res = await query(STUDIO_SEARCH, { page: 1, perPage: 20, ...vars });
    if (res !== null) return res;
    return { Page: { studios: [], pageInfo: { hasNextPage: false } } };
  },
  
  getPopularChars: async (vars={}) => {
    const res = await query(POPULAR_CHARACTERS, { page: 1, perPage: 12, ...vars });
    if (res !== null) return res;
    return { Page: { characters: FALLBACK_CHARACTERS, pageInfo: { hasNextPage: false } } };
  },
};

export default anilistAPI;
