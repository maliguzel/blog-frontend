// src/components/PaginationBar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
    mevcutSayfa: number;
    sonrakiSayfaVar: boolean;
};

export function PaginationBar({ mevcutSayfa, sonrakiSayfaVar }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sayfa", page.toString());
        router.push(`?${params.toString()}`);
        // Sayfanın başına scroll
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="flex justify-center items-center gap-4 mt-16 mb-8">
            {/* Önceki Buton */}
            <button
                onClick={() => goToPage(mevcutSayfa - 1)}
                disabled={mevcutSayfa === 1}
                className={`group px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                    flex items-center gap-2 border-2
                    ${
                        mevcutSayfa === 1
                            ? "opacity-40 cursor-not-allowed border-[var(--border)] text-[var(--muted)]"
                            : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-lg hover:bg-[var(--accent-light)]/50"
                    }`}
            >
                <span className="group-hover:-translate-x-1 transition-transform">
                    ←
                </span>
                Önceki
            </button>

            {/* Sayfa Göstergesi */}
            <div className="relative min-w-fit">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent-light)]/10 rounded-full blur"></div>
                <div className="relative px-6 py-3 rounded-full bg-[var(--card-bg)] border border-[var(--accent)]/30">
                    <span className="font-bold text-[var(--foreground)]">
                        {mevcutSayfa}
                    </span>
                    <span className="text-[var(--muted)] text-sm ml-2">
                        . sayfa
                    </span>
                </div>
            </div>

            {/* Sonraki Buton */}
            <button
                onClick={() => goToPage(mevcutSayfa + 1)}
                disabled={!sonrakiSayfaVar}
                className={`group px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                    flex items-center gap-2 border-2
                    ${
                        !sonrakiSayfaVar
                            ? "opacity-40 cursor-not-allowed border-[var(--border)] text-[var(--muted)]"
                            : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-lg hover:bg-[var(--accent-light)]/50"
                    }`}
            >
                Sonraki
                <span className="group-hover:translate-x-1 transition-transform">
                    →
                </span>
            </button>
        </div>
    );
}
