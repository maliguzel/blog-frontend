// src/app/araclar/mol-hesaplama/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolLayout } from "@/src/components/tools/ToolLayout";
import { MolHesaplamaAraci } from "@/src/components/tools/MolHesaplamaAraci";
import { JsonLd } from "@/src/components/JsonLd";
import { faqSchema } from "@/src/lib/schema";
import { getTool } from "@/src/lib/tools";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://nedirbunlar.com.tr";
const SLUG = "mol-hesaplama";

// SSS — hem sayfada akordeon olarak gösterilir hem faqSchema() ile FAQPage
// yapısal verisine dönüştürülür (schema.ts'teki üretici makale şemasıyla aynı,
// tekrar tekrar yazmaya gerek yok).
const SSS = [
    {
        soru: "Mol nedir?",
        cevap: "Mol, kimyada madde miktarını ifade etmek için kullanılan SI birimidir. Bir mol madde, yaklaşık 6,022 × 10²³ tane (Avogadro sayısı kadar) tanecik (atom, molekül vb.) içerir.",
    },
    {
        soru: "Mol sayısı nasıl hesaplanır?",
        cevap: "Mol sayısı, maddenin kütlesinin (gram) molar kütlesine (g/mol) bölünmesiyle bulunur: mol = kütle / molar kütle.",
    },
    {
        soru: "Molar kütleyi nereden bulabilirim?",
        cevap: "Molar kütle, bir maddenin periyodik tablodaki atom ağırlıklarının toplamıdır ve genellikle g/mol biriminde verilir. Örneğin suyun (H₂O) molar kütlesi yaklaşık 18 g/mol'dür.",
    },
];

export async function generateMetadata(): Promise<Metadata> {
    const tool = getTool(SLUG);
    if (!tool) return { title: "Araç Bulunamadı" };

    return {
        title: tool.title,
        description: tool.description,
        keywords: tool.keywords,
        alternates: { canonical: `/araclar/${tool.slug}` },
        openGraph: {
            title: `${tool.title} | Nedir Bunlar?`,
            description: tool.description,
            url: `${SITE_URL}/araclar/${tool.slug}`,
            type: "website",
        },
    };
}

export default function MolHesaplamaSayfasi() {
    const tool = getTool(SLUG);
    if (!tool) notFound();

    return (
        <>
            <JsonLd data={faqSchema(SSS)} />

            <ToolLayout
                title={tool.title}
                description={tool.description}
                uyari="Bu araç eğitim ve pratik amaçlıdır; hassas laboratuvar hesaplamaları için resmi kaynaklara başvurun."
            >
                <MolHesaplamaAraci />

                {/* Kısa açıklama */}
                <section className="mt-10 prose max-w-none">
                    <h2>Mol Hesaplama Nasıl Yapılır?</h2>
                    <p>
                        Bir maddenin mol sayısını bulmak için kütlesini (gram
                        cinsinden) molar kütlesine (g/mol cinsinden) bölmen
                        yeterli. Yukarıdaki araca iki değeri gir, sonucu anında
                        gör.
                    </p>
                </section>

                {/* SSS — görsel akordeon (makale sayfasındaki desenle aynı) */}
                <section className="mt-10">
                    <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-4">
                        Sık Sorulan Sorular
                    </h2>
                    <div className="space-y-3">
                        {SSS.map((x, i) => (
                            <details
                                key={i}
                                className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4"
                            >
                                <summary className="font-semibold cursor-pointer">
                                    {x.soru}
                                </summary>
                                <p className="mt-2 text-[var(--muted)] leading-relaxed">
                                    {x.cevap}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>
            </ToolLayout>
        </>
    );
}
