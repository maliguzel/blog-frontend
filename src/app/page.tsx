// src/app/page.tsx (Görsel İyileştirmeler)
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAdminFirestore } from "../lib/firebase-admin";
import { createSlug } from "../lib/slug";
import { MakaleFiltreleri } from "../components/MakaleFiltreleri";
import { PaginationBar } from "../components/PaginationBar";
import { Sidebar } from "../components/Sidebar";
import { LikeButton } from "../components/LikeButton";
import { ShareButton } from "../components/ShareButton";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
} from "firebase/firestore";

const SAYFA_BOYUTU = 12;

export const KATEGORILER = [
    "Spor",
    "Teknoloji",
    "Siyaset",
    "Ekonomi",
    "Eğlence",
    "Sağlık",
    "Bilim",
    "Dünya",
    "Kültür-Sanat",
    "Diğer",
];

export type Makale = {
    id: string;
    slug: string;
    baslik: string;
    seo_baslik?: string;
    gorsel_url: string;
    ozet?: string;
    kategori?: string;
    okuma_suresi?: number;
    okunma_sayisi?: number;
    olusturulma_tarihi?: Date | null;
    populer_hafta?: boolean;
};

export function katSlug(k: string) {
    return createSlug(k);
}

export function KategoriBadge({ kategori }: { kategori: string }) {
    return (
        <span className={`kategori-badge kat-${katSlug(kategori)}`}>
            {kategori}
        </span>
    );
}

async function getMakaleler(params: {
    kategori?: string;
    siralama?: string;
    arama?: string;
    sayfa: number;
}): Promise<{ makaleler: Makale[]; sonrakiSayfaVar: boolean }> {
    const { kategori, siralama, arama, sayfa } = params;

    const db = getAdminFirestore();
    let q: FirebaseFirestore.Query = db
        .collection("makaleler")
        .where("show_homepage", "==", true)
        .where("content_type", "==", "article");

    if (kategori && kategori !== "Tümü") {
        q = q.where("kategori", "==", kategori);
    }

    const sortField =
        siralama === "populer" ? "okunma_sayisi" : "olusturulma_tarihi";

    q = q.orderBy(sortField, "desc");

    if (arama?.trim()) {
        const aramaLower = arama.toLowerCase();
        const snap = await q.get();

        const filtered = snap.docs
            .map((doc) => docToMakale(doc))
            .filter(
                (m) =>
                    m.baslik?.toLowerCase().includes(aramaLower) ||
                    m.seo_baslik?.toLowerCase().includes(aramaLower) ||
                    m.ozet?.toLowerCase().includes(aramaLower),
            );

        const baslangic = (sayfa - 1) * SAYFA_BOYUTU;
        return {
            makaleler: filtered.slice(baslangic, baslangic + SAYFA_BOYUTU),
            sonrakiSayfaVar: filtered.length > sayfa * SAYFA_BOYUTU,
        };
    }

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
        populer_hafta: d.populer_hafta ?? false,
    };
}

/* ── Geliştirilmiş Makale Kartı ── */
export function MakaleKart({ m, index }: { m: Makale; index: number }) {
    const baslik = m.seo_baslik || m.baslik;
    const tarih = m.olusturulma_tarihi?.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const yeniMakale =
        m.olusturulma_tarihi &&
        Date.now() - m.olusturulma_tarihi.getTime() < 7 * 24 * 3600000;

    return (
        <article
            className="group bg-[var(--card-bg)] rounded-2xl overflow-hidden border border-[var(--border)]
                 hover:border-[var(--accent)] hover:shadow-xl hover:translate-y-[-4px]
                 transition-all duration-300 fade-up flex flex-col relative"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* Rozetler */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                {yeniMakale && (
                    <span className="inline-flex items-center gap-1 bg-[var(--accent)] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur">
                        ✨ YENİ
                    </span>
                )}
                {m.populer_hafta && (
                    <span className="inline-flex items-center gap-1 bg-[#ff6b35] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur">
                        🔥 POPÜLER
                    </span>
                )}
            </div>

            {/* Görsel */}
            <Link href={`/makale/${m.slug}`} className="block overflow-hidden">
                <div className="relative h-52 bg-gradient-to-br from-[var(--border)] to-[var(--accent-light)] overflow-hidden">
                    <Image
                        src={m.gorsel_url}
                        alt={baslik}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2VlZTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNjY2M7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIgLz48L3N2Zz4="
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
            </Link>

            {/* İçerik */}
            <div className="p-6 flex flex-col flex-1 gap-3">
                {/* Üst Kontrol */}
                <div className="flex items-center justify-between gap-2">
                    {m.kategori && <KategoriBadge kategori={m.kategori} />}
                    <div className="flex items-center gap-1">
                        <LikeButton articleId={m.id} initialLikes={0} />
                        <ShareButton url={`/makale/${m.slug}`} title={baslik} />
                    </div>
                </div>

                {/* Başlık */}
                <Link href={`/makale/${m.slug}`} className="block flex-1">
                    <h2
                        className="font-[family-name:var(--font-display)] text-xl font-bold leading-tight
                       group-hover:text-[var(--accent)] transition-colors duration-200 line-clamp-2"
                    >
                        {baslik}
                    </h2>
                </Link>

                {/* Özet */}
                {m.ozet && (
                    <p className="text-sm text-[var(--muted)] line-clamp-2 leading-relaxed">
                        {m.ozet}
                    </p>
                )}

                {/* Alt Bilgi */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]/50 mt-auto text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1">📅 {tarih}</span>
                    <span className="flex items-center gap-1">
                        👁️ {m.okunma_sayisi || 0}
                    </span>
                </div>
            </div>
        </article>
    );
}

/* ── Geliştirilmiş Öne Çıkan Makale ── */
function OncikartMakale({ m }: { m: Makale }) {
    const baslik = m.seo_baslik || m.baslik;
    return (
        <Link
            href={`/makale/${m.slug}`}
            className="group mb-12 flex flex-col md:flex-row bg-gradient-to-br from-[var(--card-bg)] to-[var(--accent-light)]/20
                 rounded-3xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)]
                 hover:shadow-2xl transition-all duration-300 fade-up"
        >
            <div className="relative md:w-3/5 h-72 md:h-auto min-h-[320px] bg-gradient-to-br from-[var(--border)] to-[var(--accent-light)] overflow-hidden">
                <Image
                    src={m.gorsel_url}
                    alt={baslik}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:from-black/50 transition-all duration-300"></div>
            </div>

            <div className="md:w-2/5 p-8 md:p-10 flex flex-col justify-center gap-4">
                <div className="inline-flex items-center gap-2 w-fit">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
                    <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-bold">
                        Öne Çıkan
                    </span>
                </div>

                {m.kategori && <KategoriBadge kategori={m.kategori} />}

                <h2
                    className="font-[family-name:var(--font-display)] text-3xl lg:text-4xl font-extrabold leading-tight
                    group-hover:text-[var(--accent)] transition-colors duration-200"
                >
                    {baslik}
                </h2>

                {m.ozet && (
                    <p className="text-base text-[var(--muted)] line-clamp-3 leading-relaxed">
                        {m.ozet}
                    </p>
                )}

                <div className="flex items-center gap-3 mt-2 pt-4 border-t border-[var(--border)]/50 text-sm text-[var(--muted)]">
                    <span>Okumaya devam et</span>
                    <svg
                        className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200"
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
                </div>
            </div>
        </Link>
    );
}

export async function generateMetadata(): Promise<Metadata> {
    return { alternates: { canonical: "/" } };
}

/* ── Hero Section ── */
function Hero({ stats }: { stats: SiteStats }) {
    // Sadece anlamlı (0 olmayan) istatistikleri göster
    const statItems = [
        {
            label: "Makale",
            value: stats.makaleSayisi,
            fmt: formatSayi(stats.makaleSayisi),
        },
        {
            label: "Toplam Okunma",
            value: stats.toplamOkunma,
            fmt: formatSayi(stats.toplamOkunma),
        },
        {
            label: "Kategori",
            value: stats.kategoriSayisi,
            fmt: `${stats.kategoriSayisi}`,
        },
    ].filter((s) => s.value > 0);

    return (
        <div className="relative mb-16 rounded-3xl overflow-hidden border border-[var(--border)] group">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-[var(--accent-light)]/20 group-hover:from-[var(--accent)]/15 transition-all duration-500"></div>

            <div className="relative backdrop-blur-sm p-8 md:p-12 lg:p-16">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
                        <span className="text-xs uppercase tracking-widest font-bold text-[var(--accent)]">
                            Güncellemeler Canlı
                        </span>
                    </div>

                    <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                        Türkiye'nin{" "}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent">
                                Gündemi
                            </span>
                            <svg
                                className="absolute -bottom-3 left-0 w-full h-3 text-[var(--accent)]"
                                viewBox="0 0 300 15"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M0,8 Q75,15 150,8 T300,8"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeWidth="2.5"
                                />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-[var(--muted)] leading-relaxed max-w-2xl">
                        Spor, teknoloji, ekonomi ve kültürden merak edilen
                        konuları
                        <span className="text-[var(--accent)] font-semibold">
                            {" "}
                            sade ve derinlemesine
                        </span>{" "}
                        analiz ediyoruz.
                    </p>

                    {/* Stats — gerçek Firestore verileri */}
                    {statItems.length > 0 && (
                        <div className="flex flex-wrap gap-8 mt-12">
                            {statItems.map((stat) => (
                                <div key={stat.label} className="flex flex-col">
                                    <span className="text-3xl md:text-4xl font-bold text-[var(--accent)]">
                                        {stat.fmt}
                                    </span>
                                    <span className="text-sm text-[var(--muted)] uppercase tracking-wider">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

type SearchParams = {
    kategori?: string;
    siralama?: string;
    sayfa?: string;
    arama?: string;
};

export default async function Home({ searchParams }: { searchParams: any }) {
    const params = await Promise.resolve(searchParams);
    const kategori = params.kategori || "Tümü";
    const siralama = params.siralama || "yeni";
    const arama = params.arama || "";
    const sayfa = Math.max(1, parseInt(params.sayfa || "1", 10));

    const { makaleler, sonrakiSayfaVar } = await getMakaleler({
        kategori,
        siralama,
        arama,
        sayfa,
    });

    const populerMakaleler = await getPopulerMakaleler();
    const siteStats = await getSiteStats();
    const filtreSiz =
        !arama && kategori === "Tümü" && siralama === "yeni" && sayfa === 1;
    const featured = filtreSiz ? makaleler[0] : null;
    const grid = filtreSiz ? makaleler.slice(1) : makaleler;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
            <Hero stats={siteStats} />

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Ana İçerik */}
                <div className="flex-1">
                    <Suspense fallback={<div className="h-24" />}>
                        <MakaleFiltreleri
                            kategoriler={KATEGORILER}
                            aktifKategori={kategori}
                            aktifSiralama={siralama}
                            aktifArama={arama}
                        />
                    </Suspense>

                    {makaleler.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="text-7xl mb-6 drop-shadow">
                                {arama ? "🔍" : "📭"}
                            </p>
                            <p className="text-2xl font-bold text-[var(--foreground)] mb-2">
                                {arama
                                    ? "Sonuç bulunamadı."
                                    : "Henüz makale yok."}
                            </p>
                            <p className="text-[var(--muted)]">
                                {arama
                                    ? "Başka bir arama terimi deneyin."
                                    : "Yakında daha fazla içerik eklenecek."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {featured && <OncikartMakale m={featured} />}
                            {grid.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                                    {grid.map((m, i) => (
                                        <MakaleKart
                                            key={m.id}
                                            m={m}
                                            index={i}
                                        />
                                    ))}
                                </div>
                            )}
                            <Suspense fallback={null}>
                                <PaginationBar
                                    mevcutSayfa={sayfa}
                                    sonrakiSayfaVar={sonrakiSayfaVar}
                                />
                            </Suspense>
                        </>
                    )}
                </div>

                {/* Sidebar */}
                {filtreSiz && (
                    <aside className="lg:w-80">
                        <Sidebar populerMakaleler={populerMakaleler} />
                    </aside>
                )}
            </div>
        </div>
    );
}

async function getPopulerMakaleler(): Promise<Makale[]> {
    const db = getAdminFirestore();
    const q = db
        .collection("makaleler")
        .where("content_type", "==", "article")
        .where("show_homepage", "==", true)
        .orderBy("okunma_sayisi", "desc")
        .limit(5);
    const snap = await q.get();
    return snap.docs.map(docToMakale);
}

/* ── Gerçek Site İstatistikleri (Firestore) ── */
type SiteStats = {
    makaleSayisi: number;
    toplamOkunma: number;
    kategoriSayisi: number;
};

async function getSiteStats(): Promise<SiteStats> {
    const db = getAdminFirestore();
    const base = db
        .collection("makaleler")
        .where("content_type", "==", "article")
        .where("show_homepage", "==", true);

    let makaleSayisi = 0;
    let toplamOkunma = 0;

    try {
        // count() ucuz: tüm dokümanları okumadan sayar
        const countSnap = await base.count().get();
        makaleSayisi = countSnap.data().count;
    } catch {
        makaleSayisi = 0;
    }

    try {
        // sum() aggregation — firebase-admin v12+ gerektirir; yoksa 0'a düşer
        const { AggregateField } = await import("firebase-admin/firestore");
        const sumSnap = await base
            .aggregate({ toplam: AggregateField.sum("okunma_sayisi") })
            .get();
        toplamOkunma = sumSnap.data().toplam ?? 0;
    } catch {
        toplamOkunma = 0;
    }

    return {
        makaleSayisi,
        toplamOkunma,
        kategoriSayisi: KATEGORILER.length,
    };
}

/* Büyük sayıları sadeleştir: 1.250 → "1,2B", 2.000.000 → "2Mn" */
function formatSayi(n: number): string {
    if (n >= 1_000_000) {
        return `${(n / 1_000_000).toFixed(1).replace(".0", "").replace(".", ",")}Mn`;
    }
    if (n >= 1_000) {
        return `${(n / 1_000).toFixed(1).replace(".0", "").replace(".", ",")}B`;
    }
    return `${n}`;
}
