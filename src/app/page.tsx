"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import Link from "next/link";
import Image from "next/image";

// ── Helpers ───────────────────────────────────────────────────
function katSlug(k: string) {
    return k.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

function KategoriBadge({ kategori }: { kategori: string }) {
    return (
        <span className={`kategori-badge kat-${katSlug(kategori)}`}>
            {kategori}
        </span>
    );
}

// ── Tipler ────────────────────────────────────────────────────
type Makale = {
    id: string;
    slug: string;
    baslik: string;
    seo_baslik?: string;
    gorsel_url: string;
    ozet?: string;
    kategori?: string;
    okuma_suresi?: number;
    okunma_sayisi?: number;
    olusturulma_tarihi?: { toDate: () => Date } | null;
};

type SortKey = "yeni" | "populer";

// ── Skeleton ──────────────────────────────────────────────────
function SkeletonKart() {
    return (
        <div className="bg-[var(--card-bg)] rounded-2xl overflow-hidden border border-[var(--border)]">
            <div className="skeleton h-52 w-full" />
            <div className="p-5 space-y-3">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
            </div>
        </div>
    );
}

// ── Makale Kartı ──────────────────────────────────────────────
function MakaleKart({ m, index }: { m: Makale; index: number }) {
    const baslik = m.seo_baslik || m.baslik;
    const tarih = m.olusturulma_tarihi?.toDate
        ? m.olusturulma_tarihi.toDate().toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : null;

    return (
        <Link
            href={`/makale/${m.slug}`}
            className="group bg-[var(--card-bg)] rounded-2xl overflow-hidden border border-[var(--border)]
                 hover:border-[var(--accent)] hover:shadow-xl transition-all duration-300
                 fade-up flex flex-col"
            style={{ animationDelay: `${index * 70}ms` }}
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
                    {m.okunma_sayisi != null && m.okunma_sayisi > 0 && (
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

// ── Ana Sayfa ─────────────────────────────────────────────────
export default function Home() {
    const [makaleler, setMakaleler] = useState<Makale[]>([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [hata, setHata] = useState<string | null>(null);
    const [aktifKat, setAktifKat] = useState<string>("Tümü");
    const [arama, setArama] = useState("");
    const [siralama, setSiralama] = useState<SortKey>("yeni");

    useEffect(() => {
        async function getMakaleler() {
            try {
                const q = query(
                    collection(db, "makaleler"),
                    orderBy("olusturulma_tarihi", "desc"),
                );
                const snap = await getDocs(q);
                setMakaleler(
                    snap.docs.map(
                        (doc) => ({ id: doc.id, ...doc.data() }) as Makale,
                    ),
                );
            } catch (e) {
                console.error(e);
                setHata("Makaleler yüklenirken bir hata oluştu.");
            } finally {
                setYukleniyor(false);
            }
        }
        getMakaleler();
    }, []);

    // Benzersiz kategoriler
    const kategoriler = useMemo(() => {
        const set = new Set(
            makaleler.map((m) => m.kategori).filter(Boolean) as string[],
        );
        return ["Tümü", ...Array.from(set).sort()];
    }, [makaleler]);

    // Filtrele + sırala
    const gorunenler = useMemo(() => {
        let list = [...makaleler];
        if (aktifKat !== "Tümü")
            list = list.filter((m) => m.kategori === aktifKat);
        if (arama.trim()) {
            const q = arama.toLowerCase();
            list = list.filter(
                (m) =>
                    m.baslik.toLowerCase().includes(q) ||
                    m.seo_baslik?.toLowerCase().includes(q) ||
                    m.ozet?.toLowerCase().includes(q),
            );
        }
        if (siralama === "populer")
            list.sort(
                (a, b) => (b.okunma_sayisi ?? 0) - (a.okunma_sayisi ?? 0),
            );
        return list;
    }, [makaleler, aktifKat, arama, siralama]);

    const featured = gorunenler[0];
    const rest = gorunenler.slice(1);

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

            {/* Araç çubuğu: Arama + Sıralama */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Makale ara..."
                        value={arama}
                        onChange={(e) => setArama(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)]
                       bg-[var(--card-bg)] text-sm outline-none
                       focus:border-[var(--accent)] transition-colors"
                    />
                </div>
                <div className="flex rounded-xl border border-[var(--border)] overflow-hidden text-sm">
                    {(["yeni", "populer"] as SortKey[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setSiralama(s)}
                            className={`px-4 py-2.5 transition-colors ${
                                siralama === s
                                    ? "bg-[var(--accent)] text-white"
                                    : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
                            }`}
                        >
                            {s === "yeni" ? "🕐 En Yeni" : "🔥 Popüler"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Kategori filtreleri */}
            {!yukleniyor && kategoriler.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-8">
                    {kategoriler.map((kat) => (
                        <button
                            key={kat}
                            onClick={() => setAktifKat(kat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                                aktifKat === kat
                                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)] bg-[var(--card-bg)]"
                            }`}
                        >
                            {kat}
                        </button>
                    ))}
                </div>
            )}

            {/* Hata */}
            {hata && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
                    {hata}
                </div>
            )}

            {/* Skeleton */}
            {yukleniyor && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonKart key={i} />
                    ))}
                </div>
            )}

            {/* Boş durum */}
            {!yukleniyor && !hata && gorunenler.length === 0 && (
                <div className="text-center py-24 text-[var(--muted)]">
                    <p className="text-6xl mb-4">{arama ? "🔍" : "📭"}</p>
                    <p className="text-xl font-semibold">
                        {arama ? "Sonuç bulunamadı." : "Henüz makale yok."}
                    </p>
                    {arama && (
                        <button
                            onClick={() => setArama("")}
                            className="mt-4 text-sm text-[var(--accent)] hover:underline"
                        >
                            Aramayı temizle
                        </button>
                    )}
                </div>
            )}

            {/* İçerik */}
            {!yukleniyor && gorunenler.length > 0 && (
                <>
                    {/* Öne çıkan */}
                    {featured &&
                        !arama &&
                        aktifKat === "Tümü" &&
                        siralama === "yeni" && (
                            <Link
                                href={`/makale/${featured.slug}`}
                                className="group mb-8 flex flex-col md:flex-row bg-[var(--card-bg)] rounded-2xl
                         overflow-hidden border border-[var(--border)] hover:border-[var(--accent)]
                         hover:shadow-2xl transition-all duration-300 fade-up"
                            >
                                <div className="relative md:w-3/5 h-64 md:h-auto min-h-[280px] bg-[var(--border)]">
                                    <Image
                                        src={featured.gorsel_url}
                                        alt={
                                            featured.seo_baslik ||
                                            featured.baslik
                                        }
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
                                    {featured.kategori && (
                                        <KategoriBadge
                                            kategori={featured.kategori}
                                        />
                                    )}
                                    <h2
                                        className="font-[family-name:var(--font-display)] text-3xl font-extrabold
                               leading-tight group-hover:text-[var(--accent)] transition-colors"
                                    >
                                        {featured.seo_baslik || featured.baslik}
                                    </h2>
                                    {featured.ozet && (
                                        <p className="text-sm text-[var(--muted)] line-clamp-3 leading-relaxed">
                                            {featured.ozet}
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
                        )}

                    {/* Izgara */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(arama || aktifKat !== "Tümü" || siralama !== "yeni"
                            ? gorunenler
                            : rest
                        ).map((m, i) => (
                            <MakaleKart key={m.id} m={m} index={i} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
