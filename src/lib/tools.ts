// src/lib/tools.ts
// Tüm araçların merkezi kaydı. Yeni araç eklerken sadece buraya bir obje
// eklemen yeterli — /araclar listesi ve ilgili araç sayfasının metadata'sı
// bu diziden besleniyor, iki yerde aynı bilgiyi elle tekrar yazmıyorsun.

export type Tool = {
    title: string;
    slug: string; // /araclar/[slug] — mol-hesaplama gibi
    description: string;
    category: string; // globals.css'teki kategori renkleriyle eşleşsin (ör. "Bilim" -> kat-bilim)
    keywords: string[];
};

export const TOOLS: Tool[] = [
    {
        title: "Mol Hesaplama Aracı",
        slug: "mol-hesaplama",
        description:
            "Kütle ve molar kütle değerlerini girerek mol sayısını saniyeler içinde hesapla.",
        category: "Bilim",
        keywords: [
            "mol hesaplama",
            "mol sayısı hesaplama",
            "molar kütle",
            "kimya hesaplama aracı",
        ],
    },
];

export function getTool(slug: string): Tool | undefined {
    return TOOLS.find((t) => t.slug === slug);
}
