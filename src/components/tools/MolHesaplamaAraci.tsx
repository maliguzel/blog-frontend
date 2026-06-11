"use client";

import { useMemo, useState } from "react";

export function MolHesaplamaAraci() {
    const [kutle, setKutle] = useState("");
    const [molarKutle, setMolarKutle] = useState("");

    const sonuc = useMemo(() => {
        const m = Number(kutle.replace(",", "."));
        const M = Number(molarKutle.replace(",", "."));

        if (!m || !M || m <= 0 || M <= 0) return null;

        return m / M;
    }, [kutle, molarKutle]);

    return (
        <div className="my-10 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Mol Hesaplama Aracı</h2>

            <p className="text-sm text-[var(--muted)] mb-5">
                Kütle ve molar kütle değerlerini girerek mol sayısını
                hesaplayabilirsin.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-medium">Kütle (gram)</span>
                    <input
                        value={kutle}
                        onChange={(e) => setKutle(e.target.value)}
                        placeholder="Örn: 18"
                        className="mt-1 w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">
                        Molar kütle (g/mol)
                    </span>
                    <input
                        value={molarKutle}
                        onChange={(e) => setMolarKutle(e.target.value)}
                        placeholder="Örn: 18"
                        className="mt-1 w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none"
                    />
                </label>
            </div>

            <div className="mt-5 rounded-xl bg-[var(--background)] border border-[var(--border)] p-4">
                {sonuc !== null ? (
                    <>
                        <p className="text-sm text-[var(--muted)]">Sonuç</p>
                        <p className="text-2xl font-bold">
                            {sonuc.toFixed(4)} mol
                        </p>
                        <p className="text-sm text-[var(--muted)] mt-2">
                            Formül: mol = kütle / molar kütle
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-[var(--muted)]">
                        Hesaplama için iki değeri de gir.
                    </p>
                )}
            </div>
        </div>
    );
}
