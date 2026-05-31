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
    };

    return (
        <div className="flex justify-center gap-4 mt-12">
            <button
                onClick={() => goToPage(mevcutSayfa - 1)}
                disabled={mevcutSayfa === 1}
                className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card-bg)]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-[var(--accent)] hover:text-white transition-colors"
            >
                ← Önceki
            </button>
            <span className="px-4 py-2 text-[var(--muted)]">
                Sayfa {mevcutSayfa}
            </span>
            <button
                onClick={() => goToPage(mevcutSayfa + 1)}
                disabled={!sonrakiSayfaVar}
                className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card-bg)]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-[var(--accent)] hover:text-white transition-colors"
            >
                Sonraki →
            </button>
        </div>
    );
}
