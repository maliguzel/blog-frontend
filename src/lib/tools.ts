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
    {
        title: "%40 Ortopedik Engelli ÖTV’siz Araç Uygunluk Testi",
        slug: "engelli-arac-otv-muafiyeti-hesaplama",
        description:
            "Ortopedik engel oranı, sürücü belgesi alamaz şartı, araç sınıfı, yerli katkı oranı ve fiyat sınırına göre 2026 yılı için ön uygunluk kontrolü yapın.",
        category: "Hukuk / Vergi",
        keywords: [
            "engelli araç",
            "ÖTV muafiyeti",
            "ortopedik engelli",
            "araç alımı",
            "vergi muafiyeti",
            "uygunluk testi",
            "2026",
        ],
    },
    {
        title: "2026 Nöbet Ücreti Hesaplama Aracı",
        slug: "nobet-ucreti-hesaplama",
        description:
            "657 sayılı memur, 4/B sözleşmeli personel ve 4/D sürekli işçiler için 2026 Temmuz zamlı normal, riskli birim ve bayram nöbeti ücreti hesaplama aracı.",
        category: "Sağlık / Bordro",
        keywords: [
            "nöbet ücreti hesaplama",
            "riskli birim nöbet ücreti",
            "bayram nöbet ücreti",
            "sağlık personeli nöbet ücreti",
            "657 nöbet ücreti",
            "4b sözleşmeli nöbet ücreti",
            "2026",
        ],
    },
];

export function getTool(slug: string): Tool | undefined {
    return TOOLS.find((t) => t.slug === slug);
}
