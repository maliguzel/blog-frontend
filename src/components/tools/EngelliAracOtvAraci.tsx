"use client";

import { useMemo, useState } from "react";

const LIMIT_2026 = 2873900;

type VehicleClass = "87.03" | "87.04" | "87.11" | "unknown";

type FormState = {
    hasOrthopedicDisability: boolean | null;
    orthopedicRate: number | "";
    totalDisabilityRate: number | "";
    cannotGetDriverLicenseDueToOrthopedicDisability: boolean | null;
    hasMedicalBoardReport: boolean | null;
    vehicleClass: VehicleClass;
    localContributionRate: number | "";
    taxIncludedPrice: number | "";
    engineCc: number | "";
    normalSalePrice: number | "";
    otvRate: number | "";
};

const initialForm: FormState = {
    hasOrthopedicDisability: null,
    orthopedicRate: "",
    totalDisabilityRate: "",
    cannotGetDriverLicenseDueToOrthopedicDisability: null,
    hasMedicalBoardReport: null,
    vehicleClass: "unknown",
    localContributionRate: "",
    taxIncludedPrice: "",
    engineCc: "",
    normalSalePrice: "",
    otvRate: "",
};

function formatTL(value: number) {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 0,
    }).format(value);
}

function calculateOtvExemption(
    normalSalePrice: number,
    otvRate: number,
    kdvRate = 20,
) {
    const otvDecimal = otvRate / 100;
    const kdvDecimal = kdvRate / 100;

    const basePrice = normalSalePrice / ((1 + otvDecimal) * (1 + kdvDecimal));
    const normalOtv = basePrice * otvDecimal;
    const normalKdv = (basePrice + normalOtv) * kdvDecimal;

    const exemptSalePrice = basePrice * (1 + kdvDecimal);
    const exemptKdv = basePrice * kdvDecimal;

    return {
        basePrice,
        normalSalePrice,
        normalOtv,
        normalKdv,
        exemptSalePrice,
        exemptKdv,
        advantage: normalSalePrice - exemptSalePrice,
        kdvAdvantage: normalKdv - exemptKdv,
    };
}

const STEP1_REQUIRED = [
    "hasOrthopedicDisability",
    "orthopedicRate",
    "cannotGetDriverLicenseDueToOrthopedicDisability",
    "hasMedicalBoardReport",
] as const;

function checkEligibility(form: FormState) {
    const missing: string[] = [];
    const reasons: string[] = [];

    if (form.hasOrthopedicDisability === null) {
        missing.push("Ortopedik engel durumunuzu seçin.");
    }

    if (form.orthopedicRate === "") {
        missing.push("Ortopedik engel oranınızı girin.");
    }

    if (form.cannotGetDriverLicenseDueToOrthopedicDisability === null) {
        missing.push("Sürücü belgesi alamaz değerlendirmesini seçin.");
    }

    if (form.hasMedicalBoardReport === null) {
        missing.push("Sağlık kurulu raporu bilgisini seçin.");
    }

    if (form.vehicleClass === "unknown") {
        missing.push("Araç sınıfını seçin.");
    }

    if (form.localContributionRate === "") {
        missing.push("Yerli katkı oranını girin.");
    }

    if (form.vehicleClass === "87.03" && form.taxIncludedPrice === "") {
        missing.push("87.03 sınıfı için vergiler dahil satış bedelini girin.");
    }

    if (form.vehicleClass === "87.04" && form.engineCc === "") {
        missing.push("87.04 sınıfı için motor hacmini girin.");
    }

    if (missing.length > 0) {
        return { status: "missing" as const, missing, reasons };
    }

    if (!form.hasOrthopedicDisability) {
        reasons.push("Bu düzenlemede ortopedik engel şartı aranır.");
    }

    if (Number(form.orthopedicRate) < 40) {
        reasons.push(
            `Ortopedik engel oranınız (%${form.orthopedicRate}), aranan %40 sınırının altında.`,
        );
    }

    if (!form.cannotGetDriverLicenseDueToOrthopedicDisability) {
        reasons.push(
            "Ortopedik engel nedeniyle sürücü belgesi alamaz değerlendirmesi bulunmalı.",
        );
    }

    if (!form.hasMedicalBoardReport) {
        reasons.push("Engellilik sağlık kurulu raporu gerekli.");
    }

    if (!["87.03", "87.04", "87.11"].includes(form.vehicleClass)) {
        reasons.push("Araç 87.03, 87.04 veya 87.11 kapsamında olmalı.");
    }

    if (Number(form.localContributionRate) < 40) {
        reasons.push(
            `Aracın yerli katkı oranı (%${form.localContributionRate}), aranan %40 sınırının altında.`,
        );
    }

    if (
        form.vehicleClass === "87.03" &&
        Number(form.taxIncludedPrice) >= LIMIT_2026
    ) {
        reasons.push(
            `87.03 sınıfı araçlarda vergiler dahil bedel ${formatTL(
                LIMIT_2026,
            )}'nin altında olmalı. Girdiğiniz bedel: ${formatTL(
                Number(form.taxIncludedPrice),
            )}.`,
        );
    }

    if (form.vehicleClass === "87.04" && Number(form.engineCc) > 2800) {
        reasons.push(
            `87.04 sınıfı araçlarda motor hacmi 2800 cm³ veya altında olmalı. Girdiğiniz hacim: ${form.engineCc} cm³.`,
        );
    }

    if (reasons.length > 0) {
        return { status: "notEligible" as const, missing, reasons };
    }

    return {
        status: "eligible" as const,
        missing,
        reasons: [
            "Ortopedik engel oranınız %40 ve üzeri görünüyor.",
            "Ortopedik engel nedeniyle sürücü belgesi alamaz şartı sağlanıyor.",
            "Sağlık kurulu raporunuz mevcut.",
            "Araç sınıfı düzenleme kapsamında.",
            "Yerli katkı oranı %40 ve üzeri.",
        ],
    };
}

export default function EngelliAracOtvAraci() {
    const [form, setForm] = useState<FormState>(initialForm);
    const [showCalculator, setShowCalculator] = useState(false);

    const eligibility = useMemo(() => checkEligibility(form), [form]);

    const hasStarted = useMemo(
        () => JSON.stringify(form) !== JSON.stringify(initialForm),
        [form],
    );

    const step1Done = STEP1_REQUIRED.every(
        (key) => form[key] !== null && form[key] !== "",
    );

    const step2Required: (keyof FormState)[] = [
        "vehicleClass",
        "localContributionRate",
        ...(form.vehicleClass === "87.03"
            ? (["taxIncludedPrice"] as const)
            : []),
        ...(form.vehicleClass === "87.04" ? (["engineCc"] as const) : []),
    ];
    const step2Done = step2Required.every(
        (key) =>
            form[key] !== "unknown" && form[key] !== "" && form[key] !== null,
    );

    const totalRequired = STEP1_REQUIRED.length + step2Required.length;
    const totalAnswered =
        STEP1_REQUIRED.filter((key) => form[key] !== null && form[key] !== "")
            .length +
        step2Required.filter(
            (key) =>
                form[key] !== "unknown" &&
                form[key] !== "" &&
                form[key] !== null,
        ).length;

    const progressPercent = Math.round((totalAnswered / totalRequired) * 100);

    const calculation = useMemo(() => {
        if (!form.normalSalePrice || !form.otvRate) return null;

        return calculateOtvExemption(
            Number(form.normalSalePrice),
            Number(form.otvRate),
        );
    }, [form.normalSalePrice, form.otvRate]);

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleReset() {
        setForm(initialForm);
        setShowCalculator(false);
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    %40 Ortopedik Engelli ÖTV’siz Araç Uygunluk Testi
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Aşağıdaki soruları sırayla cevaplayın. Cevapladıkça
                    sonucunuz otomatik olarak güncellenecek. Sonuç kesin hak
                    sahipliği anlamına gelmez, yalnızca ön bilgilendirme sağlar.
                </p>

                <ProgressBar percent={hasStarted ? progressPercent : 0} />
            </div>

            <div className="space-y-6">
                <StepHeader
                    number={1}
                    title="Sağlık ve engellilik durumunuz"
                    done={step1Done}
                />

                <div className="space-y-5 border-l-2 border-slate-100 pl-4">
                    <Question
                        title="Ortopedik engeliniz var mı?"
                        info="Ortopedik engel; kol, bacak, omurga gibi kas-iskelet sistemiyle ilgili engelleri kapsar. Görme, işitme gibi diğer engel türleri bu düzenleme kapsamında değildir."
                    >
                        <YesNo
                            value={form.hasOrthopedicDisability}
                            onChange={(v) =>
                                update("hasOrthopedicDisability", v)
                            }
                        />
                    </Question>

                    <Question
                        title="Sağlık kurulu raporunuzdaki ortopedik engel oranı kaç?"
                        info="Raporunuzda genellikle 'ortopedik' başlığı altında ayrı bir yüzde olarak yazar. Toplam engel oranınızla karıştırmayın."
                    >
                        <InputNumber
                            value={form.orthopedicRate}
                            placeholder="Örn: 45"
                            suffix="%"
                            onChange={(v) => update("orthopedicRate", v)}
                        />
                        <HelperNote>
                            Bu düzenlemede aranan şart, ortopedik engel oranının{" "}
                            <strong>%40 ve üzeri</strong> olmasıdır.
                        </HelperNote>
                    </Question>

                    <Question
                        title="Toplam engel oranınız kaç? (bilgi amaçlı)"
                        info="Bu bilgi yalnızca size özet göstermek içindir, uygunluk hesabına dahil edilmez."
                    >
                        <InputNumber
                            value={form.totalDisabilityRate}
                            placeholder="Örn: 60"
                            suffix="%"
                            onChange={(v) => update("totalDisabilityRate", v)}
                        />
                        <HelperNote muted>
                            Bu düzenlemede toplam engel oranı değil, yukarıdaki
                            ortopedik engel oranı dikkate alınır. Bu alanı boş
                            bırakabilirsiniz.
                        </HelperNote>
                    </Question>

                    <Question
                        title="Ortopedik engeliniz nedeniyle sürücü belgesi alamaz değerlendirmesi var mı?"
                        info="Bu, sağlık kurulu raporunuzda ayrıca ve açıkça yazması gereken bir değerlendirmedir. Sadece ortopedik engel oranının yüksek olması yeterli değildir."
                    >
                        <YesNo
                            value={
                                form.cannotGetDriverLicenseDueToOrthopedicDisability
                            }
                            onChange={(v) =>
                                update(
                                    "cannotGetDriverLicenseDueToOrthopedicDisability",
                                    v,
                                )
                            }
                        />
                    </Question>

                    <Question
                        title="Engellilik sağlık kurulu raporunuz var mı?"
                        info="Tam teşekküllü bir hastane veya üniversite hastanesinin sağlık kurulunca düzenlenmiş, engel durumunuzu ve oranınızı gösteren resmi rapordur."
                    >
                        <YesNo
                            value={form.hasMedicalBoardReport}
                            onChange={(v) => update("hasMedicalBoardReport", v)}
                        />
                    </Question>
                </div>

                <StepHeader
                    number={2}
                    title="Almayı düşündüğünüz araç"
                    done={step2Done}
                />

                <div className="space-y-5 border-l-2 border-slate-100 pl-4">
                    <Question
                        title="Araç sınıfı nedir?"
                        info="Bu bilgiyi aracın ruhsatında veya satıcı firmadan 'gümrük tarife istatistik pozisyonu' (GTİP) olarak öğrenebilirsiniz. Çoğu binek otomobil 87.03 sınıfındadır."
                    >
                        <select
                            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-slate-900"
                            value={form.vehicleClass}
                            onChange={(e) =>
                                update(
                                    "vehicleClass",
                                    e.target.value as VehicleClass,
                                )
                            }
                        >
                            <option value="unknown">Seçiniz</option>
                            <option value="87.03">
                                87.03 - Binek otomobil, panelvan, pick-up, jeep
                                vb.
                            </option>
                            <option value="87.04">
                                87.04 - Eşya taşımaya mahsus van, kamyonet,
                                pick-up vb.
                            </option>
                            <option value="87.11">87.11 - Motosiklet</option>
                        </select>
                    </Question>

                    <Question
                        title="Aracın yerli katkı oranı kaç?"
                        info="Aracın üretiminde kullanılan yerli parça oranıdır. Model bazında değişir; satıcı, distribütör veya üretici firmadan öğrenilebilir."
                    >
                        <InputNumber
                            value={form.localContributionRate}
                            placeholder="Örn: 40"
                            suffix="%"
                            onChange={(v) => update("localContributionRate", v)}
                        />
                        <HelperNote>
                            Aranan şart: yerli katkı oranının{" "}
                            <strong>en az %40</strong> olmasıdır.
                        </HelperNote>
                    </Question>

                    {form.vehicleClass === "87.03" && (
                        <Question
                            title="Aracın vergiler dahil normal satış bedeli nedir?"
                            info="Aracın, engelli muafiyeti uygulanmadan önceki, tüm vergiler dahil liste fiyatıdır."
                        >
                            <InputNumber
                                value={form.taxIncludedPrice}
                                placeholder="Örn: 1800000"
                                suffix="TL"
                                onChange={(v) => update("taxIncludedPrice", v)}
                            />
                            <HelperNote>
                                2026 sınırı: bu bedel{" "}
                                <strong>{formatTL(LIMIT_2026)}</strong>'nin
                                altında olmalı.
                            </HelperNote>
                        </Question>
                    )}

                    {form.vehicleClass === "87.04" && (
                        <Question
                            title="Motor silindir hacmi kaç cm³?"
                            info="Aracın ruhsatında 'motor hacmi' veya 'silindir hacmi' olarak yazan değerdir."
                        >
                            <InputNumber
                                value={form.engineCc}
                                placeholder="Örn: 1598"
                                suffix="cm³"
                                onChange={(v) => update("engineCc", v)}
                            />
                            <HelperNote>
                                Aranan şart: motor hacminin{" "}
                                <strong>2800 cm³ veya altında</strong>{" "}
                                olmasıdır.
                            </HelperNote>
                        </Question>
                    )}
                </div>
            </div>

            <div className="mt-6">
                {!hasStarted && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                        Sonucu görmek için yukarıdaki soruları cevaplamaya
                        başlayın.
                    </div>
                )}

                {hasStarted && eligibility.status === "eligible" && (
                    <ResultBox
                        type="success"
                        title="Uygun görünüyor"
                        items={eligibility.reasons}
                    />
                )}

                {hasStarted && eligibility.status === "notEligible" && (
                    <ResultBox
                        type="danger"
                        title="Şu an uygun görünmüyor"
                        items={eligibility.reasons}
                    />
                )}

                {hasStarted && eligibility.status === "missing" && (
                    <ResultBox
                        type="warning"
                        title={`Devam edin: ${totalAnswered}/${totalRequired} soru cevaplandı`}
                        items={eligibility.missing}
                    />
                )}

                {hasStarted && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="mt-3 text-xs font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-slate-700"
                    >
                        Formu sıfırla ve baştan başla
                    </button>
                )}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
                <button
                    type="button"
                    onClick={() => setShowCalculator((v) => !v)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-left"
                >
                    <span>
                        <span className="block text-base font-bold text-slate-900">
                            İsteğe bağlı: Tahmini ÖTV avantajını hesapla
                        </span>
                        <span className="mt-1 block text-sm text-slate-600">
                            Uygunluk şartlarından bağımsız olarak, araç fiyatına
                            göre yaklaşık ne kadar tasarruf edebileceğinizi
                            görün.
                        </span>
                    </span>
                    <span
                        className={`ml-3 shrink-0 text-slate-500 transition-transform ${
                            showCalculator ? "rotate-180" : ""
                        }`}
                    >
                        ▾
                    </span>
                </button>

                {showCalculator && (
                    <div className="mt-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Question
                                title="Normal satış fiyatı"
                                info="Aracın, engelli muafiyeti olmadan satılan normal fiyatıdır. Yukarıda 87.03 için girdiğiniz vergiler dahil bedelle aynı olabilir."
                            >
                                <InputNumber
                                    value={form.normalSalePrice}
                                    placeholder="Örn: 1500000"
                                    suffix="TL"
                                    onChange={(v) =>
                                        update("normalSalePrice", v)
                                    }
                                />
                            </Question>

                            <Question
                                title="ÖTV oranı"
                                info="Aracın motor hacmi ve fiyatına göre değişen özel tüketim vergisi oranıdır. Satıcı firmadan veya aracın fiyat listesinden öğrenebilirsiniz."
                            >
                                <InputNumber
                                    value={form.otvRate}
                                    placeholder="Örn: 80"
                                    suffix="%"
                                    onChange={(v) => update("otvRate", v)}
                                />
                            </Question>
                        </div>

                        {!calculation && (
                            <p className="mt-3 text-xs text-slate-500">
                                Sonucu görmek için her iki alanı da doldurun.
                            </p>
                        )}

                        {calculation && (
                            <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm">
                                <Row
                                    label="Tahmini vergisiz matrah"
                                    value={formatTL(calculation.basePrice)}
                                />
                                <Row
                                    label="Normal satış fiyatı"
                                    value={formatTL(
                                        calculation.normalSalePrice,
                                    )}
                                />
                                <Row
                                    label="Normal ÖTV tutarı"
                                    value={formatTL(calculation.normalOtv)}
                                />
                                <Row
                                    label="Normal KDV tutarı"
                                    value={formatTL(calculation.normalKdv)}
                                />
                                <Row
                                    label="ÖTV muafiyetli tahmini fiyat"
                                    value={formatTL(
                                        calculation.exemptSalePrice,
                                    )}
                                />
                                <Row
                                    label="Tahmini toplam avantaj"
                                    value={formatTL(calculation.advantage)}
                                    strong
                                />
                                <Row
                                    label="ÖTV’nin KDV’ye etkisinden avantaj"
                                    value={formatTL(calculation.kdvAdvantage)}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                <strong>Yasal uyarı:</strong> Bu hesaplama bilgilendirme
                amaçlıdır. Nihai değerlendirme sağlık kurulu raporu, araç teknik
                bilgileri, yerli katkı oranı, satış bedeli ve ilgili vergi
                dairesi incelemesine göre yapılır.
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

function ProgressBar({ percent }: { percent: number }) {
    return (
        <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-slate-900 transition-all"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

function Question({
    title,
    info,
    children,
}: {
    title: string;
    info?: string;
    children: React.ReactNode;
}) {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div>
            <div className="mb-2 flex items-start gap-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                    {title}
                </label>

                {info && (
                    <button
                        type="button"
                        onClick={() => setShowInfo((v) => !v)}
                        aria-label="Bu soru hakkında bilgi"
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500 hover:border-slate-500 hover:text-slate-700"
                    >
                        ?
                    </button>
                )}
            </div>

            {info && showInfo && (
                <p className="mb-2 rounded-lg bg-blue-50 p-2.5 text-xs leading-5 text-blue-900">
                    {info}
                </p>
            )}

            {children}
        </div>
    );
}

function HelperNote({
    children,
    muted,
}: {
    children: React.ReactNode;
    muted?: boolean;
}) {
    return (
        <p
            className={`mt-1 text-xs ${
                muted ? "text-slate-400" : "text-slate-500"
            }`}
        >
            {children}
        </p>
    );
}

function YesNo({
    value,
    onChange,
}: {
    value: boolean | null;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex gap-2">
            <button
                type="button"
                onClick={() => onChange(true)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    value === true
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
            >
                Evet
            </button>

            <button
                type="button"
                onClick={() => onChange(false)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    value === false
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
            >
                Hayır
            </button>
        </div>
    );
}

function InputNumber({
    value,
    placeholder,
    suffix,
    onChange,
}: {
    value: number | "";
    placeholder: string;
    suffix: string;
    onChange: (value: number | "") => void;
}) {
    return (
        <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
            <input
                type="number"
                inputMode="decimal"
                className="w-full p-3 text-sm outline-none"
                value={value}
                placeholder={placeholder}
                onChange={(e) =>
                    onChange(
                        e.target.value === "" ? "" : Number(e.target.value),
                    )
                }
            />

            <span className="min-w-14 bg-slate-100 px-3 py-3 text-center text-sm text-slate-600">
                {suffix}
            </span>
        </div>
    );
}

function ResultBox({
    type,
    title,
    items,
}: {
    type: "success" | "danger" | "warning";
    title: string;
    items: string[];
}) {
    const className =
        type === "success"
            ? "border-green-200 bg-green-50 text-green-900"
            : type === "danger"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-yellow-200 bg-yellow-50 text-yellow-900";

    const icon = type === "success" ? "✓" : type === "danger" ? "✕" : "•";

    return (
        <div className={`rounded-xl border p-4 ${className}`}>
            <h3 className="font-bold">{title}</h3>

            <ul className="mt-2 space-y-1.5 text-sm">
                {items.map((item) => (
                    <li key={item} className="flex gap-2">
                        <span className="shrink-0">{icon}</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
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
            className={`flex justify-between gap-4 border-b border-slate-200 pb-2 last:border-0 last:pb-0 ${
                strong ? "text-base font-bold text-slate-950" : "text-slate-700"
            }`}
        >
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}
