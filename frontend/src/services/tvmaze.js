import axios from 'axios';

const TVMAZE_API_URL = 'https://api.tvmaze.com';

/**
 * Filter function to identify Japanese Anime.
 * Checks language (Japanese), country (Japan / JP), network, and format (Animation / Anime).
 */
export function isJapaneseAnime(s) {
  const show = s?.show || s;
  if (!show) return false;

  const lang = (show.language || '').toLowerCase();
  const type = (show.type || '').toLowerCase();
  const genres = (show.genres || []).map(g => (g || '').toLowerCase());
  const countryCode = (show.network?.country?.code || show.webChannel?.country?.code || '').toUpperCase();
  const countryName = (show.network?.country?.name || show.webChannel?.country?.name || '').toLowerCase();
  const networkName = (show.network?.name || show.webChannel?.name || '').toLowerCase();

  const isJapaneseLang = lang === 'japanese';
  const isJapanCountry = countryCode === 'JP' || countryName === 'japan';
  const isJapaneseNetwork = [
    'fuji tv', 'tv tokyo', 'tokyo mx', 'mbs', 'at-x', 'nhk', 'bs11', 'ytv', 'yytv', 
    'tbs', 'tv asahi', 'kbs', 'crunchyroll', 'animax', 'wowow', 'nippon tv', 'ntv'
  ].some(n => networkName.includes(n));

  const isAnimation = type === 'animation' || genres.includes('animation') || genres.includes('anime');

  // 1. Explicit 'anime' genre tag
  if (genres.includes('anime')) return true;

  // 2. Animation format + (Japanese language OR Japan country OR Japanese network)
  if (isAnimation && (isJapaneseLang || isJapanCountry || isJapaneseNetwork)) return true;

  // 3. Japanese language + Animation
  if (isJapaneseLang && isAnimation) return true;

  // 4. Japanese network + Animation
  if (isJapaneseNetwork && isAnimation) return true;

  return false;
}

const tvmazeAPI = {
  // Search for shows
  searchShows: async (query) => {
    try {
      const response = await axios.get(`${TVMAZE_API_URL}/search/shows`, {
        params: { q: query },
      });
      // The API returns an array of { score, show }
      const rawData = response.data || [];
      return rawData.filter(item => !isJapaneseAnime(item.show || item));
    } catch (error) {
      console.error('TVMaze API Error (search):', error);
      return [];
    }
  },

  // Get trending/all shows (paginated)
  getShows: async (page = 0) => {
    try {
      const response = await axios.get(`${TVMAZE_API_URL}/shows`, {
        params: { page },
      });
      const rawData = response.data || [];
      return rawData.filter(show => !isJapaneseAnime(show));
    } catch (error) {
      console.error('TVMaze API Error (getShows):', error);
      return [];
    }
  },

  // Get show details
  getShowDetails: async (id) => {
    try {
      const response = await axios.get(`${TVMAZE_API_URL}/shows/${id}?embed[]=episodes&embed[]=seasons`);
      return response.data;
    } catch (error) {
      console.error('TVMaze API Error (getShowDetails):', error);
      return null;
    }
  }
};

export default tvmazeAPI;
