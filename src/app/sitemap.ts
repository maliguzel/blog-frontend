// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://nedirbunlar.com.tr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    let articleUrls: MetadataRoute.Sitemap = [];

    try {
        const snap = await getDocs(collection(db, "makaleler"));
        articleUrls = snap.docs.map((doc) => {
            const data = doc.data();
            return {
                url: `${SITE_URL}/makale/${data.slug}`,
                lastModified:
                    data.guncelleme_tarihi?.toDate?.() ||
                    data.olusturulma_tarihi?.toDate?.() ||
                    new Date(),
                changeFrequency: "monthly" as const,
                priority: 0.8,
            };
        });
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
        ...articleUrls,
    ];
}
