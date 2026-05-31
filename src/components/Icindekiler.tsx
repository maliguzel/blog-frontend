// src/components/Icindekiler.tsx
"use client";

import { useEffect, useState } from "react";

type Baslik = { baslik: string; anchor: string };

export function Icindekiler({ basliklar }: { basliklar: Baslik[] }) {
    const [aktif, setAktif] = useState<string>("");
    const [acik, setAcik] = useState(false); // mobil panel

    // ── Scroll-spy: ekrandaki en üstteki başlığı aktif yap ──
    useEffect(() => {
        if (!basliklar?.length) return;

        const gozlemci = new IntersectionObserver(
            (entries) => {
                const gorunur = entries
                    .filter((e) => e.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top,
                    );
                if (gorunur[0]) setAktif(gorunur[0].target.id);
            },
            // Üstte sticky header ~80px; alttan %70 kırparak "okunan" bölümü yakala
            { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
        );

        basliklar.forEach((b) => {
            const el = document.getElementById(b.anchor);
            if (el) gozlemci.observe(el);
        });

        return () => gozlemci.disconnect();
    }, [basliklar]);

    if (!basliklar?.length) return null;

    const tikla = (e: React.MouseEvent, anchor: string) => {
        e.preventDefault();
        const el = document.getElementById(anchor);
        if (!el) return;
        // scroll-margin-top (globals.css) sticky header'ın altına denk getirir
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${anchor}`);
        setAcik(false);
    };

    const liste = (
        <ol className="space-y-1 text-sm">
            {basliklar.map((b, i) => {
                const isAktif = aktif === b.anchor;
                return (
                    <li key={b.anchor}>
                        <a
                            href={`#${b.anchor}`}
                            onClick={(e) => tikla(e, b.anchor)}
                            className={`group flex gap-2.5 py-1.5 leading-snug transition-colors
                                ${
                                    isAktif
                                        ? "text-[var(--accent)] font-semibold"
                                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                                }`}
                        >
                            <span
                                className={`mt-[0.45em] h-px w-3 shrink-0 transition-all
                                    ${
                                        isAktif
                                            ? "bg-[var(--accent)] w-5"
                                            : "bg-[var(--border)] group-hover:w-5"
                                    }`}
                            />
                            <span>{b.baslik}</span>
                        </a>
                    </li>
                );
            })}
        </ol>
    );

    return (
        <>
            {/* ── Masaüstü: sticky kenar çubuğu ── */}
            <nav
                aria-label="İçindekiler"
                className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto"
            >
                <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-3">
                    İçindekiler
                </p>
                {liste}
            </nav>

            {/* ── Mobil: açılır panel ── */}
            <div className="lg:hidden sticky top-[68px] z-30 -mx-6 px-6 py-2 bg-[var(--card-bg)]/90 backdrop-blur border-b border-[var(--border)]">
                <button
                    onClick={() => setAcik((v) => !v)}
                    aria-expanded={acik}
                    className="flex w-full items-center justify-between text-sm font-medium text-[var(--foreground)]"
                >
                    <span className="flex items-center gap-2">
                        <svg
                            className="w-4 h-4 text-[var(--accent)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h10M4 18h7"
                            />
                        </svg>
                        İçindekiler
                    </span>
                    <span
                        className={`text-[var(--muted)] transition-transform ${acik ? "rotate-180" : ""}`}
                    >
                        ▾
                    </span>
                </button>
                {acik && <div className="pt-3 pb-1">{liste}</div>}
            </div>
        </>
    );
}
