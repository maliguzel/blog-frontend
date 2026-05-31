// src/app/page.tsx
// Server Component — "use client" YOK, veri server'da çekiliyor

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { adminDb } from "../lib/firebase-admin"
import { MakaleFiltreleri } from "../components/MakaleFiltreleri";
import { PaginationBar } from "../components/PaginationBar";

// ── Sabitler ──────────────────────────────────────────────────
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

// ── Tipler ────────────────────────────────────────────────────
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
};

// ── Yardımcılar ───────────────────────────────────────────────
export function katSlug(k: string) {
    return k.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

export function KategoriBadge({ kategori }: { kategori: string }) {
    return (
        <span className={`kategori-badge kat-${katSlug(kategori)}`}>
            {kategori}
        </span>
    );
}

// ── Veri Çekme ────────────────────────────────────────────────
async function getMakaleler(params: {
    kategori?: string;
    siralama?: string;
    arama?: string;
    sayfa: number;
}): Promise<{ makaleler: Makale[]; sonrakiSayfaVar: boolean }> {
    const { kategori, siralama, arama, sayfa } = params;

    let q: FirebaseFirestore.Query = adminDb.collection("makaleler");

    // Kategori filtresi
    if (kategori && kategori !== "Tümü") {
        q = q.where("kategori", "==", kategori);
    }

    // Sıralama
    const sortField =
        siralama === "populer" ? "okunma_sayisi" : "olusturulma_tarihi";
    q = q.orderBy(sortField, "desc");

    // ── Arama: tüm dokümanları çekip Node'da filtrele ──────────
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

    // ── Normal pagination: sayfa N için cursor kullan ──────────
    // Sayfa > 1 ise önceki sayfanın son dokümanını cursor olarak al
    if (sayfa > 1) {
        const cursorSnap = await q.limit((sayfa - 1) * SAYFA_BOYUTU).get();
        const lastDoc = cursorSnap.docs.at(-1);
        if (lastDoc) q = q.startAfter(lastDoc);
    }

    // 1 fazla çekerek sonraki sayfa var mı anla
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
    };
}

// ── Makale Kartı (Server) ─────────────────────────────────────
function MakaleKart({ m, index }: { m: Makale; index: number }) {
    const baslik = m.seo_baslik || m.baslik;
    const tarih = m.olusturulma_tarihi?.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <Link
            href={`/makale/${m.slug}`}
            className="group bg-[var(--card-bg)] rounded-2xl overflow-hidden border border-[var(--border)]
                 hover:border-[var(--accent)] hover:shadow-xl transition-all duration-300
                 fade-up flex flex-col"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            <div className="relative h-48 overflow-hidden bg-[var(--border)]">
                <Image
                    src={m.gorsel_url}
                    alt={baslik}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="p-5 flex flex-col flex-1">
                {m.kategori && <KategoriBadge kategori={m.kategori} />}

                <h2
                    className="font-[family-name:var(--font-display)] text-lg font-bold leading-snug mt-2 mb-2
                       group-hover:text-[var(--accent)] transition-colors line-clamp-2"
                >
                    {baslik}
                </h2>

                {m.ozet && (
                    <p className="text-sm text-[var(--muted)] line-clamp-2 mb-3 leading-relaxed">
                        {m.ozet}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-3">
                        {tarih && <span>{tarih}</span>}
                        {m.okuma_suresi && (
                            <span>· {m.okuma_suresi} dk okuma</span>
                        )}
                    </span>
                    {!!m.okunma_sayisi && m.okunma_sayisi > 0 && (
                        <span className="flex items-center gap-1">
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                            {m.okunma_sayisi}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

// ── Öne Çıkan Kart (Server) ───────────────────────────────────
function OncikartMakale({ m }: { m: Makale }) {
    const baslik = m.seo_baslik || m.baslik;
    return (
        <Link
            href={`/makale/${m.slug}`}
            className="group mb-8 flex flex-col md:flex-row bg-[var(--card-bg)] rounded-2xl
                 overflow-hidden border border-[var(--border)] hover:border-[var(--accent)]
                 hover:shadow-2xl transition-all duration-300 fade-up"
        >
            <div className="relative md:w-3/5 h-64 md:h-auto min-h-[280px] bg-[var(--border)]">
                <Image
                    src={m.gorsel_url}
                    alt={baslik}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="md:w-2/5 p-8 flex flex-col justify-center gap-3">
                <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">
                    Öne Çıkan
                </span>
                {m.kategori && <KategoriBadge kategori={m.kategori} />}
                <h2
                    className="font-[family-name:var(--font-display)] text-3xl font-extrabold
                               leading-tight group-hover:text-[var(--accent)] transition-colors"
                >
                    {baslik}
                </h2>
                {m.ozet && (
                    <p className="text-sm text-[var(--muted)] line-clamp-3 leading-relaxed">
                        {m.ozet}
                    </p>
                )}
                <span className="text-sm text-[var(--muted)] flex items-center gap-2 mt-2">
                    Okumaya devam et
                    <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
                </span>
            </div>
        </Link>
    );
}

// ── Ana Sayfa ─────────────────────────────────────────────────
type SearchParams = {
    kategori?: string;
    siralama?: string;
    sayfa?: string;
    arama?: string;
};

export default async function Home({
    searchParams,
}: {
    // Next.js 15: Promise<SearchParams>, Next.js 14: SearchParams
    // Her ikisi de çalışır:
    searchParams: SearchParams | Promise<SearchParams>;
}) {
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

    // Filtre/arama/sıralama aktifse öne çıkan gösterme
    const filtreSiz =
        !arama && kategori === "Tümü" && siralama === "yeni" && sayfa === 1;
    const featured = filtreSiz ? makaleler[0] : null;
    const grid = filtreSiz ? makaleler.slice(1) : makaleler;

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Hero */}
            <div className="mb-10 border-b border-[var(--border)] pb-8">
                <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
                    Türkiye Gündemi
                </p>
                <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-6xl font-extrabold tracking-tight leading-none">
                    Bugünün{" "}
                    <span className="text-[var(--accent)]">Olayları</span>
                </h1>
                <p className="mt-4 text-[var(--muted)] text-lg max-w-xl">
                    Türkiye gündemindeki olayları, spor, teknoloji, ekonomi ve
                    kültür başlıklarında derinlemesine ve sade bir dille analiz
                    ediyoruz.
                </p>
            </div>

            {/* Filtreler — Client Component (useSearchParams kullanır) */}
            <Suspense fallback={<div className="h-24" />}>
                <MakaleFiltreleri
                    kategoriler={KATEGORILER}
                    aktifKategori={kategori}
                    aktifSiralama={siralama}
                    aktifArama={arama}
                />
            </Suspense>

            {/* Boş durum */}
            {makaleler.length === 0 && (
                <div className="text-center py-24 text-[var(--muted)]">
                    <p className="text-6xl mb-4">{arama ? "🔍" : "📭"}</p>
                    <p className="text-xl font-semibold">
                        {arama ? "Sonuç bulunamadı." : "Henüz makale yok."}
                    </p>
                </div>
            )}

            {/* Öne çıkan */}
            {featured && <OncikartMakale m={featured} />}

            {/* Izgara */}
            {grid.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {grid.map((m, i) => (
                        <MakaleKart key={m.id} m={m} index={i} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            <Suspense fallback={null}>
                <PaginationBar
                    mevcutSayfa={sayfa}
                    sonrakiSayfaVar={sonrakiSayfaVar}
                />
            </Suspense>
        </div>
    );
}
