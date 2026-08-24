import type { Metadata } from "next";
import HarcirahHesaplamaAraci from "@/src/components/tools/HarcirahHesaplamaAraci";
import { ToolLayout } from "@/src/components/tools/ToolLayout";
import { JsonLd } from "@/src/components/JsonLd";

export const metadata: Metadata = {
    title: "2026 Harcırah Hesaplama Aracı (6245 Sayılı Kanun)",
    description:
        "6245 sayılı Harcırah Kanunu ve 2026 yılı (H) Cetveli tutarlarına göre geçici görev harcırahı ve tayin/nakil sonrası yer değiştirme masrafı hesaplama aracı.",
    alternates: {
        canonical: "/araclar/harcirah-hesaplama",
    },
    openGraph: {
        title: "2026 Harcırah Hesaplama Aracı",
        description:
            "Gündelik tutarınıza, görev süresine ve aile/mesafe bilgilerinize göre tahmini geçici görev harcırahınızı veya yer değiştirme masrafınızı hesaplayın.",
        type: "website",
        url: "/araclar/harcirah-hesaplama",
    },
};

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Geçici görev harcırahında gündelik kaç güne kadar ödenir?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "6245 sayılı Harcırah Kanunu'nun 42. maddesi uyarınca, yurtiçinde aynı yerde ve aynı iş için bir yıllık dönemde aynı şahsa 180 günden fazla gündelik verilmez. İlk 90 gün için tam, takip eden 90 gün için gündeliğin 2/3'ü ödenir.",
            },
        },
        {
            "@type": "Question",
            name: "Yarım gün süren görevlendirmede gündelik nasıl hesaplanır?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Kanunun 39. maddesine göre, öğle (13.00) veya akşam (19.00) yemeği saatlerinden birini geçirenlere gündeliğin 1/3'ü, ikisini geçirenlere 2/3'ü, geceyi de geçirenlere ise tam gündelik ödenir.",
            },
        },
        {
            "@type": "Question",
            name: "Belgeli konaklama bedeli gündelikten ayrı mı ödenir?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Evet. Md. 33/d uyarınca yatacak yer temini için ödenen ve belgelenen ücret, gündeliği aşmamak kaydıyla ayrıca ödenir. Uygulamada ilk 10 gece gündeliğin %60 artırımlısı, sonraki 80 gece %50 artırımlısı üst sınır olarak esas alınır.",
            },
        },
        {
            "@type": "Question",
            name: "Yer değiştirme (tayin) masrafı nasıl hesaplanır?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Md. 45 uyarınca memur/hizmetlinin kendisi için gündeliğin 20 katı, harcıraha müstehak her aile ferdi için gündeliğin 10 katı (toplamda 40 katını aşmamak üzere) ve kat edilen her kilometre için gündeliğin yüzde beşi hesaplanarak toplanır.",
            },
        },
        {
            "@type": "Question",
            name: "Bu araç kesin harcırah tutarını verir mi?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Hayır. Bu araç yalnızca tahmini bir tutar hesaplar. Müfettiş artırımı, arazi tazminatı, yurtdışı görev ve aile efradının ayrı seyahati gibi özel durumları kapsamaz; kesin tahakkuk kurumunuzun mali hizmetler birimi tarafından yapılır.",
            },
        },
    ],
};

export default function Page() {
    return (
        <ToolLayout
            title="2026 Harcırah Hesaplama Aracı"
            description="Gündelik tutarınıza, görev başlangıç-bitiş tarihinize ve varsa aile/mesafe bilgilerinize göre 6245 sayılı Kanun'a dayalı tahmini harcırahınızı hesaplayın."
        >
            <JsonLd data={faqJsonLd} />

            <div className="space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 leading-7 text-slate-700">
                    <p>
                        Kamu kurumlarında görev yapan memur ve hizmetliler,
                        memuriyet mahalli dışına geçici bir görevle
                        gönderildiklerinde veya başka bir yere naklen/tahvilen
                        atandıklarında 6245 sayılı Harcırah Kanunu uyarınca
                        harcırah alır. Bu tutar; gündelik miktarına, görevde
                        geçirilen süreye, varsa belgeli konaklamaya veya
                        aile/mesafe bilgilerine göre değişir.
                    </p>

                    <p className="mt-3">
                        Aşağıdaki araç, 2026 yılı Merkezi Yönetim Bütçe
                        Kanunu'na ekli (H) Cetveli'nde yayımlanan gündelik
                        tutarlarını esas alarak tahmini brüt harcırahınızı
                        hesaplar.
                    </p>
                </div>

                <HarcirahHesaplamaAraci />

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Harcırahı etkileyen unsurlar
                    </h2>

                    <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-slate-700">
                        <li>
                            <strong>Gündelik tutarı:</strong> Ek gösterge veya
                            kadro derecesine göre 850–890 TL arasında değişir;
                            teftiş/denetim yetkisi olanlarda 1,3 katına kadar
                            artırılır (Md. 33/b).
                        </li>
                        <li>
                            <strong>Görev süresi:</strong> Yurtiçinde aynı yer
                            ve aynı iş için bir yılda en fazla 180 gün gündelik
                            ödenir; ilk 90 gün tam, sonraki 90 gün 2/3
                            oranındadır (Md. 42).
                        </li>
                        <li>
                            <strong>Konaklama:</strong> Belgelenen yatacak yer
                            bedeli, gündeliğin ilk 10 gece %60, sonraki 80 gece
                            %50 artırımlı üst sınırı içinde ayrıca ödenir (Md.
                            33/d).
                        </li>
                        <li>
                            <strong>Yer değiştirme masrafı:</strong> Tayin/nakil
                            durumunda kendisi için 20 kat, aile ferdi başına 10
                            kat (en fazla 40 kat) ve kilometre başına %5
                            oranında hesaplanır (Md. 45).
                        </li>
                    </ul>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Sık sorulan sorular
                    </h2>

                    <div className="mt-4 space-y-5">
                        <Faq
                            q="200 günlük bir geçici görevde tüm süre için gündelik alır mıyım?"
                            a="Hayır. 6245 sayılı Kanun Md. 42 uyarınca yurtiçinde aynı yer ve aynı iş için bir yılda en fazla 180 gün gündelik ödenir; ilk 90 gün tam, sonraki 90 gün 2/3 oranında ödenir, 180 günü aşan kısım için ayrıca değerlendirme gerekir."
                        />

                        <Faq
                            q="Görevim öğleden sonra başlayıp aynı gün akşam bitiyorsa gündelik alır mıyım?"
                            a="Öğle (13.00) veya akşam (19.00) yemeği saatlerinden birini geçirdiyseniz gündeliğin 1/3'ünü, ikisini de geçirdiyseniz 2/3'ünü alırsınız. Geceyi de geçirdiyseniz tam gündelik ödenir."
                        />

                        <Faq
                            q="Otelde kaldım, fatura tutarının tamamını alabilir miyim?"
                            a="Belgelenen konaklama bedeli, gündeliğin ilk 10 gece için %60, sonraki 80 gece için %50 artırımlı miktarını aşamaz. Bu üst sınırı aşan kısım için ödeme yapılmaz."
                        />

                        <Faq
                            q="Yer değiştirme masrafında ailemin tamamı için ayrı ayrı ödeme alır mıyım?"
                            a="Her aile ferdi için gündeliğin 10 katı hesaplanır, ancak toplam aile tutarı gündeliğin 40 katını aşamaz; yani dördüncü kişiden sonrası için ek ödeme yapılmaz."
                        />

                        <Faq
                            q="Bu araç kesin bordro/tahakkuk tutarını verir mi?"
                            a="Hayır. Bu araç yalnızca tahmini brüt tutarı hesaplar. Gerçek tutar, kurumunuzun kayıtları, güncel mevzuat ve özel durumlarınıza (arazi tazminatı, yurtdışı görev vb.) göre değişebilir."
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
