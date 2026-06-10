// src/app/makale/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { adminDb } from "@/src/lib/firebase-admin";
import { createSlug, cocukMetni } from "@/src/lib/slug";
import { ReadCounter } from "@/src/components/ReadCounter";
import { ShareButtons } from "@/src/components/ShareButtons";
import { JsonLd } from "@/src/components/JsonLd";
import { makaleSchema, faqSchema, breadcrumbSchema } from "@/src/lib/schema";

export const revalidate = 3600; // sayfa 1 saat cache'lenir, sonra yenilenir
export const dynamicParams = true; // yeni slug'lar ilk istekte üretilip cache'lenir

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://nedirbunlar.com.tr";

// ── Tip ───────────────────────────────────────────────────────
interface Makale {
    id: string;
    slug: string;
    baslik: string;
    seo_baslik?: string;
    icerik: string;
    ozet?: string;
    kategori: string;
    gorsel_url: string;
    okuma_suresi: number;
    okunma_sayisi: number;
    olusturulma_tarihi: FirebaseFirestore.Timestamp | null;
    guncelleme_tarihi: FirebaseFirestore.Timestamp | null;

    
    sss?: { soru: string; cevap: string }[];

    
    paa_sorulari?: { soru: string; cevap: string }[];
}

// ── TOC (İçindekiler) — anchor'lar createSlug ile, h2 id'leriyle eşleşir ─
function extractToc(markdown: string) {
    if (!markdown) return [];
    return markdown
        .split("\n")
        .filter((line) => line.startsWith("## "))
        .map((line) => {
            const title = line.replace("## ", "").trim();
            return { title, id: createSlug(title) };
        });
}

// ── Veri çekme: doc ID = slug (otomasyon document(slug) ile kaydediyor) ─
async function getMakale(slug: string): Promise<Makale | null> {
    const doc = await adminDb.collection("makaleler").doc(slug).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Makale;
}

async function getIlgiliMakaleler(kategori: string, slugHaric: string) {
    if (!kategori) return [];
    try {
        const snap = await adminDb
            .collection("makaleler")
            .where("kategori", "==", kategori)
            .orderBy("olusturulma_tarihi", "desc")
            .limit(4)
            .get();
        return snap.docs
            .map((d) => d.data())
            .filter((m) => m.slug !== slugHaric)
            .slice(0, 3);
    } catch {
        return [];
    }
}

// ── Dinamik Metadata ──────────────────────────────────────────
export async function generateMetadata({
    params,
}: {
    params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await Promise.resolve(params);

    try {
        const doc = await adminDb.collection("makaleler").doc(slug).get();
        if (!doc.exists) return { title: "Makale Bulunamadı" };

        const d = doc.data()!;
        const baslik = d.seo_baslik || d.baslik || "Makale";
        const ozet = d.ozet || "";
        const gorsel = d.gorsel_url || "";
        const ogImageUrl = `${SITE_URL}/api/og?slug=${slug}`;

        return {
            title: baslik,
            description: ozet,
            alternates: { canonical: `/makale/${slug}` },
            openGraph: {
                title: baslik,
                description: ozet,
                url: `${SITE_URL}/makale/${slug}`,
                siteName: "Nedir Bunlar?",
                locale: "tr_TR",
                type: "article",
                images: [
                    { url: ogImageUrl, width: 1200, height: 630, alt: baslik },
                    ...(gorsel
                        ? [{ url: gorsel, width: 1080, height: 720 }]
                        : []),
                ],
            },
            twitter: {
                card: "summary_large_image",
                title: baslik,
                description: ozet,
                images: [ogImageUrl],
            },
        };
    } catch {
        return { title: "Nedir Bunlar?" };
    }
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

    const tarih = makale.olusturulma_tarihi
        ?.toDate()
        .toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const guncelleme = makale.guncelleme_tarihi
        ?.toDate()
        .toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    return (
        <>
            <JsonLd
                data={[
                    makaleSchema(makale),
                    breadcrumbSchema(makale),
                    faqSchema(makale.sss), // sss yoksa otomatik atlanır
                ]}
            />

            <ReadCounter slug={makale.slug} />

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
                        <Link href={`/kategori/${createSlug(makale.kategori)}`}>
                            <span
                                className={`kategori-badge kat-${createSlug(makale.kategori)} hover:opacity-80 transition-opacity`}
                            >
                                {makale.kategori}
                            </span>
                        </Link>
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
                <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
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

                {/* Makale metni — h2/h3 id'leri createSlug ile (TOC eşleşir) */}
                <div className="prose prose-lg lg:prose-xl max-w-none">
                    <ReactMarkdown
                        components={{
                            h2: ({ children }) => (
                                <h2
                                    id={createSlug(cocukMetni(children))}
                                    className="scroll-mt-28"
                                >
                                    {children}
                                </h2>
                            ),
                            h3: ({ children }) => (
                                <h3
                                    id={createSlug(cocukMetni(children))}
                                    className="scroll-mt-28"
                                >
                                    {children}
                                </h3>
                            ),
                        }}
                    >
                        {makale.icerik}
                    </ReactMarkdown>
                </div>

                

                {/* FAQ (varsa) — görsel akordeon */}
                {makale.sss && makale.sss.length > 0 && (
                    <section className="mt-12">
                        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-4">
                            Sık Sorulan Sorular
                        </h2>
                        <div className="space-y-3">
                            {makale.sss.map((x, i) => (
                                <details
                                    key={i}
                                    className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4"
                                >
                                    <summary className="font-semibold cursor-pointer">
                                        {x.soru}
                                    </summary>
                                    <p className="mt-2 text-[var(--muted)] leading-relaxed">
                                        {x.cevap}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </section>
                )}

                {/* 👇 PAA KODUNU BURAYA YAPIŞTIR 👇 */}
                {/* PAA (People Also Ask) */}
                {makale.paa_sorulari && makale.paa_sorulari.length > 0 && (
                    <section className="mt-12">
                        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-4 flex items-center gap-2">
                            <span>🔍</span> Bunlar da Merak Ediliyor
                        </h2>
                        <div className="space-y-3">
                            {makale.paa_sorulari.map((item, idx) => (
                                <details
                                    key={idx}
                                    className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4"
                                >
                                    <summary className="font-semibold cursor-pointer">
                                        {item.soru}
                                    </summary>
                                    <p className="mt-2 text-[var(--muted)] leading-relaxed">
                                        {item.cevap}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </section>
                )}
                {/* 👆 PAA KODU BİTİŞ 👆 */}

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
                                className={`kategori-badge kat-${createSlug(makale.kategori)}`}
                            >
                                {makale.kategori}
                            </span>
                            İlgili Makaleler
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {ilgiliMakaleler.map((m) => (
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
