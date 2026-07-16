// ===============================
// FLARA API CLIENT
// Central axios instance with JWT auth
// ===============================

import axios from "axios";

const API_BASE = "https://flara-api-production.up.railway.app";

// ===============================
// HELPERS
// ===============================

export function getStoredToken() {
    return localStorage.getItem("flara_token") || sessionStorage.getItem("flara_token");
}

export function clearStoredAuth() {
    localStorage.removeItem("flara_token");
    localStorage.removeItem("flara_user");
    sessionStorage.removeItem("flara_token");
    sessionStorage.removeItem("flara_user");
}

function authHeaders() {
    const token = getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ===============================
// AUTH (no token needed)
// ===============================
export const register = (data) =>
    axios.post(`${API_BASE}/api/auth/register`, data, {
        headers: { "Content-Type": "application/json" }
    });

export const login = (data) =>
    axios.post(`${API_BASE}/api/auth/login`, data, {
        headers: { "Content-Type": "application/json" }
    });

// ===============================
// DAILY LOGS
// ===============================
export const savePhysicalLog = (data) =>
    axios.post(`${API_BASE}/api/logs/physical`, data, {
        headers: { "Content-Type": "application/json", ...authHeaders() }
    });

export const getPhysicalLogs = () => {
    const headers = authHeaders();
    return axios.get(`${API_BASE}/api/logs/physical`, { headers });
};

export const getPhysicalLogByDate = (date) =>
    axios.get(`${API_BASE}/api/logs/physical/date/${date}`, {
        headers: authHeaders()
    });

export const saveMentalLog = (data) =>
    axios.post(`${API_BASE}/api/logs/mental`, data, {
        headers: { "Content-Type": "application/json", ...authHeaders() }
    });

export const getMentalLogs = () =>
    axios.get(`${API_BASE}/api/logs/mental`, {
        headers: authHeaders()
    });

export const getMentalLogByDate = (date) =>
    axios.get(`${API_BASE}/api/logs/mental/date/${date}`, {
        headers: authHeaders()
    });

// ===============================
// MEALS
// ===============================
export const saveMealLog = (data) =>
    axios.post(`${API_BASE}/api/meals`, data, {
        headers: { "Content-Type": "application/json", ...authHeaders() }
    });

export const getMealLogs = () =>
    axios.get(`${API_BASE}/api/meals`, {
        headers: authHeaders()
    });

export const getMealLogsByDate = (date) =>
    axios.get(`${API_BASE}/api/meals/date/${date}`, {
        headers: authHeaders()
    });

export const deleteMealLog = (id) =>
    axios.delete(`${API_BASE}/api/meals/${id}`, {
        headers: authHeaders()
    });

// ===============================
// MEDICATIONS
// ===============================
export const saveMedicationLog = (data) =>
    axios.post(`${API_BASE}/api/medications`, data, {
        headers: { "Content-Type": "application/json", ...authHeaders() }
    });

export const getMedicationLogs = () =>
    axios.get(`${API_BASE}/api/medications`, {
        headers: authHeaders()
    });

export const deleteMedicationLog = (id) =>
    axios.delete(`${API_BASE}/api/medications/${id}`, {
        headers: authHeaders()
    });

// ===============================
// FLARES
// ===============================
export const saveFlare = (data) =>
    axios.post(`${API_BASE}/api/flares`, data, {
        headers: { "Content-Type": "application/json", ...authHeaders() }
    });

export const getFlares = () =>
    axios.get(`${API_BASE}/api/flares`, {
        headers: authHeaders()
    });

export const updateFlare = (id, data) =>
    axios.put(`${API_BASE}/api/flares/${id}`, data, {
        headers: { "Content-Type": "application/json", ...authHeaders() }
    });

export const deleteFlare = (id) =>
    axios.delete(`${API_BASE}/api/flares/${id}`, {
        headers: authHeaders()
    });
	
// ===============================
// DELETION
// ===============================	
export const deletePhysicalLog = (id) =>
    axios.delete(`${API_BASE}/api/logs/physical/${id}`, {
        headers: authHeaders()
    });

export const deleteMentalLog = (id) =>
    axios.delete(`${API_BASE}/api/logs/mental/${id}`, {
        headers: authHeaders()
    });	