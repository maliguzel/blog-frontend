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

    // Arama için local state (debounce için)
    const [aramaInput, setAramaInput] = useState(aktifArama);

    // URL param güncelleme — sayfa her zaman 1'e sıfırlanır
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

            // Filtre değişince sayfayı sıfırla
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

    // Arama debounce — 400ms bekle, sonra URL'yi güncelle
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
            className={`mb-8 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}
        >
            {/* Arama + Sıralama */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Arama */}
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]"
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
                    <input
                        type="text"
                        placeholder="Makale ara..."
                        value={aramaInput}
                        onChange={(e) => setAramaInput(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--border)]
                               bg-[var(--card-bg)] text-sm outline-none
                               focus:border-[var(--accent)] transition-colors"
                    />
                    {aramaInput && (
                        <button
                            onClick={() => {
                                setAramaInput("");
                                updateParams({ arama: null });
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]
                                   hover:text-[var(--foreground)] transition-colors text-lg leading-none"
                            aria-label="Aramayı temizle"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Sıralama */}
                <div className="flex rounded-xl border border-[var(--border)] overflow-hidden text-sm shrink-0">
                    {(["yeni", "populer"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => updateParams({ siralama: s })}
                            className={`px-4 py-2.5 transition-colors ${
                                aktifSiralama === s
                                    ? "bg-[var(--accent)] text-white"
                                    : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
                            }`}
                        >
                            {s === "yeni" ? "🕐 En Yeni" : "🔥 Popüler"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Kategori pilleri */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => updateParams({ kategori: null })}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                        aktifKategori === "Tümü"
                            ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                            : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)] bg-[var(--card-bg)]"
                    }`}
                >
                    Tümü
                </button>
                {kategoriler.map((kat) => (
                    <button
                        key={kat}
                        onClick={() => updateParams({ kategori: kat })}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                            aktifKategori === kat
                                ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)] bg-[var(--card-bg)]"
                        }`}
                    >
                        {kat}
                    </button>
                ))}
            </div>
        </div>
    );
}
