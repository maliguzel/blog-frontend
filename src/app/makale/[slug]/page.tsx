// src/app/makale/[slug]/page.tsx
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ReadCounter } from "@/src/components/ReadCounter";
import { ShareButtons } from "@/src/components/ShareButtons";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://nedirbunlar.com.tr";

// ── Helpers ───────────────────────────────────────────────────
function katSlug(k: string) {
    return k.toLowerCase().replace(/[^a-z0-9]/g, "-");
}
interface Makale {
    id: string;
    baslik: string;
    seo_baslik?: string;
    icerik: string;
    ozet?: string;
    kategori: string;
    gorsel_url: string;
    okuma_suresi: number;
    okunma_sayisi: number;
    olusturulma_tarihi: any; // Firestore Timestamp için
    guncelleme_tarihi: any;
}
function createHeadingId(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/[ç]/g, "c")
        .replace(/[ğ]/g, "g")
        .replace(/[ı]/g, "i")
        .replace(/[ö]/g, "o")
        .replace(/[ş]/g, "s")
        .replace(/[ü]/g, "u")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function extractToc(markdown: string) {
    if (!markdown) return [];

    return markdown
        .split("\n")
        .filter((line) => line.startsWith("## "))
        .map((line) => {
            const title = line.replace("## ", "").trim();
            return {
                title,
                id: createHeadingId(title),
            };
        });
}

// 🔥 DÜZELTİLDİ: Artık belgenin Firestore ID'sini de döndürüyor
async function getMakale(slug: string): Promise<Makale | null> {
    const q = query(collection(db, "makaleler"), where("slug", "==", slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const doc = snap.docs[0];
    const data = doc.data();

    return {
        id: doc.id,
        ...data,
    } as Makale; // TypeScript'e bunun bir "Makale" olduğunu söylüyoruz
}

async function getIlgiliMakaleler(kategori: string, slugHaric: string) {
    if (!kategori) return [];
    try {
        const q = query(
            collection(db, "makaleler"),
            where("kategori", "==", kategori),
            orderBy("olusturulma_tarihi", "desc"),
            limit(4),
        );
        const snap = await getDocs(q);
        return snap.docs
            .map((d) => d.data())
            .filter((m: any) => m.slug !== slugHaric)
            .slice(0, 3);
    } catch {
        return [];
    }
}

// ── Dinamik Metadata ──────────────────────────────────────────
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const slug = (await params).slug;
    const makale = await getMakale(slug);

    if (!makale) {
        return {
            title: "Makale Bulunamadı",
            description: "Aradığınız makale mevcut değil.",
        };
    }

    const baslik = makale.seo_baslik || makale.baslik;
    const toc = extractToc(makale.icerik);
    const aciklama =
        makale.ozet ||
        (makale.icerik
            ? makale.icerik
                  .replace(/[#*`_]/g, "")
                  .slice(0, 160)
                  .trim() + "…"
            : `${baslik} hakkında güncel bir analiz.`);

    return {
        title: baslik,
        description: aciklama,
        openGraph: {
            title: baslik,
            description: aciklama,
            images: makale.gorsel_url
                ? [{ url: makale.gorsel_url, width: 1080, alt: baslik }]
                : [],
            type: "article",
            locale: "tr_TR",
            publishedTime: makale.olusturulma_tarihi?.toDate?.()?.toISOString(),
        },
        twitter: {
            card: "summary_large_image",
            title: baslik,
            description: aciklama,
            images: makale.gorsel_url ? [makale.gorsel_url] : [],
        },
    };
}

// ── Sayfa ─────────────────────────────────────────────────────
export default async function MakaleSayfasi({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const slug = (await params).slug;
    const makale = await getMakale(slug);

    if (!makale) notFound();

    const ilgiliMakaleler = await getIlgiliMakaleler(makale.kategori, slug);

    const baslik = makale.seo_baslik || makale.baslik;
    const toc = extractToc(makale.icerik);

    const tarih = makale.olusturulma_tarihi?.toDate
        ? makale.olusturulma_tarihi.toDate().toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : null;

    const guncelleme = makale.guncelleme_tarihi?.toDate
        ? makale.guncelleme_tarihi.toDate().toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : null;

    // JSON-LD Article şeması
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: baslik,
        description: makale.ozet || "",
        image: makale.gorsel_url || "",
        datePublished: makale.olusturulma_tarihi?.toDate?.()?.toISOString(),
        dateModified: makale.guncelleme_tarihi?.toDate?.()?.toISOString(),
        url: `${SITE_URL}/makale/${slug}`,
        publisher: {
            "@type": "Organization",
            name: "Günün Olayları",
            url: SITE_URL,
        },
        inLanguage: "tr",
        articleSection: makale.kategori || "Genel",
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* 🔥 DÜZELTİLDİ: Artık docId prop'u gönderiliyor */}
            <ReadCounter docId={makale.id} />

            <article className="max-w-3xl mx-auto px-6 py-12 fade-up">
                {/* Geri butonu */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-10 group"
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
                    Ana sayfaya dön
                </Link>

                {/* Kategori + okuma süresi */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {makale.kategori && (
                        <span
                            className={`kategori-badge kat-${katSlug(makale.kategori)}`}
                        >
                            {makale.kategori}
                        </span>
                    )}
                    {makale.okuma_suresi && (
                        <span className="text-xs text-[var(--muted)]">
                            📖 {makale.okuma_suresi} dakika okuma
                        </span>
                    )}
                    {makale.okunma_sayisi > 0 && (
                        <span className="text-xs text-[var(--muted)]">
                            👁 {makale.okunma_sayisi} görüntülenme
                        </span>
                    )}
                </div>

                {/* Başlık */}
                <h1
                    className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-extrabold
          leading-tight tracking-tight mb-4"
                >
                    {baslik}
                </h1>

                {/* Özet */}
                {makale.ozet && (
                    <p className="text-lg text-[var(--muted)] leading-relaxed mb-6 border-l-2 border-[var(--accent)] pl-4">
                        {makale.ozet}
                    </p>
                )}

                {/* İçindekiler */}
                {toc.length > 0 && (
                    <nav className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">📚</span>
                            <p className="font-semibold text-[var(--foreground)]">
                                İçindekiler
                            </p>
                        </div>
                        <ul className="space-y-2 text-sm">
                            {toc.map((item) => (
                                <li key={item.id}>
                                    <a
                                        href={`#${item.id}`}
                                        className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"
                                    >
                                        <span className="text-[var(--accent)]">
                                            •
                                        </span>
                                        {item.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                {/* Tarih + Paylaş */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
                    <div className="text-sm text-[var(--muted)] flex items-center gap-4">
                        {tarih && (
                            <span className="flex items-center gap-1.5">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                {tarih}
                            </span>
                        )}
                        {guncelleme && guncelleme !== tarih && (
                            <span className="text-xs">
                                (Güncellendi: {guncelleme})
                            </span>
                        )}
                    </div>
                    <ShareButtons baslik={baslik} slug={slug} />
                </div>

                {/* Kapak görseli */}
                <div className="relative w-full h-72 md:h-[420px] rounded-2xl overflow-hidden mb-10 shadow-xl">
                    <Image
                        src={makale.gorsel_url}
                        alt={baslik}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Makale metni */}
                <div className="prose prose-lg lg:prose-xl max-w-none">
                    <ReactMarkdown
                        components={{
                            h2: ({ children }) => {
                                const text = Array.isArray(children)
                                    ? children.join("")
                                    : String(children);
                                const id = createHeadingId(text);
                                return (
                                    <h2 id={id} className="scroll-mt-28">
                                        {children}
                                    </h2>
                                );
                            },
                        }}
                    >
                        {makale.icerik}
                    </ReactMarkdown>
                </div>

                {/* Alt paylaşım */}
                <div className="mt-12 pt-8 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-4">
                    <Link
                        href="/"
                        className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                    >
                        ← Diğer makalelere bak
                    </Link>
                    <ShareButtons baslik={baslik} slug={slug} />
                </div>

                {/* İlgili Makaleler */}
                {ilgiliMakaleler.length > 0 && (
                    <section className="mt-16">
                        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-6 flex items-center gap-2">
                            <span
                                className={`kategori-badge kat-${katSlug(makale.kategori)}`}
                            >
                                {makale.kategori}
                            </span>
                            İlgili Makaleler
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {ilgiliMakaleler.map((m: any) => (
                                <Link
                                    key={m.slug}
                                    href={`/makale/${m.slug}`}
                                    className="group bg-[var(--card-bg)] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-all"
                                >
                                    <div className="relative h-32 bg-[var(--border)]">
                                        <Image
                                            src={m.gorsel_url}
                                            alt={m.seo_baslik || m.baslik}
                                            fill
                                            sizes="33vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                                            {m.seo_baslik || m.baslik}
                                        </p>
                                        {m.okuma_suresi && (
                                            <p className="text-xs text-[var(--muted)] mt-1">
                                                {m.okuma_suresi} dk
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </>
    );
}
