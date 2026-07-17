import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const stored = localStorage.getItem("flara_theme");
        return stored ? stored === "dark" : true; // default dark
    });

    useEffect(() => {
        document.documentElement.classList.toggle("light-mode", !darkMode);
        localStorage.setItem("flara_theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    function toggleTheme() {
        setDarkMode(!darkMode);
    }

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}