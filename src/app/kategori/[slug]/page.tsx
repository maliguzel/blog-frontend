// src/app/kategori/[slug]/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminFirestore } from "@/src/lib/firebase-admin";
import { createSlug } from "@/src/lib/slug";
import { KATEGORILER, MakaleKart, type Makale } from "@/src/app/page";
import { PaginationBar } from "@/src/components/PaginationBar";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://nedirbunlar.com.tr";
const SAYFA_BOYUTU = 12;

function slugToKategori(slug: string): string | null {
    return KATEGORILER.find((k) => createSlug(k) === slug) ?? null;
}

function docToMakale(doc: FirebaseFirestore.QueryDocumentSnapshot): Makale {
    const d = doc.data();
    return {
        id: doc.id,
        slug: d.slug,
        baslik: d.baslik,
        seo_baslik: d.seo_baslik,
        gorsel_url: d.gorsel_url,
        ozet: d.ozet,
        kategori: d.kategori,
        okuma_suresi: d.okuma_suresi,
        okunma_sayisi: d.okunma_sayisi,
        olusturulma_tarihi: d.olusturulma_tarihi?.toDate?.() ?? null,
    };
}

async function getKategoriMakaleleri(
    kategori: string,
    siralama: string,
    sayfa: number,
): Promise<{ makaleler: Makale[]; sonrakiSayfaVar: boolean }> {
    const db = getAdminFirestore();
    let q: FirebaseFirestore.Query = db
        .collection("makaleler")
        .where("kategori", "==", kategori)
        .where("show_homepage", "==", true)
        .where("content_type", "==", "article");

    const sortField =
        siralama === "populer" ? "okunma_sayisi" : "olusturulma_tarihi";
    q = q.orderBy(sortField, "desc");

    try {
        if (sayfa > 1) {
            const cursorSnap = await q.limit((sayfa - 1) * SAYFA_BOYUTU).get();
            const lastDoc = cursorSnap.docs.at(-1);
            if (lastDoc) q = q.startAfter(lastDoc);
        }

        const snap = await q.limit(SAYFA_BOYUTU + 1).get();
        const sonrakiSayfaVar = snap.docs.length > SAYFA_BOYUTU;
        return {
            makaleler: snap.docs.slice(0, SAYFA_BOYUTU).map(docToMakale),
            sonrakiSayfaVar,
        };
    } catch {
        // NOT: bu sorgu, her sıralama alanı için ayrı composite index ister:
        //   kategori + show_homepage + content_type + olusturulma_tarihi(desc)
        //   kategori + show_homepage + content_type + okunma_sayisi(desc)
        // İkisi de Firebase Console > Indexes'te olmalı; yoksa burası boş döner.
        return { makaleler: [], sonrakiSayfaVar: false };
    }
}

type Params = { slug: string };
type Search = { sayfa?: string; siralama?: string };

export function generateStaticParams() {
    return KATEGORILER.map((k) => ({ slug: createSlug(k) }));
}

export async function generateMetadata({
    params,
}: {
    params: Params | Promise<Params>;
}): Promise<Metadata> {
    const { slug } = await Promise.resolve(params);
    const kategori = slugToKategori(slug);
    if (!kategori) return { title: "Kategori Bulunamadı" };

    const baslik = `${kategori} Haberleri ve Son Gelişmeler`;
    const aciklama = `${kategori} kategorisindeki güncel trendler, olaylar ve merak edilenler — Nedir Bunlar?`;

    return {
        title: baslik,
        description: aciklama,
        alternates: { canonical: `/kategori/${slug}` },
        openGraph: {
            title: baslik,
            description: aciklama,
            url: `${SITE_URL}/kategori/${slug}`,
            type: "website",
        },
    };
}

export default async function KategoriSayfasi({
    params,
    searchParams,
}: {
    params: Params | Promise<Params>;
    searchParams: Search | Promise<Search>;
}) {
    const { slug } = await Promise.resolve(params);
    const sp = await Promise.resolve(searchParams);

    const kategori = slugToKategori(slug);
    if (!kategori) notFound();

    const siralama = sp.siralama === "populer" ? "populer" : "yeni";
    const sayfa = Math.max(1, parseInt(sp.sayfa || "1", 10));

    const { makaleler, sonrakiSayfaVar } = await getKategoriMakaleleri(
        kategori,
        siralama,
        sayfa,
    );

    // Kategori emoji'leri
    const categoryEmojis: Record<string, string> = {
        Spor: "⚽",
        Teknoloji: "💻",
        Siyaset: "🗳️",
        Ekonomi: "📊",
        Eğlence: "🎬",
        Sağlık: "⚕️",
        Bilim: "🔬",
        Dünya: "🌍",
        "Kültür-Sanat": "🎨",
        Diğer: "📌",
    };

    const emoji = categoryEmojis[kategori] || "📌";

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
            {/* ── Modern Breadcrumb ── */}
            <nav className="text-sm mb-8 flex items-center gap-2 fade-up">
                <Link
                    href="/"
                    className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-200 flex items-center gap-1"
                >
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
                            d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m-4 4L9 9"
                        />
                    </svg>
                    Ana Sayfa
                </Link>
                <span className="text-[var(--border)]">/</span>
                <span className="text-[var(--foreground)] font-semibold">
                    {emoji} {kategori}
                </span>
            </nav>

            {/* ── Hero Section ── */}
            <div className="mb-14 rounded-3xl overflow-hidden border border-[var(--border)] group">
                {/* Dekoratif Arka Plan */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/8 via-transparent to-[var(--accent-light)]/12 pointer-events-none"></div>

                {/* İçerik */}
                <div className="relative bg-gradient-to-br from-[var(--card-bg)] to-[var(--accent-light)]/20 px-8 md:px-12 lg:px-16 py-12 md:py-16">
                    <div className="space-y-4 max-w-3xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 w-fit">
                            <span className="text-2xl">{emoji}</span>
                            <span className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-widest text-[var(--accent)]">
                                Kategori
                            </span>
                        </div>

                        {/* Başlık */}
                        <div>
                            <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4">
                                {kategori}{" "}
                                <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent">
                                    Haberleri
                                </span>
                            </h1>

                            {/* Açıklama */}
                            <p className="text-lg text-[var(--muted)] max-w-2xl leading-relaxed">
                                {kategori} kategorisindeki güncel trendler,
                                olaylar ve merak edilenler hakkında
                                derinlemesine analiz ve köşeli bakış.
                            </p>
                        </div>

                        {/* İstatistik */}
                        <div className="flex flex-wrap gap-6 pt-6 border-t border-[var(--border)]">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-[var(--accent)]">
                                    {makaleler.length}
                                </span>
                                <span className="text-xs text-[var(--muted)] uppercase tracking-wider font-medium">
                                    Bu Sayfada
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-[var(--accent)]">
                                    📰
                                </span>
                                <span className="text-xs text-[var(--muted)] uppercase tracking-wider font-medium">
                                    Güncel
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Sıralama Kontrolleri ── */}
            <div
                className="flex items-center justify-between mb-10 gap-4 flex-wrap fade-up"
                style={{ animationDelay: "100ms" }}
            >
                <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-[var(--muted)] mb-3">
                        Sırala
                    </p>
                    <div className="flex rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--card-bg)] shrink-0">
                        {(
                            [
                                { value: "yeni", label: "🕐 En Yeni" },
                                { value: "populer", label: "🔥 Popüler" },
                            ] as const
                        ).map((s) => (
                            <Link
                                key={s.value}
                                href={`/kategori/${slug}${
                                    s.value === "populer"
                                        ? "?siralama=populer"
                                        : ""
                                }`}
                                className={`px-5 py-3 text-sm font-semibold transition-all duration-200
                                    ${
                                        siralama === s.value
                                            ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white shadow-lg"
                                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                                    }`}
                            >
                                {s.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Makale Sayısı */}
                <div className="text-right">
                    <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-medium">
                        Bu sayfada
                    </p>
                    <p className="text-3xl font-bold text-[var(--accent)]">
                        {makaleler.length}
                    </p>
                </div>
            </div>

            {/* ── Boş Durum ── */}
            {makaleler.length === 0 && (
                <div className="text-center py-32">
                    <p className="text-8xl mb-6 drop-shadow">📭</p>
                    <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
                        Henüz Makale Yok
                    </h2>
                    <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
                        Bu kategoride yakında ilginç içerikler eklenecektir.
                        Daha sonra tekrar ziyaret edin.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                    >
                        Ana Sayfaya Dön
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
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </Link>
                </div>
            )}

            {/* ── Makale Izgarası ── */}
            {makaleler.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {makaleler.map((m, i) => (
                        <MakaleKart key={m.id} m={m} index={i} />
                    ))}
                </div>
            )}

            {/* ── Pagination ── */}
            {makaleler.length > 0 && (
                <Suspense fallback={null}>
                    <PaginationBar
                        mevcutSayfa={sayfa}
                        sonrakiSayfaVar={sonrakiSayfaVar}
                    />
                </Suspense>
            )}
        </div>
    );
}
