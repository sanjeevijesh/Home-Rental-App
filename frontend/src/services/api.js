// ============================================================
// FILE: src/services/api.js
// Clean Axios setup for NearbyRental (Production Ready)
// ============================================================

import axios from "axios";

// 🌍 Base URL (from Vercel env)
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// 🔧 Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// 🔐 Request Interceptor (Attach JWT)
// ============================================================

api.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem("supabase_session");

    if (session) {
      try {
        const parsed = JSON.parse(session);

        if (parsed?.access_token) {
          config.headers.Authorization = `Bearer ${parsed.access_token}`;
        }
      } catch {
        console.warn("⚠️ Invalid session in localStorage");
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// ⚠️ Response Interceptor (Handle Auth Errors)
// ============================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("supabase_session");

      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// 📦 API SERVICES
// ============================================================

// 🔐 AUTH
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

// 🏠 PROPERTIES (🔥 FIXED HERE)
export const propertiesAPI = {
  list: async (params) => {
    const res = await api.get("/properties", { params });
    return res.data?.properties || []; // ✅ FIXED
  },

  getById: async (id) => {
    const res = await api.get(`/properties/${id}`);
    return res.data;
  },

  getCount: async (area) => {
    const res = await api.get("/properties/count", { params: { area } });
    return res.data;
  },

  create: (formData) =>
    api.post("/properties", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateStatus: (id, status) =>
    api.patch(`/properties/${id}/status`, { status }),
};

// 🧭 SCOUTS
export const scoutsAPI = {
  submitReport: (formData) =>
    api.post("/scouts/report", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getLeaderboard: async () => {
    const res = await api.get("/scouts/leaderboard");
    return res.data;
  },

  getMyReports: async () => {
    const res = await api.get("/scouts/my-reports");
    return res.data;
  },
};

// 👤 USERS
export const usersAPI = {
  getProfile: async () => {
    const res = await api.get("/users/profile");
    return res.data;
  },

  updatePreferences: (data) =>
    api.post("/users/preferences", data),

  updateProfile: (data) =>
    api.patch("/users/profile", data),
};

// 🔔 NOTIFICATIONS
export const notificationsAPI = {
  getMyAlerts: async () => {
    const res = await api.get("/notifications/my-alerts");
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await api.get("/notifications/unread-count");
    return res.data;
  },

  markRead: (id) =>
    api.patch(`/notifications/${id}/read`),
};

// ============================================================
// 🚀 EXPORT
// ============================================================

export default api;