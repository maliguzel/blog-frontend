"use client";

import { useMemo, useState } from "react";

// --- 2026 Temmuz zamlı nöbet ücreti tablosu (Hekimsen kaynaklı) ---
// Tüm tutarlar saatlik brüt TL. "gunduz" = normal saatlik ücret,
// "gece" = 20.00-08.00 arası uygulanan %10 artırımlı saatlik ücret.

type RateSet = {
    normal: { gunduz: number; gece: number };
    riskli: { gunduz: number; gece: number };
    bayram: { gunduz: number; gece: number };
    bayramRiskli: { gunduz: number; gece: number };
};

type PersonelStatu = "657" | "4b" | "4d";

type Unvan = {
    id: string;
    label: string;
    statu: Exclude<PersonelStatu, "4d">;
    rates: RateSet;
};

const UNVANLAR: Unvan[] = [
    {
        id: "657-egitim-gorevlisi",
        label: "Eğitim Görevlisi",
        statu: "657",
        rates: {
            normal: { gunduz: 250.15, gece: 275.16 },
            riskli: { gunduz: 375.22, gece: 412.74 },
            bayram: { gunduz: 312.68, gece: 343.95 },
            bayramRiskli: { gunduz: 469.02, gece: 515.93 },
        },
    },
    {
        id: "657-basasistan",
        label: "Başasistan",
        statu: "657",
        rates: {
            normal: { gunduz: 250.15, gece: 275.16 },
            riskli: { gunduz: 375.22, gece: 412.74 },
            bayram: { gunduz: 312.68, gece: 343.95 },
            bayramRiskli: { gunduz: 469.02, gece: 515.93 },
        },
    },
    {
        id: "657-uzman-tabip",
        label: "Uzman Tabip",
        statu: "657",
        rates: {
            normal: { gunduz: 250.15, gece: 275.16 },
            riskli: { gunduz: 375.22, gece: 412.74 },
            bayram: { gunduz: 312.68, gece: 343.95 },
            bayramRiskli: { gunduz: 469.02, gece: 515.93 },
        },
    },
    {
        id: "657-tabip",
        label: "Tabip",
        statu: "657",
        rates: {
            normal: { gunduz: 226.7, gece: 249.36 },
            riskli: { gunduz: 340.04, gece: 374.05 },
            bayram: { gunduz: 283.37, gece: 311.71 },
            bayramRiskli: { gunduz: 425.05, gece: 467.56 },
        },
    },
    {
        id: "657-tipta-uzmanlik-tuzugu",
        label: "Tıpta Uzmanlık Tüzüğüne Göre Yetkili Kılınanlar",
        statu: "657",
        rates: {
            normal: { gunduz: 226.7, gece: 249.36 },
            riskli: { gunduz: 340.04, gece: 374.05 },
            bayram: { gunduz: 283.37, gece: 311.71 },
            bayramRiskli: { gunduz: 425.05, gece: 467.56 },
        },
    },
    {
        id: "657-dis-tabibi-eczaci",
        label: "Diş Tabibi ve Eczacılar",
        statu: "657",
        rates: {
            normal: { gunduz: 203.24, gece: 223.57 },
            riskli: { gunduz: 304.87, gece: 335.35 },
            bayram: { gunduz: 254.05, gece: 279.46 },
            bayramRiskli: { gunduz: 381.08, gece: 419.19 },
        },
    },
    {
        id: "657-saglik-lisans",
        label: "Sağlık Personeli (Lisans - Önlisans)",
        statu: "657",
        rates: {
            normal: { gunduz: 156.34, gece: 171.98 },
            riskli: { gunduz: 234.51, gece: 257.96 },
            bayram: { gunduz: 195.43, gece: 214.97 },
            bayramRiskli: { gunduz: 293.14, gece: 322.45 },
        },
    },
    {
        id: "657-saglik-lise",
        label: "Sağlık Personeli (Lise)",
        statu: "657",
        rates: {
            normal: { gunduz: 132.89, gece: 146.18 },
            riskli: { gunduz: 199.34, gece: 219.27 },
            bayram: { gunduz: 166.11, gece: 182.72 },
            bayramRiskli: { gunduz: 249.17, gece: 274.09 },
        },
    },
    {
        id: "657-diger",
        label: "Diğer Personel",
        statu: "657",
        rates: {
            normal: { gunduz: 101.62, gece: 111.78 },
            riskli: { gunduz: 152.44, gece: 167.68 },
            bayram: { gunduz: 127.04, gece: 139.74 },
            bayramRiskli: { gunduz: 190.54, gece: 209.6 },
        },
    },
    {
        id: "4b-saglik-lisans",
        label: "Sağlık Personeli (Lisans - Önlisans)",
        statu: "4b",
        rates: {
            normal: { gunduz: 134.29, gece: 147.71 },
            riskli: { gunduz: 201.43, gece: 221.57 },
            bayram: { gunduz: 167.86, gece: 184.64 },
            bayramRiskli: { gunduz: 251.79, gece: 276.97 },
        },
    },
    {
        id: "4b-saglik-lise",
        label: "Sağlık Personeli (Lise)",
        statu: "4b",
        rates: {
            normal: { gunduz: 114.14, gece: 125.56 },
            riskli: { gunduz: 171.22, gece: 188.34 },
            bayram: { gunduz: 142.68, gece: 156.95 },
            bayramRiskli: { gunduz: 214.02, gece: 235.42 },
        },
    },
    {
        id: "4b-diger",
        label: "Diğer Personel",
        statu: "4b",
        rates: {
            normal: { gunduz: 88.99, gece: 96.01 },
            riskli: { gunduz: 130.93, gece: 144.02 },
            bayram: { gunduz: 109.11, gece: 120.02 },
            bayramRiskli: { gunduz: 163.66, gece: 180.03 },
        },
    },
];

const ISCI_GUNDUZ_BRUT = 533.61;
const ISCI_GECE_BRUT = 549.3;

const AYLIK_SAAT_SINIRI = 130;

type NobetTuru = "normal" | "riskli" | "bayram" | "bayramRiskli";

const TUR_LABEL: Record<NobetTuru, string> = {
    normal: "Normal nöbet",
    riskli: "Riskli birim nöbeti",
    bayram: "Resmî / dini bayram nöbeti",
    bayramRiskli: "Bayramda riskli birim nöbeti",
};

type NobetKaydi = {
    id: string;
    gunduzSaat: number | "";
    geceSaat: number | "";
    tur: NobetTuru;
};

function yeniKayit(): NobetKaydi {
    return {
        id: Math.random().toString(36).slice(2),
        gunduzSaat: "",
        geceSaat: "",
        tur: "normal",
    };
}

type IsciKaydi = {
    id: string;
    tur: "gunduz" | "gece";
    adet: number | "";
};

function yeniIsciKaydi(): IsciKaydi {
    return {
        id: Math.random().toString(36).slice(2),
        tur: "gunduz",
        adet: "",
    };
}

function formatTL(value: number) {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 2,
    }).format(value);
}

function hesaplaMemurUcreti(kayitlar: NobetKaydi[], rates: RateSet) {
    let kalanSaat = AYLIK_SAAT_SINIRI;
    let toplamUcret = 0;
    let toplamGirilenSaat = 0;
    let toplamSayilanSaat = 0;

    const satirlar: {
        tur: NobetTuru;
        girilenSaat: number;
        sayilanSaat: number;
        ucret: number;
    }[] = [];

    for (const kayit of kayitlar) {
        const gunduz = Number(kayit.gunduzSaat) || 0;
        const gece = Number(kayit.geceSaat) || 0;
        const girilenSaat = gunduz + gece;

        toplamGirilenSaat += girilenSaat;

        if (girilenSaat <= 0) continue;

        if (kalanSaat <= 0) {
            satirlar.push({
                tur: kayit.tur,
                girilenSaat,
                sayilanSaat: 0,
                ucret: 0,
            });
            continue;
        }

        const sayilanSaat = Math.min(girilenSaat, kalanSaat);
        const oran = sayilanSaat / girilenSaat;
        const sayilanGunduz = gunduz * oran;
        const sayilanGece = gece * oran;

        const rate = rates[kayit.tur];
        const ucret = sayilanGunduz * rate.gunduz + sayilanGece * rate.gece;

        toplamUcret += ucret;
        toplamSayilanSaat += sayilanSaat;
        kalanSaat -= sayilanSaat;

        satirlar.push({ tur: kayit.tur, girilenSaat, sayilanSaat, ucret });
    }

    return {
        toplamUcret,
        toplamGirilenSaat,
        toplamSayilanSaat,
        asilanSaat: Math.max(0, toplamGirilenSaat - toplamSayilanSaat),
        satirlar,
    };
}

function hesaplaIsciUcreti(kayitlar: IsciKaydi[]) {
    let toplamUcret = 0;
    let gunduzAdet = 0;
    let geceAdet = 0;

    for (const kayit of kayitlar) {
        const adet = Number(kayit.adet) || 0;
        if (kayit.tur === "gunduz") {
            gunduzAdet += adet;
            toplamUcret += adet * ISCI_GUNDUZ_BRUT;
        } else {
            geceAdet += adet;
            toplamUcret += adet * ISCI_GECE_BRUT;
        }
    }

    return { toplamUcret, gunduzAdet, geceAdet };
}

export default function NobetUcretiHesaplamaAraci() {
    const [statu, setStatu] = useState<PersonelStatu | null>(null);
    const [unvanId, setUnvanId] = useState<string>("");
    const [kayitlar, setKayitlar] = useState<NobetKaydi[]>([yeniKayit()]);
    const [isciKayitlar, setIsciKayitlar] = useState<IsciKaydi[]>([
        yeniIsciKaydi(),
    ]);

    const secilenUnvan = UNVANLAR.find((u) => u.id === unvanId) ?? null;

    const uygunUnvanlar = useMemo(
        () => UNVANLAR.filter((u) => u.statu === statu),
        [statu],
    );

    const memurSonuc = useMemo(() => {
        if (!secilenUnvan) return null;
        return hesaplaMemurUcreti(kayitlar, secilenUnvan.rates);
    }, [kayitlar, secilenUnvan]);

    const isciSonuc = useMemo(
        () => hesaplaIsciUcreti(isciKayitlar),
        [isciKayitlar],
    );

    function statuSec(s: PersonelStatu) {
        setStatu(s);
        setUnvanId("");
    }

    function kayitEkle() {
        setKayitlar((prev) => [...prev, yeniKayit()]);
    }

    function kayitSil(id: string) {
        setKayitlar((prev) => prev.filter((k) => k.id !== id));
    }

    function kayitGuncelle<K extends keyof NobetKaydi>(
        id: string,
        key: K,
        value: NobetKaydi[K],
    ) {
        setKayitlar((prev) =>
            prev.map((k) => (k.id === id ? { ...k, [key]: value } : k)),
        );
    }

    function isciKayitEkle() {
        setIsciKayitlar((prev) => [...prev, yeniIsciKaydi()]);
    }

    function isciKayitSil(id: string) {
        setIsciKayitlar((prev) => prev.filter((k) => k.id !== id));
    }

    function isciKayitGuncelle<K extends keyof IsciKaydi>(
        id: string,
        key: K,
        value: IsciKaydi[K],
    ) {
        setIsciKayitlar((prev) =>
            prev.map((k) => (k.id === id ? { ...k, [key]: value } : k)),
        );
    }

    function handleReset() {
        setStatu(null);
        setUnvanId("");
        setKayitlar([yeniKayit()]);
        setIsciKayitlar([yeniIsciKaydi()]);
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    2026 Nöbet Ücreti Hesaplama Aracı
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                    2026 Temmuz zamlı saatlik nöbet ücretlerine göre tahmini
                    brüt nöbet ücretinizi hesaplayın. Aylık 130 saat sınırı
                    otomatik olarak uygulanır.
                </p>
            </div>

            <div className="space-y-6">
                <StepHeader
                    number={1}
                    title="Personel statünüz"
                    done={!!statu}
                />

                <div className="border-l-2 border-slate-100 pl-4">
                    <div className="flex flex-wrap gap-2">
                        <StatuButton
                            label="657 Sayılı Devlet Memuru"
                            active={statu === "657"}
                            onClick={() => statuSec("657")}
                        />
                        <StatuButton
                            label="4/B Sözleşmeli Personel"
                            active={statu === "4b"}
                            onClick={() => statuSec("4b")}
                        />
                        <StatuButton
                            label="4/D Sürekli İşçi"
                            active={statu === "4d"}
                            onClick={() => statuSec("4d")}
                        />
                    </div>
                </div>

                {(statu === "657" || statu === "4b") && (
                    <>
                        <StepHeader
                            number={2}
                            title="Unvanınız"
                            done={!!secilenUnvan}
                        />

                        <div className="border-l-2 border-slate-100 pl-4">
                            <select
                                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-slate-900"
                                value={unvanId}
                                onChange={(e) => setUnvanId(e.target.value)}
                            >
                                <option value="">Seçiniz</option>
                                {uygunUnvanlar.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <StepHeader
                            number={3}
                            title="Nöbet kayıtlarınız"
                            done={kayitlar.some(
                                (k) => k.gunduzSaat !== "" || k.geceSaat !== "",
                            )}
                        />

                        <div className="border-l-2 border-slate-100 pl-4">
                            <p className="mb-3 text-xs leading-5 text-slate-500">
                                Ay içinde tuttuğunuz her nöbeti ayrı bir satır
                                olarak, ay başından sonuna doğru sırayla
                                ekleyin. 24 saatlik bir nöbeti gündüz ve gece
                                saatlerine bölerek girmeniz gerekir (örn. 08:00
                                - 08:00 nöbeti için 12 saat gündüz, 12 saat
                                gece). Gece saati, 20.00 - 08.00 arasını kapsar.
                            </p>

                            <div className="space-y-3">
                                {kayitlar.map((kayit, i) => (
                                    <NobetSatiri
                                        key={kayit.id}
                                        index={i + 1}
                                        kayit={kayit}
                                        onChange={(key, value) =>
                                            kayitGuncelle(kayit.id, key, value)
                                        }
                                        onRemove={
                                            kayitlar.length > 1
                                                ? () => kayitSil(kayit.id)
                                                : undefined
                                        }
                                    />
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={kayitEkle}
                                className="mt-3 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-500 hover:text-slate-900"
                            >
                                + Nöbet ekle
                            </button>
                        </div>

                        {secilenUnvan && memurSonuc && (
                            <div className="mt-2">
                                {memurSonuc.toplamGirilenSaat === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                                        Sonucu görmek için en az bir nöbet
                                        kaydına saat girin.
                                    </div>
                                ) : (
                                    <ResultBox
                                        unvan={secilenUnvan.label}
                                        sonuc={memurSonuc}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}

                {statu === "4d" && (
                    <>
                        <StepHeader
                            number={2}
                            title="Nöbetleriniz"
                            done={isciKayitlar.some((k) => k.adet !== "")}
                        />

                        <div className="border-l-2 border-slate-100 pl-4">
                            <p className="mb-3 text-xs leading-5 text-slate-500">
                                4/D sürekli işçi nöbet ücreti, saatlik değil
                                nöbet başına sabit brüt tutar üzerinden ödenir.
                                Tuttuğunuz gündüz ve gece nöbeti sayısını girin.
                            </p>

                            <div className="space-y-3">
                                {isciKayitlar.map((kayit, i) => (
                                    <IsciSatiri
                                        key={kayit.id}
                                        index={i + 1}
                                        kayit={kayit}
                                        onChange={(key, value) =>
                                            isciKayitGuncelle(
                                                kayit.id,
                                                key,
                                                value,
                                            )
                                        }
                                        onRemove={
                                            isciKayitlar.length > 1
                                                ? () => isciKayitSil(kayit.id)
                                                : undefined
                                        }
                                    />
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={isciKayitEkle}
                                className="mt-3 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-500 hover:text-slate-900"
                            >
                                + Nöbet ekle
                            </button>
                        </div>

                        <div className="mt-2">
                            {isciSonuc.gunduzAdet === 0 &&
                            isciSonuc.geceAdet === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                                    Sonucu görmek için en az bir nöbet sayısı
                                    girin.
                                </div>
                            ) : (
                                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-900">
                                    <h3 className="font-bold">
                                        Tahmini toplam nöbet ücreti
                                    </h3>
                                    <div className="mt-2 space-y-1.5 text-sm">
                                        <Row
                                            label={`Gündüz nöbeti (${isciSonuc.gunduzAdet} adet × ${formatTL(
                                                ISCI_GUNDUZ_BRUT,
                                            )})`}
                                            value={formatTL(
                                                isciSonuc.gunduzAdet *
                                                    ISCI_GUNDUZ_BRUT,
                                            )}
                                        />
                                        <Row
                                            label={`Gece nöbeti (${isciSonuc.geceAdet} adet × ${formatTL(
                                                ISCI_GECE_BRUT,
                                            )})`}
                                            value={formatTL(
                                                isciSonuc.geceAdet *
                                                    ISCI_GECE_BRUT,
                                            )}
                                        />
                                        <Row
                                            label="Toplam brüt tutar"
                                            value={formatTL(
                                                isciSonuc.toplamUcret,
                                            )}
                                            strong
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {statu && (
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
                <strong>Yasal uyarı:</strong> Bu hesaplama, Hekimsen
                Sendikası’nın yayımladığı 2026 Temmuz zamlı saatlik nöbet ücreti
                tablosuna göre yapılan bir tahmindir. 657 sayılı Kanun Ek 33.
                madde uyarınca aylık 130 saati aşan nöbetler için ödeme
                yapılmaz; bu sınır aşıldığında ay içindeki nöbetlerin giriş
                sırası esas alınır. Gerçek bordro tutarı, kurumunuzun kayıtları,
                vergi kesintileri ve güncel mevzuata göre değişebilir.
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

function NobetSatiri({
    index,
    kayit,
    onChange,
    onRemove,
}: {
    index: number;
    kayit: NobetKaydi;
    onChange: <K extends keyof NobetKaydi>(
        key: K,
        value: NobetKaydi[K],
    ) => void;
    onRemove?: () => void;
}) {
    return (
        <div className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                    {index}. Nöbet
                </span>

                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                    >
                        Kaldır
                    </button>
                )}
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
                <MiniInput
                    label="Gündüz saati"
                    value={kayit.gunduzSaat}
                    onChange={(v) => onChange("gunduzSaat", v)}
                />
                <MiniInput
                    label="Gece saati"
                    value={kayit.geceSaat}
                    onChange={(v) => onChange("geceSaat", v)}
                />

                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                        Nöbet türü
                    </label>
                    <select
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none focus:border-slate-900"
                        value={kayit.tur}
                        onChange={(e) =>
                            onChange("tur", e.target.value as NobetTuru)
                        }
                    >
                        {(Object.keys(TUR_LABEL) as NobetTuru[]).map((tur) => (
                            <option key={tur} value={tur}>
                                {TUR_LABEL[tur]}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

function IsciSatiri({
    index,
    kayit,
    onChange,
    onRemove,
}: {
    index: number;
    kayit: IsciKaydi;
    onChange: <K extends keyof IsciKaydi>(key: K, value: IsciKaydi[K]) => void;
    onRemove?: () => void;
}) {
    return (
        <div className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                    {index}. Nöbet
                </span>

                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                    >
                        Kaldır
                    </button>
                )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                        Nöbet türü
                    </label>
                    <select
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none focus:border-slate-900"
                        value={kayit.tur}
                        onChange={(e) =>
                            onChange("tur", e.target.value as "gunduz" | "gece")
                        }
                    >
                        <option value="gunduz">Gündüz nöbeti</option>
                        <option value="gece">Gece nöbeti</option>
                    </select>
                </div>

                <MiniInput
                    label="Adet"
                    value={kayit.adet}
                    onChange={(v) => onChange("adet", v)}
                />
            </div>
        </div>
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
                    onChange(
                        e.target.value === "" ? "" : Number(e.target.value),
                    )
                }
            />
        </div>
    );
}

function ResultBox({
    unvan,
    sonuc,
}: {
    unvan: string;
    sonuc: ReturnType<typeof hesaplaMemurUcreti>;
}) {
    const turToplamlari: Record<NobetTuru, { saat: number; ucret: number }> = {
        normal: { saat: 0, ucret: 0 },
        riskli: { saat: 0, ucret: 0 },
        bayram: { saat: 0, ucret: 0 },
        bayramRiskli: { saat: 0, ucret: 0 },
    };

    for (const satir of sonuc.satirlar) {
        turToplamlari[satir.tur].saat += satir.sayilanSaat;
        turToplamlari[satir.tur].ucret += satir.ucret;
    }

    return (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-900">
            <h3 className="font-bold">{unvan} — tahmini nöbet ücreti</h3>

            <div className="mt-3 space-y-1.5 text-sm">
                {(Object.keys(TUR_LABEL) as NobetTuru[])
                    .filter((tur) => turToplamlari[tur].saat > 0)
                    .map((tur) => (
                        <Row
                            key={tur}
                            label={`${TUR_LABEL[tur]} (${turToplamlari[
                                tur
                            ].saat.toFixed(1)} saat)`}
                            value={formatTL(turToplamlari[tur].ucret)}
                        />
                    ))}

                <Row
                    label="Toplam brüt tutar"
                    value={formatTL(sonuc.toplamUcret)}
                    strong
                />
            </div>

            {sonuc.asilanSaat > 0 && (
                <p className="mt-3 rounded-lg bg-yellow-50 p-2.5 text-xs leading-5 text-yellow-900">
                    Girdiğiniz toplam {sonuc.toplamGirilenSaat.toFixed(1)}{" "}
                    saatin {sonuc.asilanSaat.toFixed(1)} saati, aylık 130 saat
                    sınırını aştığı için ücrete dahil edilmedi. 657 sayılı Kanun
                    Ek 33. madde uyarınca 130 saat üzeri nöbetler için ödeme
                    yapılmaz.
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
