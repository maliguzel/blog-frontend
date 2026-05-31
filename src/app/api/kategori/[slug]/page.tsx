// src/app/kategori/[slug]/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb } from "@/src/lib/firebase-admin";
import { createSlug } from "@/src/lib/slug";
// MakaleKart'ı anasayfadan alıyoruz — page.tsx'te `export` eklemen gerekiyor (aşağıda)
import { KATEGORILER, MakaleKart, type Makale } from "@/src/app/page";
import { PaginationBar } from "@/src/components/PaginationBar";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://nedirbunlar.com.tr";
const SAYFA_BOYUTU = 12;

// slug -> kategori adı (createSlug ile ters arama → breadcrumb ile aynı slug)
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
    let q: FirebaseFirestore.Query = adminDb
        .collection("makaleler")
        .where("kategori", "==", kategori);

    const sortField =
        siralama === "populer" ? "okunma_sayisi" : "olusturulma_tarihi";
    q = q.orderBy(sortField, "desc");

    // Cursor pagination (anasayfadaki mantıkla aynı)
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

type Params = { slug: string };
type Search = { sayfa?: string; siralama?: string };

// Bilinen 10 kategoriyi statik üret (geçerli slug listesi)
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

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Breadcrumb */}
            <nav className="text-sm text-[var(--muted)] mb-6 flex items-center gap-2">
                <Link
                    href="/"
                    className="hover:text-[var(--accent)] transition-colors"
                >
                    Ana Sayfa
                </Link>
                <span>/</span>
                <span className="text-[var(--foreground)]">{kategori}</span>
            </nav>

            {/* Başlık */}
            <div className="mb-8 border-b border-[var(--border)] pb-6">
                <span className={`kategori-badge kat-${createSlug(kategori)}`}>
                    {kategori}
                </span>
                <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-extrabold tracking-tight mt-3 leading-none">
                    {kategori}{" "}
                    <span className="text-[var(--accent)]">Haberleri</span>
                </h1>
            </div>

            {/* Sıralama (server-side linkler, client'a gerek yok) */}
            <div className="flex rounded-xl border border-[var(--border)] overflow-hidden text-sm w-fit mb-8">
                {(["yeni", "populer"] as const).map((s) => (
                    <Link
                        key={s}
                        href={`/kategori/${slug}${s === "populer" ? "?siralama=populer" : ""}`}
                        className={`px-4 py-2.5 transition-colors ${
                            siralama === s
                                ? "bg-[var(--accent)] text-white"
                                : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                    >
                        {s === "yeni" ? "🕐 En Yeni" : "🔥 Popüler"}
                    </Link>
                ))}
            </div>

            {/* Boş durum */}
            {makaleler.length === 0 && (
                <div className="text-center py-24 text-[var(--muted)]">
                    <p className="text-6xl mb-4">📭</p>
                    <p className="text-xl font-semibold">
                        Bu kategoride henüz makale yok.
                    </p>
                </div>
            )}

            {/* Izgara */}
            {makaleler.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {makaleler.map((m, i) => (
                        <MakaleKart key={m.id} m={m} index={i} />
                    ))}
                </div>
            )}

            {/* Pagination — pathname'i korur, sadece ?sayfa ekler */}
            <Suspense fallback={null}>
                <PaginationBar
                    mevcutSayfa={sayfa}
                    sonrakiSayfaVar={sonrakiSayfaVar}
                />
            </Suspense>
        </div>
    );
}
