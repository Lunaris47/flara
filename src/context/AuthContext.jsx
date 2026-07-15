// ===============================
// AUTH CONTEXT
// Provides user state and auth functions globally
// ===============================

import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored =
            localStorage.getItem("flara_user") ||
            sessionStorage.getItem("flara_user");
        return stored ? JSON.parse(stored) : null;
    });

    const navigate = useNavigate();

    async function handleRegister(data) {
        const res = await api.register(data);
        const { token, ...userData } = res.data;
        // Default to sessionStorage for new registrations
        sessionStorage.setItem("flara_token", token);
        sessionStorage.setItem("flara_user", JSON.stringify(userData));
        setUser(userData);
        navigate("/home");
    }

    async function handleLogin(data, rememberMe = false) {
        const res = await api.login(data);
        const { token, ...userData } = res.data;

        if (rememberMe) {
            localStorage.setItem("flara_token", token);
            localStorage.setItem("flara_user", JSON.stringify(userData));
            // Clear session storage in case it has old data
            sessionStorage.removeItem("flara_token");
            sessionStorage.removeItem("flara_user");
        } else {
            sessionStorage.setItem("flara_token", token);
            sessionStorage.setItem("flara_user", JSON.stringify(userData));
            // Clear local storage in case it has old data
            localStorage.removeItem("flara_token");
            localStorage.removeItem("flara_user");
        }

        setUser(userData);
        navigate("/home");
    }

    function handleLogout() {
        localStorage.removeItem("flara_token");
        localStorage.removeItem("flara_user");
        sessionStorage.removeItem("flara_token");
        sessionStorage.removeItem("flara_user");
        setUser(null);
        navigate("/login");
    }

    return (
        <AuthContext.Provider value={{ user, handleRegister, handleLogin, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}