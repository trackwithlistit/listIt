import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST INTERCEPTOR: attach JWT ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('listit_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── RESPONSE INTERCEPTOR: handle 401 ──
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('listit_refresh');
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refresh_token: refresh }
        );
        localStorage.setItem('listit_token', data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        localStorage.removeItem('listit_token');
        localStorage.removeItem('listit_refresh');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──
export const authAPI = {
  register:       (d) => api.post('/auth/register', d),
  login:          (d) => api.post('/auth/login', d),
  loginGoogle:    (d) => api.post('/auth/google', d),
  logout:         ()  => api.post('/auth/logout'),
  sendOTP:        (e) => api.post('/auth/send-otp', { email: e }),
  forgotPassword: (e) => api.post('/auth/forgot-password', { email: e }),
  verifyOTP:      (d) => api.post('/auth/verify-otp', d),
  resetPassword:  (d) => api.post('/auth/reset-password', d),
  me:             ()  => api.get('/auth/me'),
};

// ── USER ──
export const userAPI = {
  getProfile:     (username) => api.get(`/user/${username}`),
  updateProfile:  (d)        => api.patch('/user/profile', d),
  changePassword: (d)        => api.post('/user/change-password', d),
  follow:         (userId)   => api.post(`/user/follow/${userId}`),
  unfollow:       (userId)   => api.delete(`/user/follow/${userId}`),
  getFollowers:   (userId)   => api.get(`/user/${userId}/followers`),
  getFollowing:   (userId)   => api.get(`/user/${userId}/following`),
  uploadAvatar:   (formData) => api.post('/user/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadBanner:   (formData) => api.post('/user/banner', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── LISTS ──
export const listAPI = {
  getUserLists: (userId) => api.get(`/lists/${userId}`),
  addEntry:     (d)      => api.post('/lists/entry', d),
  updateEntry:  (id, d)  => api.patch(`/lists/entry/${id}`, d),
  deleteEntry:  (id)     => api.delete(`/lists/entry/${id}`),
  getCustomLists: ()     => api.get('/lists/custom'),
  createCustomList: (d)  => api.post('/lists/custom', d),
  updateCustomList: (id, d) => api.patch(`/lists/custom/${id}`, d),
  deleteCustomList: (id)    => api.delete(`/lists/custom/${id}`),
};

export const seriesListAPI = {
  addEntry:     (d)      => api.post('/lists/series/entry', d),
  updateEntry:  (id, d)  => api.patch(`/lists/series/entry/${id}`, d),
  deleteEntry:  (id)     => api.delete(`/lists/series/entry/${id}`),
};

// ── REVIEWS ──
export const reviewAPI = {
  getReviews:   (mediaId, type) => api.get(`/reviews/${mediaId}?type=${type}`),
  createReview: (d)             => api.post('/reviews', d),
  updateReview: (id, d)         => api.patch(`/reviews/${id}`, d),
  deleteReview: (id)            => api.delete(`/reviews/${id}`),
  toggleLike:   (id)            => api.post(`/reviews/${id}/like`),
};

// ── STATS ──
export const statsAPI = {
  getUserStats:  (userId) => api.get(`/stats/${userId}`),
  getHeatmap:    (userId) => api.get(`/stats/${userId}/heatmap`),
  getGenreDist:  (userId) => api.get(`/stats/${userId}/genres`),
  getHistory:    (userId) => api.get(`/stats/${userId}/history`),
};

// ── SEARCH ──
export const searchAPI = {
  trending: () => api.get('/search/trending'),
  recent:   () => api.get('/search/recent'),
};

// ── NOTIFICATIONS ──
export const notifAPI = {
  getAll:    ()    => api.get('/notifications'),
  markRead:  (id)  => api.patch(`/notifications/${id}/read`),
  markAllRead: ()  => api.patch('/notifications/read-all'),
};

// ── ADMIN ──
export const adminAPI = {
  getStats:     ()      => api.get('/admin/stats'),
  getUsers:     (page)  => api.get(`/admin/users?page=${page}`),
  updateUser:   (id, d) => api.patch(`/admin/users/${id}`, d),
  getReports:   ()      => api.get('/admin/reports'),
  resolveReport:(id, d) => api.patch(`/admin/reports/${id}`, d),
  setFeatured:  (d)     => api.post('/admin/featured', d),
  announce:     (d)     => api.post('/admin/announcements', d),
};

export default api;
