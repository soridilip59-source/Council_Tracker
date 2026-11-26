import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("counciltrack_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("counciltrack_token");
      localStorage.removeItem("counciltrack_user");
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.patch("/auth/profile", data),
  changePassword: (data) => api.patch("/auth/change-password", data),
};

export const weeklyGoalApi = {
  getMy: (params) => api.get("/weekly-goals/my", { params }),
  create: (data) => api.post("/weekly-goals", data),
  delete: (id) => api.delete(`/weekly-goals/${id}`),
};

export const userApi = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
};

export const councilApi = {
  getAll: () => api.get("/councils"),
  getById: (id) => api.get(`/councils/${id}`),
  create: (data) => api.post("/councils", data),
  update: (id, data) => api.patch(`/councils/${id}`, data),
  resetPassword: (id, newPassword) => api.patch(`/councils/${id}/password`, { newPassword }),
  delete: (id) => api.delete(`/councils/${id}`),
};

export const goalApi = {
  create: (data) => api.post("/goals", data),
  getMy: (params) => api.get("/goals/my", { params }),
  getAll: (params) => api.get("/goals", { params }),
  getById: (id) => api.get(`/goals/${id}`),
  update: (id, data) => api.patch(`/goals/${id}`, data),
  updateStatus: (id, statusData) => api.patch(`/goals/${id}/status`, statusData),
  getSuggestions: () => api.get("/goals/suggestions"),
};

export const reflectionApi = {
  submit: (data) => api.post("/reflections", data),
  getMy: (params) => api.get("/reflections/my", { params }),
  getAll: (params) => api.get("/reflections", { params }),
  getById: (id) => api.get(`/reflections/${id}`),
};

export const analyticsApi = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getWeekly: (params) => api.get("/analytics/weekly", { params }),
  getMonthly: (params) => api.get("/analytics/monthly", { params }),
  getCouncils: (params) => api.get("/analytics/councils", { params }),
  getMember: (id) => api.get(`/analytics/members/${id}`),
  getSmartAlerts: () => api.get("/analytics/smart-alerts"),
};

export const feedbackApi = {
  // Public submission (no token needed)
  submitPublic: (data) => api.post("/feedback", data),
  // Admin view all
  getAll: (params) => api.get("/feedback", { params }),
  // Council view assigned council only
  getMyCouncil: () => api.get("/feedback/my-council"),
  // Admin updates
  updateStatus: (id, status) => api.patch(`/feedback/${id}/status`, { status }),
  updateNotes: (id, adminNotes) => api.patch(`/feedback/${id}/notes`, { adminNotes }),
};

export const leaveApi = {
  getActive: () => api.get("/leaves/active"),
  getAll: () => api.get("/leaves"),
  create: (data) => api.post("/leaves", data),
};

export default api;
