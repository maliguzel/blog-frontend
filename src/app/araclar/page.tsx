// src/app/araclar/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/src/components/JsonLd";
import { createSlug } from "@/src/lib/slug";
import { TOOLS } from "@/src/lib/tools";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://nedirbunlar.com.tr";

export const metadata: Metadata = {
    title: "Araçlar",
    description:
        "Günlük hayatı kolaylaştıran ücretsiz hesaplama ve dönüştürme araçları.",
    alternates: { canonical: "/araclar" },
    openGraph: {
        title: "Araçlar | Nedir Bunlar?",
        description:
            "Günlük hayatı kolaylaştıran ücretsiz hesaplama ve dönüştürme araçları.",
        url: `${SITE_URL}/araclar`,
        type: "website",
    },
};

// CollectionPage şeması — her aracı hasPart olarak listeler.
// (schema.ts'teki üreticiler makale odaklı olduğu için burada ayrı, sade bir
// obje kuruyoruz; makale şemalarıyla karışmasın diye tools.ts'e bağımlı.)
function araclarSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Araçlar",
        url: `${SITE_URL}/araclar`,
        inLanguage: "tr-TR",
        hasPart: TOOLS.map((t) => ({
            "@type": "SoftwareApplication",
            name: t.title,
            url: `${SITE_URL}/araclar/${t.slug}`,
            applicationCategory: t.category,
            description: t.description,
        })),
    };
}

export default function AraclarSayfasi() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-12 fade-up">
            <JsonLd data={araclarSchema()} />

            <div className="mb-10">
                <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-3">
                    Araçlar
                </p>
                <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                    Hızlı Hesaplama Araçları
                </h1>
                <p className="text-lg text-[var(--muted)] max-w-2xl leading-relaxed">
                    Günlük hayatta işine yarayacak, ücretsiz ve reklamsız küçük
                    araçlar. Zamanla yenileri eklenecek.
                </p>
            </div>

            {TOOLS.length === 0 ? (
                <div className="text-center py-24">
                    <p className="text-6xl mb-4">🧰</p>
                    <p className="text-[var(--muted)]">
                        Şu anda listelenecek bir araç yok.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {TOOLS.map((tool) => (
                        <Link
                            key={tool.slug}
                            href={`/araclar/${tool.slug}`}
                            className="card p-6 flex flex-col gap-3"
                        >
                            <span
                                className={`kategori-badge kat-${createSlug(tool.category)} w-fit`}
                            >
                                {tool.category}
                            </span>
                            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)]">
                                {tool.title}
                            </h2>
                            <p className="text-sm text-[var(--muted)] leading-relaxed">
                                {tool.description}
                            </p>
                            <span className="mt-auto text-sm font-semibold text-[var(--accent)] inline-flex items-center gap-1">
                                Aracı kullan →
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
