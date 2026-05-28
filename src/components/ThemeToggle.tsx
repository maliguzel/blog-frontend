"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
    const [dark, setDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("theme");
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;
        const isDark = saved === "dark" || (!saved && prefersDark);
        setDark(isDark);
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.classList.toggle("light", !isDark);
    }, []);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        document.documentElement.classList.toggle("light", !next);
        localStorage.setItem("theme", next ? "dark" : "light");
    };

    // Hidrasyon uyuşmazlığını önle
    if (!mounted) return <div className="w-9 h-9" />;

    return (
        <button
            onClick={toggle}
            aria-label={dark ? "Aydınlık moda geç" : "Karanlık moda geç"}
            className="w-9 h-9 rounded-full flex items-center justify-center
                 border border-[var(--border)] bg-[var(--card-bg)]
                 hover:border-[var(--accent)] transition-all text-base"
        >
            {dark ? "☀️" : "🌙"}
        </button>
    );
}
