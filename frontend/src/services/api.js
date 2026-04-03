// ============================================================
// FILE: src/services/api.js
// Axios instance with JWT interceptor for backend API calls
// ============================================================

import axios from 'axios';

// In dev, Vite proxies /api to localhost:5000 (see vite.config.js)
// In production, set VITE_API_URL to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
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
      } catch {
        // Invalid session in localStorage, ignore
      }
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
      // Token expired or invalid — clear session and redirect to login
      localStorage.removeItem('supabase_session');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── API helper methods ─────────────────────────────────────

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const propertiesAPI = {
  list: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  getCount: (area) => api.get('/properties/count', { params: { area } }),
  create: (formData) =>
    api.post('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStatus: (id, status) =>
    api.patch(`/properties/${id}/status`, { status }),
};

export const scoutsAPI = {
  submitReport: (formData) =>
    api.post('/scouts/report', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getLeaderboard: () => api.get('/scouts/leaderboard'),
  getMyReports: () => api.get('/scouts/my-reports'),
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updatePreferences: (data) => api.post('/users/preferences', data),
  updateProfile: (data) => api.patch('/users/profile', data),
};

export const notificationsAPI = {
  getMyAlerts: ()      => api.get('/notifications/my-alerts'),
  getUnreadCount: ()   => api.get('/notifications/unread-count'),
  markRead: (id)       => api.patch(`/notifications/${id}/read`),
};

export default api;
