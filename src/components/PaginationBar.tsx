// src/components/PaginationBar.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
    mevcutSayfa: number;
    sonrakiSayfaVar: boolean;
};

export function PaginationBar({ mevcutSayfa, sonrakiSayfaVar }: Props) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Mevcut query'yi (siralama, kategori, arama...) koruyarak sayfa href'i üret.
    // <Link> olduğu için pagination artık taranabilir; Google 2+. sayfaları keşfeder.
    const href = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page <= 1) params.delete("sayfa");
        else params.set("sayfa", String(page));
        const qs = params.toString();
        return qs ? `${pathname}?${qs}` : pathname;
    };

    const aktifBtn =
        "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-lg hover:bg-[var(--accent-light)]/50";
    const pasifBtn =
        "opacity-40 cursor-not-allowed border-[var(--border)] text-[var(--muted)]";
    const ortak =
        "group px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 border-2";

    return (
        <nav
            aria-label="Sayfalama"
            className="flex justify-center items-center gap-4 mt-16 mb-8"
        >
            {/* Önceki */}
            {mevcutSayfa > 1 ? (
                <Link
                    href={href(mevcutSayfa - 1)}
                    rel="prev"
                    aria-label="Önceki sayfa"
                    className={`${ortak} ${aktifBtn}`}
                >
                    <span className="group-hover:-translate-x-1 transition-transform">
                        ←
                    </span>
                    Önceki
                </Link>
            ) : (
                <span aria-disabled className={`${ortak} ${pasifBtn}`}>
                    <span>←</span>
                    Önceki
                </span>
            )}

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

            {/* Sonraki */}
            {sonrakiSayfaVar ? (
                <Link
                    href={href(mevcutSayfa + 1)}
                    rel="next"
                    aria-label="Sonraki sayfa"
                    className={`${ortak} ${aktifBtn}`}
                >
                    Sonraki
                    <span className="group-hover:translate-x-1 transition-transform">
                        →
                    </span>
                </Link>
            ) : (
                <span aria-disabled className={`${ortak} ${pasifBtn}`}>
                    Sonraki
                    <span>→</span>
                </span>
            )}
        </nav>
    );
}
