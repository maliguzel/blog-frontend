"use client";

import { useMemo, useState } from "react";

// --- 6245 sayılı Harcırah Kanunu — 2026 yılı (H) Cetveli gündelik tutarları ---
// Kaynak: 2026 Yılı Merkezi Yönetim Bütçe Kanunu'na ekli (H) Cetveli.
// Tutarlar her yıl bütçe kanunuyla değiştiğinden, yeni yılda güncellenmelidir.

type GundelikKademe = {
    id: string;
    label: string;
    tutar: number;
};

const GUNDELIK_KADEMELERI: GundelikKademe[] = [
    { id: "ek-8000", label: "Ek göstergesi 8000 ve daha yüksek olan kadrolar", tutar: 890 },
    { id: "ek-6400", label: "Ek göstergesi 6400 (dahil) – 8000 (hariç) olan kadrolar", tutar: 880 },
    { id: "ek-3600", label: "Ek göstergesi 3600 (dahil) – 6400 (hariç) olan kadrolar", tutar: 870 },
    { id: "derece-1-4", label: "Aylık / kadro derecesi 1–4 olanlar", tutar: 860 },
    { id: "derece-5-15", label: "Aylık / kadro derecesi 5–15 olanlar", tutar: 850 },
    { id: "ozel", label: "Elle gir…", tutar: 0 },
];

type HesapModu = "gecici" | "yerdegis";

type KalanOran = "0" | "1/3" | "2/3" | "1";

const KALAN_ORAN_LABEL: Record<KalanOran, string> = {
    "0": "Kalan süre yok / yemek saati geçmedi",
    "1/3": "Öğle (13:00) veya akşam (19:00) yemeğinden biri geçti",
    "2/3": "Öğle ve akşam yemeğinin ikisi de geçti",
    "1": "Gece de geçirildi (tam gündelik)",
};

const KALAN_ORAN_DEGER: Record<KalanOran, number> = {
    "0": 0,
    "1/3": 1 / 3,
    "2/3": 2 / 3,
    "1": 1,
};

function formatTL(value: number) {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 2,
    }).format(value);
}

function gunFarkiSaat(baslangic: string, bitis: string): number | null {
    if (!baslangic || !bitis) return null;
    const start = new Date(baslangic).getTime();
    const end = new Date(bitis).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
    return (end - start) / (1000 * 60 * 60);
}

// Md. 39 (kalan gün oranı), Md. 42 (yurtiçi 180 gün sınırı: ilk 90 gün tam, sonraki 90 gün 2/3), Md. 33/d (konaklama üst sınırı)
function hesaplaGeciciGorev(params: {
    gundelik: number;
    baslangic: string;
    bitis: string;
    kalanOran: KalanOran;
    konaklamaVar: boolean;
    konaklamaGece: number;
}) {
    const { gundelik, baslangic, bitis, kalanOran, konaklamaVar, konaklamaGece } = params;

    const saat = gunFarkiSaat(baslangic, bitis);
    const tamGun = saat !== null ? Math.floor(saat / 24) : 0;
    const frac = KALAN_ORAN_DEGER[kalanOran];

    const normalGun = Math.min(tamGun, 90);
    const indirimliGun = Math.max(0, Math.min(tamGun - 90, 90));
    const asimGun = Math.max(0, tamGun - 180);

    const satirlar: { label: string; deger: number; uyari?: boolean }[] = [];

    satirlar.push({
        label: `Tam gün (${normalGun} gün × ${formatTL(gundelik)})`,
        deger: normalGun * gundelik,
    });

    if (indirimliGun > 0) {
        satirlar.push({
            label: `91–180. günler (${indirimliGun} gün × 2/3 × ${formatTL(gundelik)})`,
            deger: indirimliGun * gundelik * (2 / 3),
        });
    }

    if (frac > 0) {
        satirlar.push({
            label: `Kalan süre (${kalanOran === "1" ? "tam" : kalanOran})`,
            deger: frac * gundelik,
        });
    }

    let konaklamaTutari = 0;
    if (konaklamaVar && konaklamaGece > 0) {
        const n1 = Math.min(konaklamaGece, 10);
        const n2 = Math.min(Math.max(konaklamaGece - 10, 0), 80);
        const n3 = Math.max(konaklamaGece - 90, 0);
        konaklamaTutari = n1 * gundelik * 1.6 + n2 * gundelik * 1.5 + n3 * gundelik;
        satirlar.push({
            label: `Konaklama üst sınırı (${n1}g × %60 + ${n2}g × %50 + ${n3}g × normal)`,
            deger: konaklamaTutari,
        });
    }

    const toplam = satirlar.reduce((acc, s) => acc + s.deger, 0);

    return {
        tamGun,
        asimGun,
        satirlar,
        toplam,
        gecerli: saat !== null,
    };
}

// Md. 45 — yurtiçi yer değiştirme masrafı
function hesaplaYerDegistirme(params: {
    gundelik: number;
    aileFerdi: number;
    km: number;
    esMemur: boolean;
}) {
    const { gundelik, aileFerdi, km, esMemur } = params;

    const kendisi = 20 * gundelik;
    const aileHam = aileFerdi * 10 * gundelik;
    const aileSiniri = 40 * gundelik;
    const aile = Math.min(aileHam, aileSiniri);
    let kmBedeli = gundelik * 0.05 * km;
    if (esMemur) kmBedeli = kmBedeli / 2;

    const satirlar = [
        { label: "Kendisi için (20 × gündelik)", deger: kendisi },
        {
            label: `Aile ferdi (${aileFerdi} kişi × 10 × gündelik${
                aileHam > aileSiniri ? ", 40 katı sınırı uygulandı" : ""
            })`,
            deger: aile,
        },
        {
            label: `Kilometre bedeli (${km} km × %5${esMemur ? " × 1/2" : ""})`,
            deger: kmBedeli,
        },
    ];

    const toplam = satirlar.reduce((acc, s) => acc + s.deger, 0);

    return { satirlar, toplam };
}

export default function HarcirahHesaplamaAraci() {
    const [mod, setMod] = useState<HesapModu | null>(null);

    const [kademeId, setKademeId] = useState<string>("ek-3600");
    const [ozelTutar, setOzelTutar] = useState<number | "">("");

    // Geçici görev alanları
    const [baslangic, setBaslangic] = useState("");
    const [bitis, setBitis] = useState("");
    const [kalanOran, setKalanOran] = useState<KalanOran>("0");
    const [konaklamaVar, setKonaklamaVar] = useState(false);
    const [konaklamaGece, setKonaklamaGece] = useState<number | "">("");

    // Yer değiştirme alanları
    const [aileFerdi, setAileFerdi] = useState<number | "">("");
    const [km, setKm] = useState<number | "">("");
    const [esMemur, setEsMemur] = useState(false);

    const secilenKademe = GUNDELIK_KADEMELERI.find((k) => k.id === kademeId) ?? null;
    const gundelik =
        kademeId === "ozel" ? Number(ozelTutar) || 0 : secilenKademe?.tutar ?? 0;

    const geciciSonuc = useMemo(() => {
        if (mod !== "gecici" || gundelik <= 0) return null;
        return hesaplaGeciciGorev({
            gundelik,
            baslangic,
            bitis,
            kalanOran,
            konaklamaVar,
            konaklamaGece: Number(konaklamaGece) || 0,
        });
    }, [mod, gundelik, baslangic, bitis, kalanOran, konaklamaVar, konaklamaGece]);

    const yerdegisSonuc = useMemo(() => {
        if (mod !== "yerdegis" || gundelik <= 0) return null;
        return hesaplaYerDegistirme({
            gundelik,
            aileFerdi: Number(aileFerdi) || 0,
            km: Number(km) || 0,
            esMemur,
        });
    }, [mod, gundelik, aileFerdi, km, esMemur]);

    function modSec(m: HesapModu) {
        setMod(m);
    }

    function handleReset() {
        setMod(null);
        setKademeId("ek-3600");
        setOzelTutar("");
        setBaslangic("");
        setBitis("");
        setKalanOran("0");
        setKonaklamaVar(false);
        setKonaklamaGece("");
        setAileFerdi("");
        setKm("");
        setEsMemur(false);
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    2026 Harcırah Hesaplama Aracı
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                    6245 sayılı Harcırah Kanunu'na ve 2026 yılı (H) Cetveli
                    gündelik tutarlarına göre geçici görev harcırahınızı veya
                    tayin/nakil sonrası yer değiştirme masrafınızı hesaplayın.
                </p>
            </div>

            <div className="space-y-6">
                <StepHeader number={1} title="Hesaplama türü" done={!!mod} />

                <div className="border-l-2 border-slate-100 pl-4">
                    <div className="flex flex-wrap gap-2">
                        <StatuButton
                            label="Geçici Görev Harcırahı"
                            active={mod === "gecici"}
                            onClick={() => modSec("gecici")}
                        />
                        <StatuButton
                            label="Yer Değiştirme Masrafı"
                            active={mod === "yerdegis"}
                            onClick={() => modSec("yerdegis")}
                        />
                    </div>
                </div>

                {mod && (
                    <>
                        <StepHeader
                            number={2}
                            title="Günlük gündelik tutarınız"
                            done={gundelik > 0}
                        />

                        <div className="border-l-2 border-slate-100 pl-4">
                            <select
                                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-slate-900"
                                value={kademeId}
                                onChange={(e) => setKademeId(e.target.value)}
                            >
                                {GUNDELIK_KADEMELERI.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {k.id === "ozel"
                                            ? k.label
                                            : `${k.label} — ${formatTL(k.tutar)}`}
                                    </option>
                                ))}
                            </select>

                            {kademeId === "ozel" && (
                                <div className="mt-2">
                                    <MiniInput
                                        label="Gündelik tutarı (₺)"
                                        value={ozelTutar}
                                        onChange={setOzelTutar}
                                    />
                                </div>
                            )}

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                2026 yılı (H) Cetveli tutarları önden
                                dolduruldu. Türkiye düzeyinde teftiş/denetim
                                yetkisi olanlara (Md. 33/b) bu tutarın 1,3
                                katı uygulanır; bu durumda "Elle gir"i
                                seçebilirsiniz.
                            </p>
                        </div>
                    </>
                )}

                {mod === "gecici" && gundelik > 0 && (
                    <>
                        <StepHeader
                            number={3}
                            title="Görev tarihleri"
                            done={!!baslangic && !!bitis}
                        />

                        <div className="border-l-2 border-slate-100 pl-4">
                            <p className="mb-3 text-xs leading-5 text-slate-500">
                                Tam 24 saatlik her dilim tam gündelik olarak
                                sayılır (Md. 43). Kalan eksik gün için altta
                                yemek saati durumunu seçin (Md. 39).
                            </p>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-600">
                                        Görev başlangıcı
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none focus:border-slate-900"
                                        value={baslangic}
                                        onChange={(e) => setBaslangic(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-600">
                                        Görev bitişi
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none focus:border-slate-900"
                                        value={bitis}
                                        onChange={(e) => setBitis(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Kalan (son eksik) gün durumu
                                </label>
                                <select
                                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none focus:border-slate-900"
                                    value={kalanOran}
                                    onChange={(e) =>
                                        setKalanOran(e.target.value as KalanOran)
                                    }
                                >
                                    {(Object.keys(KALAN_ORAN_LABEL) as KalanOran[]).map(
                                        (k) => (
                                            <option key={k} value={k}>
                                                {KALAN_ORAN_LABEL[k]}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                        </div>

                        <StepHeader
                            number={4}
                            title="Belgeli konaklama (opsiyonel)"
                            done={false}
                        />

                        <div className="border-l-2 border-slate-100 pl-4">
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={konaklamaVar}
                                    onChange={(e) => setKonaklamaVar(e.target.checked)}
                                />
                                Konaklama bedeli faturayla talep edilecek
                            </label>

                            {konaklamaVar && (
                                <div className="mt-2 max-w-[200px]">
                                    <MiniInput
                                        label="Belgeli konaklanan gece sayısı"
                                        value={konaklamaGece}
                                        onChange={setKonaklamaGece}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-2">
                            {!geciciSonuc || !geciciSonuc.gecerli ? (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                                    Sonucu görmek için geçerli bir başlangıç ve
                                    bitiş tarihi girin.
                                </div>
                            ) : (
                                <ResultBox
                                    title="Tahmini geçici görev harcırahı"
                                    satirlar={geciciSonuc.satirlar}
                                    toplam={geciciSonuc.toplam}
                                    uyari={
                                        geciciSonuc.asimGun > 0
                                            ? `Girdiğiniz süre 180 günü aşıyor (${geciciSonuc.asimGun} gün fazla). 657 sayılı Kanun Ek 33. madde değil, 6245 sayılı Kanun Md. 42 uyarınca yurtiçinde aynı yer ve aynı iş için bir yılda en fazla 180 gün gündelik verilir; aşan kısım bu hesaba dahil edilmedi ve ayrıca değerlendirilmelidir.`
                                            : undefined
                                    }
                                />
                            )}
                        </div>
                    </>
                )}

                {mod === "yerdegis" && gundelik > 0 && (
                    <>
                        <StepHeader
                            number={3}
                            title="Aile ve mesafe bilgileri"
                            done={false}
                        />

                        <div className="border-l-2 border-slate-100 pl-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <MiniInput
                                    label="Harcıraha müstehak aile ferdi sayısı"
                                    value={aileFerdi}
                                    onChange={setAileFerdi}
                                />
                                <MiniInput
                                    label="Mesafe (km)"
                                    value={km}
                                    onChange={setKm}
                                />
                            </div>

                            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={esMemur}
                                    onChange={(e) => setEsMemur(e.target.checked)}
                                />
                                Eşim de memur/hizmetli statüsünde ve harcıraha
                                müstehak
                            </label>

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                Aile ferdi tutarı gündeliğin on katı üzerinden
                                hesaplanır ve toplamda gündeliğin kırk katını
                                aşamaz. Kilometre bedeli yalnızca memur/hizmetlinin
                                kendisi için hesaplanır; eş de memur/hizmetli ise
                                bu tutarın yarısı ödenir (Md. 45).
                            </p>
                        </div>

                        <div className="mt-2">
                            {!yerdegisSonuc ? (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                                    Sonucu görmek için gündelik tutarını
                                    doğrulayın.
                                </div>
                            ) : (
                                <ResultBox
                                    title="Tahmini yer değiştirme masrafı"
                                    satirlar={yerdegisSonuc.satirlar}
                                    toplam={yerdegisSonuc.toplam}
                                />
                            )}
                        </div>
                    </>
                )}

                {mod && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-slate-700"
                    >
                        Formu sıfırla ve baştan başla
                    </button>
                )}
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                <strong>Yasal uyarı:</strong> Bu hesaplama, 6245 sayılı
                Harcırah Kanunu'nun genel esaslarına ve 2026 yılı (H)
                Cetveli gündelik tutarlarına dayanan bir tahmindir. Müfettiş
                artırımı (Md. 33/b), arazi tazminatı (Md. 50), yurtdışı görev
                (Md. 29, 34) ve aile efradının memur/hizmetliden ayrı seyahati
                gibi özel durumlar bu araca dahil değildir. Kesin tahakkuk
                için kurumunuzun mali hizmetler birimiyle teyit edin.
            </div>
        </section>
    );
}

function StepHeader({
    number,
    title,
    done,
}: {
    number: number;
    title: string;
    done: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    done ? "bg-green-600 text-white" : "bg-slate-900 text-white"
                }`}
            >
                {done ? "✓" : number}
            </span>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
    );
}

function StatuButton({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
        >
            {label}
        </button>
    );
}

function MiniInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number | "";
    onChange: (value: number | "") => void;
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
                {label}
            </label>
            <input
                type="number"
                inputMode="decimal"
                min={0}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none focus:border-slate-900"
                value={value}
                placeholder="0"
                onChange={(e) =>
                    onChange(e.target.value === "" ? "" : Number(e.target.value))
                }
            />
        </div>
    );
}

function ResultBox({
    title,
    satirlar,
    toplam,
    uyari,
}: {
    title: string;
    satirlar: { label: string; deger: number }[];
    toplam: number;
    uyari?: string;
}) {
    return (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-900">
            <h3 className="font-bold">{title}</h3>

            <div className="mt-3 space-y-1.5 text-sm">
                {satirlar.map((s, i) => (
                    <Row key={i} label={s.label} value={formatTL(s.deger)} />
                ))}
                <Row label="Toplam" value={formatTL(toplam)} strong />
            </div>

            {uyari && (
                <p className="mt-3 rounded-lg bg-yellow-50 p-2.5 text-xs leading-5 text-yellow-900">
                    {uyari}
                </p>
            )}
        </div>
    );
}

function Row({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div
            className={`flex justify-between gap-4 border-b border-black/10 pb-1.5 last:border-0 last:pb-0 ${
                strong ? "text-base font-bold" : ""
            }`}
        >
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}