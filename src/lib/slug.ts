// src/lib/slug.ts
// Python otomasyon.py'deki create_slug ile BİREBİR aynı çıktıyı üretmeli.
// icerik_basliklari_cikar() anchor'ları bununla üretiyor; makale içindeki
// h2/h3 id'leri de bununla üretilince TOC linkleri tutar.

const TR_HARITA: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
};

export function createSlug(text: string): string {
    let t = (text ?? "").toString().toLowerCase().trim();

    // Türkçe harfleri çevir (Python .lower() sonrası replace ile aynı sıra)
    for (const [tr, en] of Object.entries(TR_HARITA)) {
        t = t.split(tr).join(en);
    }

    // a-z, 0-9, boşluk ve tire dışını at (combining dot vb. burada temizlenir)
    t = t.replace(/[^a-z0-9\s-]/g, "");

    // boşluk/tire gruplarını tek tireye indir, baştaki/sondaki tireyi kırp
    const slug = t.replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "");

    return slug.slice(0, 90);
}

// React children'dan düz metin çıkarır (h2 içinde <strong> vb. olabilir)
import { Children, isValidElement, type ReactNode } from "react";

export function cocukMetni(children: ReactNode): string {
    return Children.toArray(children)
        .map((c) => {
            if (typeof c === "string" || typeof c === "number")
                return String(c);
            if (isValidElement(c)) {
                return cocukMetni(
                    (c.props as { children?: ReactNode }).children,
                );
            }
            return "";
        })
        .join("");
}
