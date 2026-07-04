// src/app/sitemap.ts
// Admin SDK ile (security rules'a takılmaz) + tüm site genelinde tek domain
// (NEXT_PUBLIC_SITE_URL) + ISR (her istekte tam tarama yerine saatlik yeniden üretim).

import { MetadataRoute } from "next";
import { getAdminFirestore } from "@/src/lib/firebase-admin";
import { createSlug } from "@/src/lib/slug";
import { TOOLS } from "@/src/lib/tools";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://nedirbunlar.com.tr";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const makaleUrls: MetadataRoute.Sitemap = [];
    // kategori slug -> o kategorideki en yeni makale tarihi (lastModified için)
    const kategoriSonGuncelleme = new Map<string, Date>();

    try {
        const db = getAdminFirestore();
        const snap = await db
            .collection("makaleler")
            .where("content_type", "==", "article")
            .get();

        snap.docs.forEach((doc) => {
            const d = doc.data();
            if (!d.slug) return;
            if (d.seo_status === "noindex") return;

            const guncelleme: Date =
                d.guncelleme_tarihi?.toDate?.() ||
                d.olusturulma_tarihi?.toDate?.() ||
                new Date();

            makaleUrls.push({
                url: `${SITE_URL}/makale/${d.slug}`,
                lastModified: guncelleme,
                changeFrequency: "daily",
                priority: 0.8,
            });

            // Kategori slug'ını route ile AYNI şekilde üret (kategoriSlug alanına
            // güvenme — yoksa/farklıysa URL 404 olur). createSlug tek kaynak.
            if (d.kategori) {
                const kslug = createSlug(d.kategori);
                const mevcut = kategoriSonGuncelleme.get(kslug);
                if (!mevcut || guncelleme > mevcut) {
                    kategoriSonGuncelleme.set(kslug, guncelleme);
                }
            }
        });
    } catch (e) {
        console.error("Sitemap error:", e);
    }

    const kategoriUrls: MetadataRoute.Sitemap = Array.from(
        kategoriSonGuncelleme.entries(),
    ).map(([slug, lastModified]) => ({
        url: `${SITE_URL}/kategori/${slug}`,
        lastModified, // sabit "şimdi" değil — o kategorinin en yeni makale tarihi
        changeFrequency: "daily",
        priority: 0.7,
    }));

    // ── Araçlar: /araclar ana sayfası + tools.ts'teki her araç sayfası ──
    // Tek kaynak tools.ts olduğu için yeni araç eklendiğinde burada elle
    // güncelleme gerekmiyor; TOOLS'a bir obje eklemek yeterli.
    const araclarUrls: MetadataRoute.Sitemap = [
        {
            url: `${SITE_URL}/araclar`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        ...TOOLS.map((tool) => ({
            url: `${SITE_URL}/araclar/${tool.slug}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.8,
        })),
    ];

    return [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        ...makaleUrls,
        ...kategoriUrls,
        ...araclarUrls,
    ];
}
