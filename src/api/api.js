// ===============================
// FLARA API CLIENT
// Central axios instance with JWT auth
// ===============================

import axios from "axios";

const API_BASE = "https://flara-api-production.up.railway.app";

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
    const token =
        localStorage.getItem("flara_token") ||
        sessionStorage.getItem("flara_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle expired tokens globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem("flara_token");
            localStorage.removeItem("flara_user");
            sessionStorage.removeItem("flara_token");
            sessionStorage.removeItem("flara_user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// ===============================
// AUTH
// ===============================
export const register = (data) => api.post("/api/auth/register", data);
export const login = (data) => api.post("/api/auth/login", data);

// ===============================
// DAILY LOGS
// ===============================
export const savePhysicalLog = (data) => api.post("/api/logs/physical", data);
export const getPhysicalLogs = () => api.get("/api/logs/physical");
export const getPhysicalLogByDate = (date) => api.get(`/api/logs/physical/date/${date}`);

export const saveMentalLog = (data) => api.post("/api/logs/mental", data);
export const getMentalLogs = () => api.get("/api/logs/mental");
export const getMentalLogByDate = (date) => api.get(`/api/logs/mental/date/${date}`);

// ===============================
// MEALS
// ===============================
export const saveMealLog = (data) => api.post("/api/meals", data);
export const getMealLogs = () => api.get("/api/meals");
export const getMealLogsByDate = (date) => api.get(`/api/meals/date/${date}`);
export const deleteMealLog = (id) => api.delete(`/api/meals/${id}`);

// ===============================
// MEDICATIONS
// ===============================
export const saveMedicationLog = (data) => api.post("/api/medications", data);
export const getMedicationLogs = () => api.get("/api/medications");
export const deleteMedicationLog = (id) => api.delete(`/api/medications/${id}`);

// ===============================
// FLARES
// ===============================
export const saveFlare = (data) => api.post("/api/flares", data);
export const getFlares = () => api.get("/api/flares");
export const updateFlare = (id, data) => api.put(`/api/flares/${id}`, data);
export const deleteFlare = (id) => api.delete(`/api/flares/${id}`);

export default api;