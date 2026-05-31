// src/lib/schema.ts
// Tüm JSON-LD şema üreticileri. Saf fonksiyonlar — server'da çalışır.

import { createSlug } from "@/src/lib/slug";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://nedirbunlar.com.tr";
const SITE_ADI = "Nedir Bunlar?";

// Hem JS Date'i hem Firestore Timestamp'i ({toDate()}) kabul eder
type ZamanGibi = Date | { toDate?: () => Date } | null | undefined;

// Firestore makale dökümanının ilgili alanları
export type SchemaMakale = {
    slug: string;
    baslik: string;
    seo_baslik?: string;
    ozet?: string;
    gorsel_url: string;
    kategori?: string;
    olusturulma_tarihi?: ZamanGibi;
    guncelleme_tarihi?: ZamanGibi;
    sss?: { soru: string; cevap: string }[]; // madde 9 — FAQ
};

// Date VEYA Firestore Timestamp → ISO string
function iso(d?: ZamanGibi): string | undefined {
    if (!d) return undefined;
    if (d instanceof Date) return d.toISOString();
    if (typeof (d as { toDate?: () => Date }).toDate === "function") {
        return (d as { toDate: () => Date }).toDate().toISOString();
    }
    return undefined;
}

// Yayıncı (Organization). logo.png'yi public/'e koy — Google rich result ister.
const YAYINCI = {
    "@type": "Organization",
    name: SITE_ADI,
    url: SITE_URL,
    logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`, // önerilen ~600x60, beyaz zemin
    },
};

// ── NewsArticle ──────────────────────────────────────────────
export function makaleSchema(m: SchemaMakale) {
    const url = `${SITE_URL}/makale/${m.slug}`;
    return {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        headline: (m.seo_baslik || m.baslik || "").slice(0, 110), // Google ~110 sınırı
        description: m.ozet,
        image: m.gorsel_url ? [m.gorsel_url] : undefined,
        datePublished: iso(m.olusturulma_tarihi),
        dateModified: iso(m.guncelleme_tarihi) || iso(m.olusturulma_tarihi),
        // İçerik otomatik üretildiği için yazar = kurum (sahte kişi uydurma!)
        author: { "@type": "Organization", name: SITE_ADI, url: SITE_URL },
        publisher: YAYINCI,
        articleSection: m.kategori,
        inLanguage: "tr-TR",
    };
}

// ── FAQPage (madde 9 ile) ────────────────────────────────────
export function faqSchema(sss?: { soru: string; cevap: string }[]) {
    if (!sss?.length) return null;
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: sss.map((x) => ({
            "@type": "Question",
            name: x.soru,
            acceptedAnswer: { "@type": "Answer", text: x.cevap },
        })),
    };
}

// ── BreadcrumbList ───────────────────────────────────────────
export function breadcrumbSchema(m: SchemaMakale) {
    const ogeler: { name: string; url: string }[] = [
        { name: "Ana Sayfa", url: SITE_URL },
    ];
    if (m.kategori) {
        ogeler.push({
            name: m.kategori,
            url: `${SITE_URL}/kategori/${createSlug(m.kategori)}`,
        });
    }
    ogeler.push({
        name: m.seo_baslik || m.baslik,
        url: `${SITE_URL}/makale/${m.slug}`,
    });

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: ogeler.map((o, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: o.name,
            item: o.url,
        })),
    };
}

// ── WebSite + Organization (ana sayfa / layout için, opsiyonel) ─
export function siteSchema() {
    return [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_ADI,
            url: SITE_URL,
            inLanguage: "tr-TR",
        },
        { "@context": "https://schema.org", ...YAYINCI },
    ];
}
