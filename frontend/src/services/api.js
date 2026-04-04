// ============================================================
// FILE: src/services/api.js  (updated — adds adminAPI)
// Axios instance with JWT interceptor for backend API calls
// ============================================================

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ────────────────────────
api.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem('supabase_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed?.access_token) {
          config.headers.Authorization = `Bearer ${parsed.access_token}`;
        }
      } catch { /* ignore */ }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle auth errors ───────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('supabase_session');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── API helpers ────────────────────────────────────────────

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
};

export const propertiesAPI = {
  list:         (params)   => api.get('/properties', { params }),
  getById:      (id)       => api.get(`/properties/${id}`),
  getCount:     (area)     => api.get('/properties/count', { params: { area } }),
  create:       (formData) => api.post('/properties', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus: (id, status) => api.patch(`/properties/${id}/status`, { status }),
  getMine:      ()         => api.get('/properties/mine'),
  recordView:   (id)       => api.post(`/properties/${id}/view`),
  recordTap:    (id, action) => api.post(`/properties/${id}/tap`, { action }),
  delete:       (id)       => api.delete(`/properties/${id}`),
  promote:      (id, plan) => api.post(`/properties/${id}/promote`, { plan }),
  getAreaDemand:(area)     => api.get(`/properties/area-demand/${encodeURIComponent(area)}`),
  getTrustScore:()         => api.get('/properties/owner/trust-score'),
  submitIssue:  (data)     => api.post('/properties/owner/issue', data),
};

export const scoutsAPI = {
  submitReport:  (formData) => api.post('/scouts/report', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getLeaderboard: ()        => api.get('/scouts/leaderboard'),
  getMyReports:   ()        => api.get('/scouts/my-reports'),
};

export const usersAPI = {
  getProfile:         ()     => api.get('/users/profile'),
  updatePreferences:  (data) => api.post('/users/preferences', data),
  updateProfile:      (data) => api.patch('/users/profile', data),
};

export const notificationsAPI = {
  getMyAlerts:    () => api.get('/notifications/my-alerts'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead:       (id) => api.patch(`/notifications/${id}/read`),
  markAllRead:    () => api.patch('/notifications/mark-all-read'),
};

// ── Admin API (super_admin only) ───────────────────────────
export const adminAPI = {
  // Analytics
  getAnalytics: () => api.get('/admin/analytics'),

  // Users
  listUsers:    (params) => api.get('/admin/users', { params }),
  getUser:      (id)     => api.get(`/admin/users/${id}`),
  suspendUser:  (id, suspended, reason) => api.patch(`/admin/users/${id}/suspend`, { suspended, reason }),

  // Properties
  listProperties: (params)  => api.get('/admin/properties', { params }),
  updateProperty: (id, data) => api.patch(`/admin/properties/${id}`, data),
  deleteProperty: (id)       => api.delete(`/admin/properties/${id}`),
  flagProperty:   (id, reason) => api.patch(`/admin/properties/${id}/flag`, { reason }),

  // Scout reports
  listReports:  (params) => api.get('/admin/scout-reports', { params }),
  updateReport: (id, status) => api.patch(`/admin/scout-reports/${id}`, { status }),

  // Advertisements
  listAds:       ()        => api.get('/admin/ads'),
  getActiveAd:   ()        => api.get('/admin/ads/active'),
  createAd:      (data)    => api.post('/admin/ads', data),
  toggleAd:      (id)      => api.patch(`/admin/ads/${id}/toggle`),
  deleteAd:      (id)      => api.delete(`/admin/ads/${id}`),

  // Audit logs
  getLogs: (params) => api.get('/admin/logs', { params }),
};

export default api;