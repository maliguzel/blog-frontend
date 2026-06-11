// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://nedirbunlar.com.tr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    let articleUrls: MetadataRoute.Sitemap = [];
    let categoryUrls: MetadataRoute.Sitemap = [];

    try {
        const snap = await getDocs(collection(db, "makaleler"));

        const kategoriler = new Set<string>();

        articleUrls = snap.docs
            .map((doc) => {
                const data = doc.data();

                // ❌ noindex içerikleri sitemap'e alma
                if (data.seo_status === "noindex") {
                    return null;
                }

                // ❌ homepage kapalı helper çöpleri alma
                if (data.show_homepage === false) {
                    return null;
                }

                if (data.kategoriSlug) {
                    kategoriler.add(data.kategoriSlug);
                }

                return {
                    url: `${SITE_URL}/makale/${data.slug}`,
                    lastModified:
                        data.guncelleme_tarihi?.toDate?.() ||
                        data.olusturulma_tarihi?.toDate?.() ||
                        new Date(),
                    changeFrequency: "weekly" as const,
                    priority: data.content_type === "helper" ? 0.6 : 0.8,
                };
            })
            .filter(Boolean) as MetadataRoute.Sitemap;

        categoryUrls = Array.from(kategoriler).map((slug) => ({
            url: `${SITE_URL}/kategori/${slug}`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.7,
        }));
    } catch (e) {
        console.error("Sitemap oluşturulurken hata:", e);
    }

    return [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },

        ...categoryUrls,
        ...articleUrls,
    ];
}
