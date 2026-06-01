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

    if (!mounted) return <div className="w-10 h-10" />;

    return (
        <button
            onClick={toggle}
            aria-label={dark ? "Aydınlık moda geç" : "Karanlık moda geç"}
            className="group relative w-10 h-10 rounded-full flex items-center justify-center
                 border-2 border-[var(--border)] bg-[var(--card-bg)]
                 hover:border-[var(--accent)] transition-all duration-300
                 hover:shadow-lg hover:scale-110"
        >
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-20 blur transition-opacity"></div>

            {/* Icon with transition */}
            <div className="relative text-lg">
                <span
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                        dark
                            ? "opacity-100 rotate-0"
                            : "opacity-0 rotate-90 pointer-events-none"
                    }`}
                >
                    ☀️
                </span>
                <span
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                        dark
                            ? "opacity-0 -rotate-90 pointer-events-none"
                            : "opacity-100 rotate-0"
                    }`}
                >
                    🌙
                </span>
            </div>
        </button>
    );
}
