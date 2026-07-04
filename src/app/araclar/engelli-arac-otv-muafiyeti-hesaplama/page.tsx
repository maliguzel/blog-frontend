import type { Metadata } from "next";
import EngelliAracOtvAraci from "@/src/components/tools/EngelliAracOtvAraci";
import { ToolLayout } from "@/src/components/tools/ToolLayout";
import { JsonLd } from "@/src/components/JsonLd";

export const metadata: Metadata = {
    title: "%40 Ortopedik Engelli ÖTV’siz Araç Uygunluk Testi 2026",
    description:
        "%40 ve üzeri ortopedik engelli olup sürücü belgesi alamayan kişiler için ÖTV'siz araç uygunluk testi ve tahmini ÖTV avantajı hesaplama aracı.",
    alternates: {
        canonical: "/araclar/engelli-arac-otv-muafiyeti-hesaplama",
    },
    openGraph: {
        title: "%40 Ortopedik Engelli ÖTV’siz Araç Uygunluk Testi",
        description:
            "Ortopedik engel oranı, sürücü belgesi alamaz şartı, araç sınıfı, yerli katkı oranı ve fiyat sınırına göre ön uygunluk kontrolü.",
        type: "website",
        url: "/araclar/engelli-arac-otv-muafiyeti-hesaplama",
    },
};

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "%40 ortopedik engelli olan herkes ÖTV'siz araç alabilir mi?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Hayır. Ortopedik engel oranının %40 ve üzeri olması yanında, ortopedik engel nedeniyle sürücü belgesi alamayacağına dair değerlendirme, uygun sağlık kurulu raporu ve araç şartlarının da sağlanması gerekir.",
            },
        },
        {
            "@type": "Question",
            name: "Toplam engel oranı mı ortopedik engel oranı mı önemlidir?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Bu düzenlemede toplam engel oranından ziyade raporda yer alan ortopedik engel oranı önemlidir. Ortopedik engel oranının %40 ve üzeri olması aranır.",
            },
        },
        {
            "@type": "Question",
            name: "2026 engelli araç ÖTV muafiyeti fiyat sınırı nedir?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "2026 yılı için 87.03 kapsamındaki araçlarda vergiler dahil bedelin 2.873.900 TL'nin altında olması gerekir.",
            },
        },
        {
            "@type": "Question",
            name: "Yerli katkı oranı şartı var mı?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Evet. Düzenleme kapsamında araçta en az %40 yerli katkı oranı şartı aranır.",
            },
        },
    ],
};

export default function Page() {
    return (
        <ToolLayout
            title="%40 Ortopedik Engelli ÖTV’siz Araç Uygunluk Testi"
            description="Ortopedik engel oranı, sürücü belgesi alamaz şartı, araç sınıfı, yerli katkı oranı ve fiyat sınırına göre 2026 yılı için ön uygunluk kontrolü yapın."
        >
            <JsonLd data={faqJsonLd} />

            <div className="space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 leading-7 text-slate-700">
                    <p>
                        2026 yılı düzenlemesine göre, ortopedik engel oranı %40
                        ve üzeri olan ve ortopedik engeli nedeniyle sürücü
                        belgesi alamayacağına karar verilen kişiler belirli
                        şartlarla ÖTV istisnasından yararlanabilir.
                    </p>

                    <p className="mt-3">
                        Aşağıdaki araç; ortopedik engel oranı, sağlık kurulu
                        raporu, sürücü belgesi alamaz değerlendirmesi, araç
                        sınıfı, yerli katkı oranı ve fiyat sınırına göre ön
                        kontrol yapar.
                    </p>
                </div>

                <EngelliAracOtvAraci />

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Kimler için hazırlanmıştır?
                    </h2>

                    <div className="mt-3 space-y-3 leading-7 text-slate-700">
                        <p>
                            Bu hesaplama aracı, özellikle “%40 ortopedik
                            engelliyim, ehliyet alamıyorum, ÖTV’siz araç
                            alabilir miyim?” sorusuna ön cevap vermek için
                            hazırlanmıştır.
                        </p>

                        <p>
                            Toplam engel oranı yüksek olsa bile, bu düzenlemede
                            ayrıca ortopedik engel oranı ve ortopedik engel
                            nedeniyle sürücü belgesi alamaz değerlendirmesi
                            önemlidir.
                        </p>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Dikkat edilmesi gereken şartlar
                    </h2>

                    <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-slate-700">
                        <li>
                            Ortopedik engel oranının %40 ve üzeri olması
                            gerekir.
                        </li>
                        <li>
                            Ortopedik engel nedeniyle sürücü belgesi alamaz
                            değerlendirmesi bulunmalıdır.
                        </li>
                        <li>Engellilik sağlık kurulu raporu bulunmalıdır.</li>
                        <li>
                            Araç 87.03, 87.04 veya 87.11 kapsamında olmalıdır.
                        </li>
                        <li>Yerli katkı oranı en az %40 olmalıdır.</li>
                        <li>
                            87.03 kapsamındaki araçlarda vergiler dahil bedel
                            2.873.900 TL’nin altında olmalıdır.
                        </li>
                        <li>
                            87.04 kapsamındaki araçlarda motor silindir hacmi
                            2800 cm³ veya altında olmalıdır.
                        </li>
                    </ul>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Sık sorulan sorular
                    </h2>

                    <div className="mt-4 space-y-5">
                        <Faq
                            q="%60 toplam engelim var ama ortopedik oranım %30. Yararlanabilir miyim?"
                            a="Bu düzenlemede toplam engel oranı tek başına yeterli değildir. Ortopedik engel oranının ayrıca %40 ve üzeri olması gerekir."
                        />

                        <Faq
                            q="%45 ortopedik engelliyim ama ehliyet alabiliyorum. Yararlanabilir miyim?"
                            a="Bu özel düzenlemede ortopedik engel nedeniyle sürücü belgesi alamaz değerlendirmesi önemlidir. Bu şart yoksa uygunluk oluşmayabilir."
                        />

                        <Faq
                            q="Aracın yerli katkı oranını nereden öğrenebilirim?"
                            a="Yerli katkı oranı araç modeli bazında değişebilir. Satıcı firma, distribütör veya ilgili resmi listeler üzerinden teyit edilmelidir."
                        />

                        <Faq
                            q="Bu araç kesin sonuç verir mi?"
                            a="Hayır. Bu araç yalnızca ön bilgilendirme sağlar. Nihai karar sağlık kurulu raporu, araç bilgileri ve vergi dairesi kontrolüne göre verilir."
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
