import type { Metadata } from "next";
import NobetUcretiHesaplamaAraci from "@/src/components/tools/NobetUcretiHesaplamaAraci";
import { ToolLayout } from "@/src/components/tools/ToolLayout";
import { JsonLd } from "@/src/components/JsonLd";

export const metadata: Metadata = {
    title: "2026 Nöbet Ücreti Hesaplama Aracı (Temmuz Zamlı)",
    description:
        "657 sayılı memur, 4/B sözleşmeli personel ve 4/D sürekli işçiler için 2026 Temmuz zamlı normal, riskli birim ve bayram nöbeti ücreti hesaplama aracı.",
    alternates: {
        canonical: "/araclar/nobet-ucreti-hesaplama",
    },
    openGraph: {
        title: "2026 Nöbet Ücreti Hesaplama Aracı",
        description:
            "Unvanınıza göre saatlik nöbet ücretinizi, riskli birim ve bayram nöbeti farklarını ve 130 saat sınırını dikkate alarak hesaplayın.",
        type: "website",
        url: "/araclar/nobet-ucreti-hesaplama",
    },
};

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Aylık nöbet ücretinde 130 saat sınırı nedir?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "657 sayılı Devlet Memurları Kanunu Ek 33. maddesi uyarınca, bir ayda 130 saati aşan nöbetler için ödeme yapılmaz. 130 saati aşan kısım, ay içindeki nöbetlerin zaman sıralamasına göre belirlenir.",
            },
        },
        {
            "@type": "Question",
            name: "Riskli birim nöbet ücreti ne kadar fazla ödenir?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Riskli birimlerde (ameliyathane, yoğun bakım, diyaliz, acil servis, 112 gibi) tutulan nöbetler, normal nöbet ücretinin 1,5 katı olarak ödenir.",
            },
        },
        {
            "@type": "Question",
            name: "Bayram nöbeti ücreti ne kadar fazla ödenir?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Resmî ve dini bayramlarda tutulan nöbetler, normal nöbet ücretinin 1,25 katı olarak ödenir.",
            },
        },
        {
            "@type": "Question",
            name: "Gece nöbeti ücreti neden daha yüksek?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "20.00 - 08.00 arasında tutulan nöbet saatleri için saatlik ücret, gündüz saatlerine göre yaklaşık %10 artırımlı ödenir.",
            },
        },
    ],
};

export default function Page() {
    return (
        <ToolLayout
            title="2026 Nöbet Ücreti Hesaplama Aracı"
            description="Unvanınıza, nöbet türünüze (normal / riskli birim / bayram) ve gündüz-gece saat dağılımınıza göre 2026 Temmuz zamlı tahmini nöbet ücretinizi hesaplayın."
        >
            <JsonLd data={faqJsonLd} />

            <div className="space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 leading-7 text-slate-700">
                    <p>
                        Sağlık kurumlarında görev yapan 657 sayılı devlet
                        memurları, 4/B sözleşmeli personel ve 4/D sürekli
                        işçiler, mesai saatleri dışında tuttukları nöbetler için
                        ek ücret alır. Bu ücret; unvana, nöbetin normal, riskli
                        birim veya bayram nöbeti olmasına ve gündüz ya da gece
                        tutulmasına göre değişir.
                    </p>

                    <p className="mt-3">
                        Aşağıdaki araç, Hekimsen Sendikası’nın yayımladığı 2026
                        Temmuz zamlı saatlik nöbet ücreti tablosunu esas alarak
                        tahmini brüt nöbet ücretinizi hesaplar.
                    </p>
                </div>

                <NobetUcretiHesaplamaAraci />

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Nöbet ücretini etkileyen unsurlar
                    </h2>

                    <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-slate-700">
                        <li>
                            <strong>Unvan:</strong> Eğitim görevlisi,
                            başasistan, uzman tabip, tabip, diş tabibi, eczacı,
                            hemşire ve diğer sağlık personeli için farklı
                            saatlik ücretler uygulanır.
                        </li>
                        <li>
                            <strong>Nöbet türü:</strong> Riskli birimde
                            (ameliyathane, yoğun bakım, diyaliz, acil servis,
                            112) tutulan nöbetler 1,5 kat, resmî/dini bayram
                            nöbetleri 1,25 kat ödenir.
                        </li>
                        <li>
                            <strong>Gündüz / gece:</strong> 20.00 - 08.00 arası
                            tutulan nöbet saatleri yaklaşık %10 artırımlı
                            ödenir.
                        </li>
                        <li>
                            <strong>Aylık 130 saat sınırı:</strong> Bir ayda 130
                            saati aşan nöbetler için ödeme yapılmaz.
                        </li>
                    </ul>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Sık sorulan sorular
                    </h2>

                    <div className="mt-4 space-y-5">
                        <Faq
                            q="Bir ayda 150 saat nöbet tuttum, tamamı ödenir mi?"
                            a="Hayır. 657 sayılı Kanun Ek 33. madde uyarınca 130 saati aşan 20 saat için ödeme yapılmaz. Hangi nöbetlerin sayılacağı, ay içindeki nöbetlerin zaman sıralamasına göre belirlenir."
                        />

                        <Faq
                            q="24 saatlik bir nöbeti nasıl gündüz/gece olarak bölmeliyim?"
                            a="Nöbetinizin 20.00 - 08.00 arasına denk gelen kısmını gece, kalanını gündüz saati olarak girmeniz yeterlidir. Örneğin 08.00 - 08.00 nöbeti genellikle 12 saat gündüz, 12 saat gece olarak bölünür."
                        />

                        <Faq
                            q="Riskli birimde bayram nöbeti tuttum, hangi oran uygulanır?"
                            a="Bu durumda 'Bayramda riskli birim nöbeti' seçeneğini kullanmalısınız; bu, hem riskli birim hem bayram artışını birlikte içeren en yüksek saatlik ücrettir."
                        />

                        <Faq
                            q="Bu araç kesin bordro tutarını verir mi?"
                            a="Hayır. Bu araç yalnızca tahmini brüt tutarı hesaplar. Kesin tutar, kurumunuzun kayıtları, vergi kesintileri ve güncel mevzuata göre değişebilir."
                        />
                    </div>
                </section>
            </div>
        </ToolLayout>
    );
}

function Faq({ q, a }: { q: string; a: string }) {
    return (
        <div>
            <h3 className="font-semibold text-slate-900">{q}</h3>
            <p className="mt-1 leading-7 text-slate-700">{a}</p>
        </div>
    );
}
