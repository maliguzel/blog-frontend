// src/app/robots.ts
import { MetadataRoute } from "next";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://nedirbunlar.com.tr";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // Sadece mutasyon endpoint'leri; /api/og'yi BİLEREK bloklamıyoruz
            // (OG görselinin taranabilir kalması için). Blanket "/api/" verme.
            disallow: ["/api/view", "/api/revalidate"],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL, // tercih edilen tek host (www / www'suz netliği)
    };
}
