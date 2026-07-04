// src/components/tools/ToolLayout.tsx
// Server component — hook kullanmıyor, "use client" gerekmiyor. İçine client
// bir araç bileşeni (örn. MolHesaplamaAraci) children olarak geçilebilir;
// App Router'da server component'in children'ı client component olabilir.

import type { ReactNode } from "react";
import Link from "next/link";

type Props = {
    title: string;
    description: string;
    children: ReactNode;
    /** Opsiyonel küçük uyarı — "resmi karar yerine geçmez" gibi. Verilmezse gösterilmez. */
    uyari?: string;
};

export function ToolLayout({ title, description, children, uyari }: Props) {
    return (
        <main className="max-w-3xl mx-auto px-6 py-12 fade-up">
            {/* Geri linki — makale sayfasındaki "Ana sayfaya dön" ile aynı desen */}
            <Link
                href="/araclar"
                className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-8 group"
            >
                <svg
                    className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                Tüm Araçlar
            </Link>

            <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                {title}
            </h1>
            <p className="text-[var(--muted)] leading-relaxed mb-8">
                {description}
            </p>

            {children}

            {uyari && (
                <div className="mt-8 flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--accent-light)]/50 p-4">
                    <span className="text-base leading-none">⚠️</span>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                        {uyari}
                    </p>
                </div>
            )}
        </main>
    );
}
