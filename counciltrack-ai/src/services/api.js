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

// Response interceptor to handle errors without forcing redirects
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
};

export const userApi = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
};

export const councilApi = {
  getAll: () => api.get("/councils"),
  getById: (id) => api.get(`/councils/${id}`),
  create: (data) => api.post("/councils", data),
  update: (id, data) => api.put(`/councils/${id}`, data),
};

export const goalApi = {
  getAll: (params) => api.get("/goals", { params }),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post("/goals", data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

export const progressApi = {
  add: (data) => api.post("/progress", data),
  getHistory: (goalId) => api.get(`/progress/${goalId}`),
  update: (id, data) => api.put(`/progress/${id}`, data),
};

export const reflectionApi = {
  submit: (data) => api.post("/reflections", data),
  getAll: (params) => api.get("/reflections", { params }),
  getById: (id) => api.get(`/reflections/${id}`),
};

export const feedbackApi = {
  submit: (data) => api.post("/feedback", data),
  getAll: (params) => api.get("/feedback", { params }),
  getById: (id) => api.get(`/feedback/${id}`),
};

export const meetingApi = {
  getAll: () => api.get("/meetings"),
  schedule: (data) => api.post("/meetings", data),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  cancel: (id) => api.delete(`/meetings/${id}`),
};

export const reportApi = {
  generate: (data) => api.post("/reports/generate", data),
  getAll: (params) => api.get("/reports", { params }),
  getById: (id) => api.get(`/reports/${id}`),
  approve: (id) => api.patch(`/reports/${id}/approve`),
};

export default api;
