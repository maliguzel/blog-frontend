import { MetadataRoute } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

const SITE_URL = "https://www.nedirbunlar.com.tr";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const urls: MetadataRoute.Sitemap = [];

    try {
        const q = query(
            collection(db, "makaleler"),
            where("content_type", "==", "article"),
        );

        const snap = await getDocs(q);

        const kategoriler = new Set<string>();

        snap.docs.forEach((doc) => {
            const data = doc.data();

            if (!data.slug) return;
            if (data.seo_status === "noindex") return;

            if (data.kategoriSlug) {
                kategoriler.add(data.kategoriSlug);
            }

            urls.push({
                url: `${SITE_URL}/makale/${data.slug}`,
                lastModified:
                    data.guncelleme_tarihi?.toDate?.() ||
                    data.olusturulma_tarihi?.toDate?.() ||
                    new Date(),
                changeFrequency: "daily",
                priority: 0.8,
            });
        });

        kategoriler.forEach((slug) => {
            urls.push({
                url: `${SITE_URL}/kategori/${slug}`,
                lastModified: new Date(),
                changeFrequency: "daily",
                priority: 0.7,
            });
        });
    } catch (e) {
        console.error("Sitemap error:", e);
    }

    return [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        ...urls,
    ];
}
