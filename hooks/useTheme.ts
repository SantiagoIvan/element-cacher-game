"use client";

import { useState, useEffect, useCallback } from "react";

export type Theme = "dark" | "light";

type UseThemeReturn = {
    theme: Theme;
    toggle: () => void;
    isDark: boolean;
};

const STORAGE_KEY = "circle-zap-theme";
const DEFAULT_THEME: Theme = "dark";

export function useTheme(): UseThemeReturn {
    const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

    // Leer preferencia guardada al montar
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (saved === "dark" || saved === "light") {
            setTheme(saved);
        }
    }, []);

    // Aplicar al <html> y persistir cada vez que cambia
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggle = useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }, []);

    return { theme, toggle, isDark: theme === "dark" };
}