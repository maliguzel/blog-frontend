"use client";

import { useEffect, useState } from "react";
import {
    getUnvanListesi,
    getIlListesi,
    ilGrubuBul,
    altBolgeHedefleri,
    type HizmetGruplariVerisi,
} from "@/src/lib/hizmet-gruplari-utils";

interface HizmetGruplariApiData {
    id: string;
    donem: string;
    donem_label: string;
    kaynak_url: string;
    veriler: HizmetGruplariVerisi;
}

interface ApiResponse {
    success: boolean;
    data?: HizmetGruplariApiData;
    error?: string;
}

type AltBolgeSonuc = ReturnType<typeof altBolgeHedefleri>;

type ResultState = {
    donemLabel: string;
    kaynakUrl: string;
    unvan: string;
    il: string;
    bolge: string;
    grup: string;
    altBolge: AltBolgeSonuc;
};

function GrupBadge({ grup }: { grup: string }) {
    const className =
        grup === "A"
            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
            : grup === "B"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : grup === "C"
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : grup === "D"
                  ? "bg-orange-100 text-orange-800 border-orange-200"
                  : "bg-red-100 text-red-800 border-red-200";

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${className}`}
        >
            {grup} Grubu
        </span>
    );
}

function IlChip({ il }: { il: string }) {
    return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {il}
        </span>
    );
}

function IlListesi({ title, iller }: { title: string; iller: string[] }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600">
                    {iller.length} il
                </span>
            </div>

            {iller.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {iller.map((il) => (
                        <IlChip key={il} il={il} />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">
                    Bu grupta hedef il bulunamadı.
                </p>
            )}
        </div>
    );
}

export default function Page() {
    const [data, setData] = useState<HizmetGruplariApiData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [unvanList, setUnvanList] = useState<string[]>([]);
    const [ilList, setIlList] = useState<string[]>([]);

    const [selectedUnvan, setSelectedUnvan] = useState("");
    const [selectedIl, setSelectedIl] = useState("");

    const [result, setResult] = useState<ResultState | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch("/api/hizmet-gruplari", {
                    cache: "no-store",
                });

                const json: ApiResponse = await res.json();

                if (!res.ok || !json.success || !json.data?.veriler) {
                    throw new Error(
                        json.error || "Hizmet grupları verisi alınamadı.",
                    );
                }

                const apiData = json.data;

                setData(apiData);

                const unvanlar = getUnvanListesi(apiData.veriler);
                const iller = getIlListesi(apiData.veriler);

                setUnvanList(unvanlar);
                setIlList(iller);

                if (unvanlar.length > 0) {
                    setSelectedUnvan(unvanlar[0]);
                }

                if (iller.length > 0) {
                    setSelectedIl(iller[0]);
                }
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Bilinmeyen bir hata oluştu.";
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!data) {
            setError("Veri henüz yüklenmedi.");
            return;
        }

        if (!selectedUnvan || !selectedIl) {
            setError("Lütfen unvan ve bulunduğunuz ili seçiniz.");
            return;
        }

        setError(null);

        const grupSonuc = ilGrubuBul(data.veriler, selectedUnvan, selectedIl);

        if (!grupSonuc.bulundu) {
            setResult(null);
            setError(grupSonuc.error);
            return;
        }

        const altBolge = altBolgeHedefleri(
            data.veriler,
            selectedUnvan,
            selectedIl,
        );

        setResult({
            donemLabel: data.donem_label,
            kaynakUrl: data.kaynak_url,
            unvan: grupSonuc.unvan,
            il: grupSonuc.il,
            bolge: grupSonuc.bolge,
            grup: grupSonuc.grup,
            altBolge,
        });
    }

    if (loading) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-12">
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="text-gray-600">Veriler yükleniyor...</p>
                </div>
            </main>
        );
    }

    if (error && !data) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-12">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                    <h1 className="mb-2 text-xl font-bold text-red-800">
                        Veri yüklenemedi
                    </h1>
                    <p className="text-red-700">{error}</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-5 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
                    >
                        Yeniden Dene
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
            <section className="mb-8 rounded-3xl bg-gradient-to-br from-blue-50 to-white p-6 md:p-8">
                <div className="max-w-3xl">
                    <p className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                        Sağlık Bakanlığı personel aracı
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
                        Alt Bölge Tayini Uygunluk Sorgulama
                    </h1>

                    <p className="mt-4 text-base leading-7 text-gray-700">
                        Bulunduğunuz il ve unvanınıza göre güncel bölge hizmet
                        grubu bilginizi görebilir, Madde 26 kapsamında D/E grubu
                        iller için teorik başvuru durumunu sorgulayabilirsiniz.
                    </p>

                    {data?.donem_label && (
                        <p className="mt-4 text-sm text-gray-600">
                            Güncel veri dönemi:{" "}
                            <span className="font-semibold text-gray-900">
                                {data.donem_label}
                            </span>
                        </p>
                    )}
                </div>
            </section>

            <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="unvan"
                                className="mb-2 block text-sm font-semibold text-gray-800"
                            >
                                Unvanınız
                            </label>
                            <select
                                id="unvan"
                                value={selectedUnvan}
                                onChange={(e) => {
                                    setSelectedUnvan(e.target.value);
                                    setResult(null);
                                }}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {unvanList.map((unvan) => (
                                    <option key={unvan} value={unvan}>
                                        {unvan}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="il"
                                className="mb-2 block text-sm font-semibold text-gray-800"
                            >
                                Bulunduğunuz il
                            </label>
                            <select
                                id="il"
                                value={selectedIl}
                                onChange={(e) => {
                                    setSelectedIl(e.target.value);
                                    setResult(null);
                                }}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {ilList.map((il) => (
                                    <option key={il} value={il}>
                                        {il}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && data && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="mt-6 w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 md:w-auto"
                    >
                        Gidebileceğim illeri göster
                    </button>
                </form>
            </section>

            {result && (
                <section className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-1">
                            <h2 className="mb-4 text-lg font-bold text-gray-950">
                                Bulunduğunuz Yer
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Dönem
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {result.donemLabel}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Unvan
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {result.unvan}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        İl
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {result.il}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Bölge
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-gray-900">
                                            {result.bolge}. Bölge
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Grup
                                        </p>
                                        <GrupBadge grup={result.grup} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
                            <h2 className="mb-4 text-lg font-bold text-gray-950">
                                Gidebileceğiniz İller
                            </h2>

                            {result.altBolge.uygun ? (
                                <div className="space-y-5">
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                        <p className="font-semibold text-emerald-900">
                                            Madde 26 kapsamında teorik olarak
                                            D/E grubu iller için başvuru
                                            değerlendirilebilir.
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-emerald-800">
                                            {result.altBolge.uyari}
                                        </p>
                                    </div>

                                    <IlListesi
                                        title="D Grubu Hedef İller"
                                        iller={result.altBolge.hedefler.D}
                                    />

                                    <IlListesi
                                        title="E Grubu Hedef İller"
                                        iller={result.altBolge.hedefler.E}
                                    />
                                </div>
                            ) : (
                                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                                    <p className="font-semibold text-yellow-900">
                                        Bu il için alt bölge tayini yönünden
                                        doğrudan uygunluk görünmüyor.
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-yellow-800">
                                        {result.altBolge.sebep}
                                    </p>
                                </div>
                            )}

                            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                                Bu sonuç kesin tayin hakkı anlamına gelmez.
                                Münhal kadro, PDC doluluk oranı, hizmet süresi
                                ve Bakanlık değerlendirmesi ayrıca dikkate
                                alınır.
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 text-sm leading-7 text-gray-600">
                <h2 className="mb-2 font-bold text-gray-900">
                    Bu araç ne işe yarar?
                </h2>
                <p>
                    Bu araç, Sağlık Bakanlığı tarafından yayımlanan bölge hizmet
                    grubu verilerine göre seçtiğiniz unvan ve il için bölge/grup
                    bilgisini gösterir. A veya B grubu illerde bulunan personel
                    için aynı bölgedeki D ve E grubu iller teorik hedef olarak
                    listelenir.
                </p>
                <p className="mt-3">
                    Resmi değerlendirmede münhal kadro, PDC doluluk oranı,
                    çalışma süresi ve Bakanlık takdiri ayrıca dikkate alınır. Bu
                    nedenle burada gösterilen sonuç yalnızca bilgilendirme
                    amaçlıdır.
                </p>
            </section>
        </main>
    );
}
