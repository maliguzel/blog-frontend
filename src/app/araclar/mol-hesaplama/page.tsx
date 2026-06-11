import type { Metadata } from "next";
import { MolHesaplamaAraci } from "@/src/components/tools/MolHesaplamaAraci";

export const metadata: Metadata = {
    title: "Mol Hesaplama Aracı | Nedir Bunlar?",
    description: "Gram ve molar kütle girerek mol sayısını kolayca hesaplayın.",
};

export default function MolHesaplamaSayfasi() {
    return (
        <main className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold mb-4">Mol Hesaplama Aracı</h1>
            <p className="text-[var(--muted)] mb-8">
                Kütle ve molar kütle değerlerini girerek mol sayısını
                hesaplayabilirsiniz.
            </p>

            <MolHesaplamaAraci />
        </main>
    );
}
