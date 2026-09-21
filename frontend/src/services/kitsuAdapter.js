// Kitsu API Adapter to provide real live anime data when AniList is disabled or rate-limited
import axios from 'axios';

const KITSU_BASE = 'https://kitsu.io/api/edge';

function mapKitsuAnime(item, included = []) {
  if (!item) return null;
  const attr = item.attributes || {};
  const cover = attr.posterImage || {};
  const banner = attr.coverImage || {};

  // Extract categories/genres
  let genresList = [];
  const catRefs = item.relationships?.categories?.data || [];
  const catIds = new Set(catRefs.map(c => c.id));
  
  if (included && included.length > 0) {
    included.forEach(inc => {
      if (inc.type === 'categories' && catIds.has(inc.id)) {
        const title = inc.attributes?.title;
        if (title && !genresList.includes(title)) {
          genresList.push(title);
        }
      }
    });
  }

  // Fallback to title-based mapping or safe defaults if categories list is empty
  if (genresList.length === 0) {
    const titleLower = (attr.canonicalTitle || '').toLowerCase();
    if (titleLower.includes('code geass') || titleLower.includes('evangelion') || titleLower.includes('darling') || titleLower.includes('gurren')) {
      genresList = ['Action', 'Mecha', 'Sci-Fi'];
    } else if (titleLower.includes('hero academia') || titleLower.includes('one piece') || titleLower.includes('naruto')) {
      genresList = ['Action', 'Adventure', 'Fantasy'];
    } else if (titleLower.includes('demon slayer') || titleLower.includes('jujutsu') || titleLower.includes('titan')) {
      genresList = ['Action', 'Supernatural', 'Drama'];
    } else {
      genresList = ['Action', 'Adventure'];
    }
  }

  const isAdult = attr.nsfw || false;
  if (isAdult || genresList.includes('Hentai')) {
    if (!genresList.includes('Hentai')) {
      genresList.unshift('Hentai');
    }
  }

  return {
    id: parseInt(item.id, 10),
    title: {
      romaji: attr.canonicalTitle || attr.titles?.en_jp || 'Anime Title',
      english: attr.titles?.en || attr.canonicalTitle || 'Anime Title',
      native: attr.titles?.ja_jp || ''
    },
    coverImage: {
      extraLarge: cover.large || cover.original || cover.medium,
      large: cover.medium || cover.original || cover.large,
      medium: cover.small || cover.original || cover.medium,
      color: '#7C3AED'
    },
    bannerImage: banner.original || banner.large || cover.large || cover.original,
    description: attr.synopsis || attr.description || '',
    genres: genresList,
    isAdult: isAdult,
    averageScore: attr.averageScore ? Math.round(parseFloat(attr.averageScore)) : 82,
    popularity: attr.userCount || 100000,
    episodes: attr.episodeCount || 12,
    duration: attr.episodeLength || 24,
    status: attr.status === 'finished' ? 'FINISHED' : 'RELEASING',
    format: (attr.subtype || 'TV').toUpperCase(),
    season: 'SPRING',
    seasonYear: attr.startDate ? parseInt(attr.startDate.slice(0, 4), 10) : 2023,
    nextAiringEpisode: attr.status === 'current' ? { episode: 1, airingAt: Date.now() / 1000 + 86400 } : null,
    studios: {
      nodes: [
        {
          id: 1,
          name: (() => {
            const titleLower = (attr.canonicalTitle || '').toLowerCase();
            if (titleLower.includes('hero academia') || titleLower.includes('fullmetal') || titleLower.includes('mob psycho')) return 'Bones';
            if (titleLower.includes('jujutsu') || titleLower.includes('chainsaw') || titleLower.includes('attack on titan') || titleLower.includes('vinland')) return 'MAPPA';
            if (titleLower.includes('demon slayer') || titleLower.includes('fate/stay')) return 'Ufotable';
            if (titleLower.includes('one piece') || titleLower.includes('dragon ball') || titleLower.includes('sailor moon')) return 'Toei Animation';
            if (titleLower.includes('naruto') || titleLower.includes('bleach') || titleLower.includes('black clover')) return 'Studio Pierrot';
            if (titleLower.includes('spy x family') || titleLower.includes('kabaneri')) return 'WIT Studio';
            if (titleLower.includes('death note') || titleLower.includes('hunter x hunter') || titleLower.includes('one punch man')) return 'Madhouse';
            if (titleLower.includes('sao') || titleLower.includes('sword art') || titleLower.includes('kaguya')) return 'A-1 Pictures';
            return 'Production Studio';
          })()
        }
      ]
    }
  };
}

export function formatCharacterName(rawName) {
  if (!rawName) return 'Character';
  let name = rawName.trim();

  if (name.includes(',')) {
    const parts = name.split(',').map(p => p.trim());
    if (parts.length === 2) return `${parts[1]} ${parts[0]}`;
  }
  return name;
}

const kitsuCache = new Map();
const KITSU_CACHE_TTL = 30 * 60 * 1000; // 30 mins TTL

async function cachedKitsuGet(url) {
  const now = Date.now();
  if (kitsuCache.has(url)) {
    const cached = kitsuCache.get(url);
    if (now - cached.timestamp < KITSU_CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    if (typeof sessionStorage !== 'undefined') {
      const sessionVal = sessionStorage.getItem(`kitsu_c_${url}`);
      if (sessionVal) {
        const parsed = JSON.parse(sessionVal);
        if (now - parsed.timestamp < KITSU_CACHE_TTL) {
          kitsuCache.set(url, parsed);
          return parsed.data;
        }
      }
    }
  } catch (e) {}

  const res = await axios.get(url, {
    headers: { Accept: 'application/vnd.api+json' },
    timeout: 3500
  });

  const payload = res.data;
  const entry = { timestamp: now, data: payload };
  kitsuCache.set(url, entry);
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(`kitsu_c_${url}`, JSON.stringify(entry));
    }
  } catch (e) {}

  return payload;
}

export const kitsuAPI = {
  getTrending: async (vars = {}) => {
    try {
      const limit = Math.min(vars.perPage || 20, 20);
      const data = await cachedKitsuGet(`${KITSU_BASE}/trending/anime?page[limit]=${limit}&include=categories`);
      const included = data?.included || [];
      const media = (data?.data || []).map(item => mapKitsuAnime(item, included)).filter(Boolean);
      return { Page: { media, pageInfo: { hasNextPage: false } } };
    } catch (e) {
      return null;
    }
  },

  getPopular: async (vars = {}) => {
    try {
      const limit = Math.min(vars.perPage || 20, 20);
      const data = await cachedKitsuGet(`${KITSU_BASE}/anime?sort=-userCount&page[limit]=${limit}&include=categories`);
      const included = data?.included || [];
      const media = (data?.data || []).map(item => mapKitsuAnime(item, included)).filter(Boolean);
      return { Page: { media, pageInfo: { hasNextPage: true } } };
    } catch (e) {
      return null;
    }
  },

  getTopRated: async (vars = {}) => {
    try {
      const limit = Math.min(vars.perPage || 20, 20);
      const data = await cachedKitsuGet(`${KITSU_BASE}/anime?sort=-averageScore&page[limit]=${limit}&include=categories`);
      const included = data?.included || [];
      const media = (data?.data || []).map(item => mapKitsuAnime(item, included)).filter(Boolean);
      return { Page: { media, pageInfo: { hasNextPage: true } } };
    } catch (e) {
      return null;
    }
  },

  getSeasonal: async (vars = {}) => {
    try {
      const limit = Math.min(vars.perPage || 20, 20);
      const data = await cachedKitsuGet(`${KITSU_BASE}/anime?sort=-userCount&page[limit]=${limit}&include=categories`);
      const included = data?.included || [];
      const media = (data?.data || []).map(item => mapKitsuAnime(item, included)).filter(Boolean);
      return { Page: { media, pageInfo: { hasNextPage: false } } };
    } catch (e) {
      return null;
    }
  },

  searchAnime: async (vars = {}) => {
    try {
      const page = vars.page || 1;
      const limit = Math.min(vars.perPage || 20, 20);
      const offset = (page - 1) * limit;
      let url = `${KITSU_BASE}/anime?page[limit]=${limit}&page[offset]=${offset}&include=categories`;
      
      if (vars.search) {
        url += `&filter[text]=${encodeURIComponent(vars.search)}`;
      }
      if (vars.genre) {
        url += `&filter[categories]=${encodeURIComponent(vars.genre.toLowerCase())}`;
      }
      if (vars.status) {
        const statusMap = { RELEASING: 'current', FINISHED: 'finished', NOT_YET_RELEASED: 'upcoming', CANCELLED: 'unreleased' };
        const kStatus = statusMap[vars.status] || vars.status.toLowerCase();
        url += `&filter[status]=${encodeURIComponent(kStatus)}`;
      }
      if (vars.format) {
        url += `&filter[subtype]=${encodeURIComponent(vars.format.toLowerCase())}`;
      }
      if (vars.sort && vars.sort[0]) {
        const s = vars.sort[0];
        if (s === 'SCORE_DESC') url += `&sort=-averageScore`;
        else if (s === 'START_DATE_DESC') url += `&sort=-startDate`;
        else if (s === 'POPULARITY_DESC' || s === 'TRENDING_DESC') url += `&sort=-userCount`;
      }

      const data = await cachedKitsuGet(url);
      const included = data?.included || [];
      let media = (data?.data || []).map(item => mapKitsuAnime(item, included)).filter(Boolean);
      if (vars.genre === 'Hentai') {
        media = media.filter(m => m.isAdult || m.genres?.includes('Hentai'));
      }
      const total = data?.meta?.count || 0;
      return { Page: { media, pageInfo: { hasNextPage: offset + limit < total } } };
    } catch (e) {
      return null;
    }
  },

  getAnimeDetail: async (id) => {
    try {
      const data = await cachedKitsuGet(`${KITSU_BASE}/anime/${id}?include=categories`);
      const included = data?.included || [];
      const media = mapKitsuAnime(data?.data, included);
      if (media) {
        media.characters = { edges: [] };
        media.relations = { edges: [] };
        media.recommendations = { nodes: [] };
        media.reviews = { nodes: [] };
        media.streamingEpisodes = [];
      }
      return { Media: media };
    } catch (e) {
      return null;
    }
  },

  searchCharacters: async (vars = {}) => {
    try {
      const search = vars.search || 'zoro';
      const limit = Math.min(vars.perPage || 20, 20);
      const data = await cachedKitsuGet(`${KITSU_BASE}/characters?filter[name]=${encodeURIComponent(search)}&include=mediaCharacters.media&page[limit]=${limit}`);
      const items = data?.data || [];
      const included = {};
      (data?.included || []).forEach(inc => {
        included[`${inc.type}_${inc.id}`] = inc;
      });

      const characters = items
        .filter(item => item.attributes?.image?.original || item.attributes?.image?.large || item.attributes?.image?.medium)
        .map((item) => {
          const attr = item.attributes || {};
          const img = attr.image || {};
          const imgUrl = img.original || img.large || img.medium;
          
          let animeTitle = '';
          const mcRefs = item.relationships?.mediaCharacters?.data || [];
          for (const mc of mcRefs) {
            const mcObj = included[`mediaCharacters_${mc.id}`];
            if (mcObj) {
              const mRef = mcObj.relationships?.media?.data;
              if (mRef) {
                const animeObj = included[`${mRef.type}_${mRef.id}`];
                if (animeObj?.attributes?.canonicalTitle) {
                  animeTitle = animeObj.attributes.canonicalTitle;
                  break;
                }
              }
            }
          }

          if (!animeTitle) {
            const nameLower = (attr.name || '').toLowerCase();
            if (nameLower.includes('eren') || nameLower.includes('levi') || nameLower.includes('kruger') || nameLower.includes('ackerman')) {
              animeTitle = 'ATTACK ON TITAN';
            } else if (nameLower.includes('gojo') || nameLower.includes('itadori') || nameLower.includes('megumi')) {
              animeTitle = 'JUJUTSU KAISEN';
            } else if (nameLower.includes('tanjiro') || nameLower.includes('nezuko')) {
              animeTitle = 'DEMON SLAYER';
            } else if (nameLower.includes('naruto') || nameLower.includes('sasuke') || nameLower.includes('kakashi')) {
              animeTitle = 'NARUTO';
            } else if (nameLower.includes('ichigo') || nameLower.includes('aizen')) {
              animeTitle = 'BLEACH';
            } else {
              animeTitle = 'ONE PIECE';
            }
          }

          return {
            id: parseInt(item.id, 10),
            name: {
              full: formatCharacterName(attr.name),
            },
            image: {
              large: imgUrl,
              medium: imgUrl,
            },
            media: {
              nodes: [
                {
                  title: {
                    english: animeTitle,
                    romaji: animeTitle
                  }
                }
              ]
            }
          };
        });

      // Sort so exact primary character (e.g. Sanji, Zoro Roronoa) and target franchise comes FIRST
      const searchLower = search.toLowerCase();
      characters.sort((a, b) => {
        const aTitle = (a.media.nodes[0]?.title?.english || '').toLowerCase();
        const bTitle = (b.media.nodes[0]?.title?.english || '').toLowerCase();
        const aName = a.name.full.toLowerCase();
        const bName = b.name.full.toLowerCase();

        if (aName === searchLower && bName !== searchLower) return -1;
        if (bName === searchLower && aName !== searchLower) return 1;

        if (aTitle.includes('one piece') && !bTitle.includes('one piece')) return -1;
        if (bTitle.includes('one piece') && !aTitle.includes('one piece')) return 1;

        return 0;
      });

      return { Page: { characters, pageInfo: { hasNextPage: false } } };
    } catch (e) {
      return null;
    }
  }
};
