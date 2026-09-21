import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/backend';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.login(credentials);
          localStorage.setItem('listit_token', data.access_token);
          localStorage.setItem('listit_refresh', data.refresh_token);
          set({ user: data.user, token: data.access_token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.response?.data?.message || 'Login failed' };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.register(userData);
          localStorage.setItem('listit_token', data.access_token);
          localStorage.setItem('listit_refresh', data.refresh_token);
          set({ user: data.user, token: data.access_token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.response?.data?.message || 'Registration failed' };
        }
      },

      logout: async () => {
        try { await authAPI.logout(); } catch {}
        localStorage.removeItem('listit_token');
        localStorage.removeItem('listit_refresh');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) => set((s) => ({ user: { ...s.user, ...userData } })),

      fetchMe: async () => {
        try {
          const { data } = await authAPI.me();
          set({ user: data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'listit-auth',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    }
  )
);

// ── UI STORE ──
export const useUIStore = create((set) => ({
  theme: 'dark',
  sidebarOpen: false,
  searchOpen: false,

  toggleTheme: () => {},
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSearchOpen: (v) => set({ searchOpen: v }),
}));

// ── LIST STORE ──
export const useListStore = create((set, get) => ({
  userLists: {},
  loading: false,

  setLists: (lists) => set({ userLists: lists }),

  addEntry: (entry) => set((s) => {
    const status = entry.status || 'plan_to_watch';
    const existing = s.userLists[status] || [];
    return { userLists: { ...s.userLists, [status]: [...existing, entry] } };
  }),

  removeEntry: (entryId) => set((s) => {
    const updated = {};
    for (const [k, v] of Object.entries(s.userLists)) {
      updated[k] = v.filter((e) => e._id !== entryId && e.id !== entryId && String(e.anilist_id) !== String(entryId));
    }
    return { userLists: updated };
  }),

  updateEntry: (entryId, patch) => set((s) => {
    const lists = s.userLists;
    const updated = { ...lists };
    let found = null;
    let oldStatus = null;

    for (const [k, v] of Object.entries(lists)) {
      const idx = v.findIndex((e) => e._id === entryId || e.id === entryId || String(e.anilist_id) === String(entryId));
      if (idx !== -1) {
        found = { ...v[idx], ...patch };
        oldStatus = k;
        break;
      }
    }
    
    if (found) {
      const newStatus = found.status || 'plan_to_watch';
      if (oldStatus !== newStatus) {
        updated[oldStatus] = updated[oldStatus].filter((e) => e._id !== entryId && e.id !== entryId && String(e.anilist_id) !== String(entryId));
        updated[newStatus] = [...(updated[newStatus] || []), found];
      } else {
        updated[oldStatus] = updated[oldStatus].map((e) => (e._id === entryId || e.id === entryId || String(e.anilist_id) === String(entryId)) ? found : e);
      }
    }
    
    return { userLists: updated };
  }),

  getEntryForMedia: (anilistId) => {
    const lists = get().userLists;
    for (const entries of Object.values(lists)) {
      const found = entries?.find((e) => e.anilist_id === anilistId);
      if (found) return found;
    }
    return null;
  },
}));

// ── SERIES LIST STORE ──
export const useSeriesListStore = create((set, get) => ({
  seriesLists: {},
  loading: false,
  error: null,

  setLists: (lists) => set({ seriesLists: lists }),

  addEntry: (entry) => set((s) => {
    const status = entry.status || 'plan_to_watch';
    const existing = s.seriesLists[status] || [];
    return { seriesLists: { ...s.seriesLists, [status]: [...existing, entry] } };
  }),

  removeEntry: (entryId) => set((s) => {
    const updated = {};
    for (const [k, v] of Object.entries(s.seriesLists)) {
      updated[k] = v.filter((e) => e._id !== entryId && e.id !== entryId && String(e.anilist_id) !== String(entryId) && String(e.tvmaze_id) !== String(entryId));
    }
    return { seriesLists: updated };
  }),

  updateEntry: (entryId, patch) => set((s) => {
    const lists = s.seriesLists;
    const updated = { ...lists };
    let found = null;
    let oldStatus = null;

    for (const [k, v] of Object.entries(lists)) {
      const idx = v.findIndex((e) => e._id === entryId || e.id === entryId || String(e.anilist_id) === String(entryId) || String(e.tvmaze_id) === String(entryId));
      if (idx !== -1) {
        found = { ...v[idx], ...patch };
        oldStatus = k;
        break;
      }
    }
    
    if (found) {
      const newStatus = found.status || 'plan_to_watch';
      if (oldStatus !== newStatus) {
        updated[oldStatus] = updated[oldStatus].filter((e) => e._id !== entryId && e.id !== entryId && String(e.anilist_id) !== String(entryId) && String(e.tvmaze_id) !== String(entryId));
        updated[newStatus] = [...(updated[newStatus] || []), found];
      } else {
        updated[oldStatus] = updated[oldStatus].map((e) => (e._id === entryId || e.id === entryId || String(e.anilist_id) === String(entryId) || String(e.tvmaze_id) === String(entryId)) ? found : e);
      }
    }
    
    return { seriesLists: updated };
  }),

  getEntryForSeries: (tvmazeId) => {
    const lists = get().seriesLists;
    for (const entries of Object.values(lists)) {
      const found = entries?.find((e) => e.tvmaze_id === tvmazeId);
      if (found) return found;
    }
    return null;
  },

  getEntryForSeriesSeason: (tvmazeId, seasonId) => {
    const lists = get().seriesLists;
    for (const entries of Object.values(lists)) {
      const found = entries?.find((e) => e.tvmaze_id === tvmazeId && e.season_id === seasonId);
      if (found) return found;
    }
    return null;
  },

  getAllEntriesForSeries: (tvmazeId) => {
    const lists = get().seriesLists;
    let results = [];
    for (const entries of Object.values(lists)) {
      if (entries) {
        results = [...results, ...entries.filter((e) => e.tvmaze_id === tvmazeId)];
      }
    }
    return results;
  },
}));

// ── ADULT CONTENT SAFETY STORE ──
export const useAdultStore = create(
  persist(
    (set) => ({
      unblurAdult: false,
      setUnblurAdult: (val) => set({ unblurAdult: val }),
      toggleUnblurAdult: () => set((s) => ({ unblurAdult: !s.unblurAdult })),
    }),
    {
      name: 'listit-adult-settings',
    }
  )
);
