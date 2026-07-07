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
        const stored = localStorage.getItem("flara_user");
        return stored ? JSON.parse(stored) : null;
    });

    const navigate = useNavigate();

    async function handleRegister(data) {
        const res = await api.register(data);
        const { token, ...userData } = res.data;
        localStorage.setItem("flara_token", token);
        localStorage.setItem("flara_user", JSON.stringify(userData));
        setUser(userData);
        navigate("/onboarding");
    }

    async function handleLogin(data) {
        const res = await api.login(data);
        const { token, ...userData } = res.data;
        localStorage.setItem("flara_token", token);
        localStorage.setItem("flara_user", JSON.stringify(userData));
        setUser(userData);
        navigate("/dashboard");
    }

    function handleLogout() {
        localStorage.removeItem("flara_token");
        localStorage.removeItem("flara_user");
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