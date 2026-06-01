// src/components/MakaleFiltreleri.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";

type Props = {
    kategoriler: string[];
    aktifKategori: string;
    aktifSiralama: string;
    aktifArama: string;
};

export function MakaleFiltreleri({
    kategoriler,
    aktifKategori,
    aktifSiralama,
    aktifArama,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [aramaInput, setAramaInput] = useState(aktifArama);

    const updateParams = useCallback(
        (updates: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (
                    value === null ||
                    value === "" ||
                    value === "Tümü" ||
                    value === "yeni"
                ) {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            });

            params.delete("sayfa");

            startTransition(() => {
                router.push(
                    params.toString()
                        ? `${pathname}?${params.toString()}`
                        : pathname,
                );
            });
        },
        [router, pathname, searchParams],
    );

    // Arama debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (aramaInput !== aktifArama) {
                updateParams({ arama: aramaInput });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [aramaInput]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            className={`mb-12 transition-opacity duration-300 ${
                isPending ? "opacity-60 pointer-events-none" : "opacity-100"
            }`}
        >
            {/* Arama ve Sıralama */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Arama Inputu */}
                <div className="relative flex-1 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors">
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Makale ara..."
                        value={aramaInput}
                        onChange={(e) => setAramaInput(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 rounded-xl border border-[var(--border)]
                               bg-[var(--card-bg)] text-sm font-medium outline-none
                               focus:border-[var(--accent)] focus:shadow-lg
                               transition-all duration-200"
                    />
                    {aramaInput && (
                        <button
                            onClick={() => {
                                setAramaInput("");
                                updateParams({ arama: null });
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]
                                   hover:text-[var(--foreground)] transition-colors text-xl leading-none"
                            aria-label="Aramayı temizle"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Sıralama Butonları */}
                <div className="flex rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--card-bg)] shrink-0">
                    {(
                        [
                            { value: "yeni", label: "🕐 En Yeni", emoji: "🕐" },
                            {
                                value: "populer",
                                label: "🔥 Popüler",
                                emoji: "🔥",
                            },
                        ] as const
                    ).map((sort) => (
                        <button
                            key={sort.value}
                            onClick={() =>
                                updateParams({ siralama: sort.value })
                            }
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 
                                flex items-center justify-center gap-2
                                ${
                                    aktifSiralama === sort.value
                                        ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white shadow-md"
                                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                                }`}
                            title={sort.label}
                        >
                            <span className="text-base">{sort.emoji}</span>
                            <span className="hidden sm:inline">
                                {sort.label.split(" ")[1]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Kategori Pilleri */}
            <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest font-bold text-[var(--muted)]">
                    Kategoriler
                </p>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => updateParams({ kategori: null })}
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
                            border-2 inline-flex items-center gap-2
                            ${
                                aktifKategori === "Tümü"
                                    ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white border-[var(--accent)] shadow-lg"
                                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                            }`}
                    >
                        <span>📋</span> Tümü
                    </button>
                    {kategoriler.map((kat) => (
                        <button
                            key={kat}
                            onClick={() => updateParams({ kategori: kat })}
                            className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
                                border-2 hover:shadow-md
                                ${
                                    aktifKategori === kat
                                        ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white border-[var(--accent)] shadow-lg"
                                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                                }`}
                        >
                            {kat}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
