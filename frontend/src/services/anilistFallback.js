// High quality fallback dataset with permanent, working CDN poster & character images
export const FALLBACK_ANIME = [
  {
    id: 21459,
    title: { romaji: 'Boku no Hero Academia', english: 'My Hero Academia' },
    coverImage: {
      extraLarge: 'https://media.kitsu.app/anime/poster_images/11469/large.jpg',
      large: 'https://media.kitsu.app/anime/poster_images/11469/large.jpg',
      medium: 'https://media.kitsu.app/anime/poster_images/11469/medium.jpg',
      color: '#e44c25'
    },
    bannerImage: 'https://media.kitsu.app/anime/cover_images/11469/original.jpg',
    description: 'The appearance of "quirks," newly discovered super-powers, has been steadily increasing over the years. Izuku Midoriya is quirkless but dreams of becoming a Hero.',
    genres: ['Action', 'Adventure', 'Superpower'],
    averageScore: 78,
    popularity: 540000,
    episodes: 13,
    status: 'FINISHED',
    format: 'TV',
    season: 'SPRING',
    seasonYear: 2016,
  },
  {
    id: 101922,
    title: { romaji: 'Kimetsu no Yaiba', english: 'Demon Slayer: Kimetsu no Yaiba' },
    coverImage: {
      extraLarge: 'https://media.kitsu.app/anime/poster_images/41370/large.jpg',
      large: 'https://media.kitsu.app/anime/poster_images/41370/large.jpg',
      medium: 'https://media.kitsu.app/anime/poster_images/41370/medium.jpg',
      color: '#e43b3b'
    },
    bannerImage: 'https://media.kitsu.app/anime/cover_images/41370/original.jpg',
    description: 'It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, his younger sister Nezuko has been transformed into a demon.',
    genres: ['Action', 'Fantasy', 'Supernatural'],
    averageScore: 84,
    popularity: 680000,
    episodes: 26,
    status: 'FINISHED',
    format: 'TV',
    season: 'SPRING',
    seasonYear: 2019,
  },
  {
    id: 113415,
    title: { romaji: 'Jujutsu Kaisen', english: 'JUJUTSU KAISEN' },
    coverImage: {
      extraLarge: 'https://media.kitsu.app/anime/poster_images/42765/large.jpg',
      large: 'https://media.kitsu.app/anime/poster_images/42765/large.jpg',
      medium: 'https://media.kitsu.app/anime/poster_images/42765/medium.jpg',
      color: '#a13be4'
    },
    bannerImage: 'https://media.kitsu.app/anime/cover_images/42765/original.jpg',
    description: 'Idly indulging in unfounded paranormal activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital.',
    genres: ['Action', 'Drama', 'Supernatural'],
    averageScore: 85,
    popularity: 610000,
    episodes: 24,
    status: 'FINISHED',
    format: 'TV',
    season: 'FALL',
    seasonYear: 2020,
  },
  {
    id: 16498,
    title: { romaji: 'Shingeki no Kyojin', english: 'Attack on Titan' },
    coverImage: {
      extraLarge: 'https://media.kitsu.app/anime/poster_images/7442/large.jpg',
      large: 'https://media.kitsu.app/anime/poster_images/7442/large.jpg',
      medium: 'https://media.kitsu.app/anime/poster_images/7442/medium.jpg',
      color: '#8b0000'
    },
    bannerImage: 'https://media.kitsu.app/anime/cover_images/7442/original.jpg',
    description: 'Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called titans, forcing humans to hide in fear behind enormous concentric walls.',
    genres: ['Action', 'Drama', 'Mystery'],
    averageScore: 89,
    popularity: 750000,
    episodes: 25,
    status: 'FINISHED',
    format: 'TV',
    season: 'SPRING',
    seasonYear: 2013,
  },
  {
    id: 21,
    title: { romaji: 'ONE PIECE', english: 'ONE PIECE' },
    coverImage: {
      extraLarge: 'https://media.kitsu.app/anime/poster_images/12/large.jpg',
      large: 'https://media.kitsu.app/anime/poster_images/12/large.jpg',
      medium: 'https://media.kitsu.app/anime/poster_images/12/medium.jpg',
      color: '#e49825'
    },
    bannerImage: 'https://media.kitsu.app/anime/cover_images/12/original.jpg',
    description: 'Barely surviving in a barrel after passing through a terrible whirlpool at sea, young Monkey D. Luffy ends up aboard a ship under attack by fearsome pirates.',
    genres: ['Action', 'Adventure', 'Comedy'],
    averageScore: 87,
    popularity: 580000,
    episodes: 1100,
    status: 'RELEASING',
    format: 'TV',
    season: 'FALL',
    seasonYear: 1999,
  },
  {
    id: 154587,
    title: { romaji: 'Sousou no Frieren', english: 'Frieren: Beyond Journey\'s End' },
    coverImage: {
      extraLarge: 'https://media.kitsu.app/anime/46474/poster_image/large-ec9b98dd5fbf8f92532d1edb45f9e882.jpeg',
      large: 'https://media.kitsu.app/anime/46474/poster_image/large-ec9b98dd5fbf8f92532d1edb45f9e882.jpeg',
      medium: 'https://media.kitsu.app/anime/46474/poster_image/medium-ec9b98dd5fbf8f92532d1edb45f9e882.jpeg',
      color: '#38bdf8'
    },
    bannerImage: 'https://media.kitsu.app/anime/46474/cover_image/large.jpeg',
    description: 'The demon king has been defeated, and the victorious hero party returns home before disbanding.',
    genres: ['Adventure', 'Drama', 'Fantasy'],
    averageScore: 91,
    popularity: 420000,
    episodes: 28,
    status: 'FINISHED',
    format: 'TV',
    season: 'FALL',
    seasonYear: 2023,
  }
];

export const FALLBACK_CHARACTERS = [
  {
    id: 62,
    name: { full: 'Roronoa Zoro' },
    image: { large: 'https://media.kitsu.app/characters/images/773/original.jpg' },
    media: { nodes: [{ title: { english: 'ONE PIECE', romaji: 'ONE PIECE' } }] }
  },
  {
    id: 40,
    name: { full: 'Monkey D. Luffy' },
    image: { large: 'https://media.kitsu.app/characters/images/411/original.jpg' },
    media: { nodes: [{ title: { english: 'ONE PIECE', romaji: 'ONE PIECE' } }] }
  },
  {
    id: 45627,
    name: { full: 'Eren Yeager' },
    image: { large: 'https://media.kitsu.app/characters/images/19201/original.jpg' },
    media: { nodes: [{ title: { english: 'Attack on Titan', romaji: 'Shingeki no Kyojin' } }] }
  },
  {
    id: 126071,
    name: { full: 'Satoru Gojou' },
    image: { large: 'https://media.kitsu.app/characters/images/6734/original.jpg' },
    media: { nodes: [{ title: { english: 'JUJUTSU KAISEN', romaji: 'Jujutsu Kaisen' } }] }
  },
  {
    id: 45625,
    name: { full: 'Levi Ackerman' },
    image: { large: 'https://media.kitsu.app/characters/images/39556/original.jpg' },
    media: { nodes: [{ title: { english: 'Attack on Titan', romaji: 'Shingeki no Kyojin' } }] }
  }
];
