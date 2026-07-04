// src/app/api/og/route.tsx
// Dinamik Open Graph görseli: /api/og?slug=<makale-slug>
// getAdminFirestore (Node SDK) kullandığı için runtime "nodejs" OLMALI (edge'de çalışmaz).

import { ImageResponse } from "next/og";
import { getAdminFirestore } from "@/src/lib/firebase-admin";

export const runtime = "nodejs";

// Kategori renkleri (globals.css'tekiyle aynı)
const KAT_RENK: Record<string, string> = {
    Spor: "#2563eb",
    Teknoloji: "#7c3aed",
    Siyaset: "#dc2626",
    Ekonomi: "#ca8a04",
    Eğlence: "#db2777",
    Sağlık: "#16a34a",
    Bilim: "#0891b2",
    Dünya: "#9333ea",
    "Kültür-Sanat": "#ea580c",
    Diğer: "#6b7280",
};
const ACCENT = "#e85d26";

// Playfair Display'i best-effort yükle — başarısız olursa varsayılan fontla devam
async function playfairYukle(text: string): Promise<ArrayBuffer | null> {
    try {
        const css = await fetch(
            `https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&text=${encodeURIComponent(text)}`,
            { headers: { "User-Agent": "Mozilla/5.0" } },
        ).then((r) => r.text());
        const fontUrl = css.match(/src:\s*url\((.+?)\)/)?.[1];
        if (!fontUrl) return null;
        return await fetch(fontUrl).then((r) => r.arrayBuffer());
    } catch {
        return null;
    }
}

// Başlık uzunluğuna göre font boyutu
function baslikBoyutu(len: number) {
    if (len > 75) return 46;
    if (len > 55) return 54;
    if (len > 35) return 64;
    return 72;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "";

    // Varsayılanlar (makale bulunamazsa marka kartı çıkar)
    let baslik = "Türkiye Gündemi, Sade Bir Dille";
    let kategori = "";
    let gorsel = "";

    if (slug) {
        try {
            const db = getAdminFirestore();
            const doc = await db.collection("makaleler").doc(slug).get();
            if (doc.exists) {
                const d = doc.data()!;
                baslik = d.seo_baslik || d.baslik || baslik;
                kategori = d.kategori || "";
                gorsel = d.gorsel_url || "";
            }
        } catch {
            // sessiz geç — marka kartı dönecek
        }
    }

    const katColor = KAT_RENK[kategori] || ACCENT;
    const font = await playfairYukle(`${baslik} Nedir Bunlar? ${kategori}`);

    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                position: "relative",
                backgroundColor: "#14110f",
                color: "#f5f2ec",
                fontFamily: font ? "Playfair" : "serif",
            }}
        >
            {/* Kapak görseli (varsa) */}
            {gorsel && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={gorsel}
                    alt=""
                    width={1200}
                    height={630}
                    style={{
                        position: "absolute",
                        inset: 0,
                        objectFit: "cover",
                    }}
                />
            )}

            {/* Karartma gradyanı */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    background: gorsel
                        ? "linear-gradient(to top, rgba(10,8,6,0.95) 35%, rgba(10,8,6,0.5) 72%, rgba(10,8,6,0.3))"
                        : "linear-gradient(135deg, #211c17, #14110f)",
                }}
            />

            {/* Üst: site adı */}
            <div
                style={{
                    position: "absolute",
                    top: 50,
                    left: 60,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        width: 14,
                        height: 14,
                        borderRadius: 999,
                        backgroundColor: ACCENT,
                        marginRight: 12,
                    }}
                />
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                    Nedir Bunlar?
                </div>
            </div>

            {/* Alt: kategori rozeti + başlık + accent çizgi */}
            <div
                style={{
                    position: "absolute",
                    bottom: 56,
                    left: 60,
                    right: 60,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {kategori && (
                    <div
                        style={{
                            display: "flex",
                            alignSelf: "flex-start",
                            marginBottom: 22,
                            padding: "6px 20px",
                            borderRadius: 999,
                            fontSize: 22,
                            fontWeight: 700,
                            letterSpacing: 2,
                            textTransform: "uppercase",
                            color: "#fff",
                            backgroundColor: katColor,
                        }}
                    >
                        {kategori}
                    </div>
                )}
                <div
                    style={{
                        display: "flex",
                        fontSize: baslikBoyutu(baslik.length),
                        fontWeight: 700,
                        lineHeight: 1.12,
                        letterSpacing: -1,
                    }}
                >
                    {baslik}
                </div>
                <div
                    style={{
                        display: "flex",
                        marginTop: 26,
                        width: 90,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: ACCENT,
                    }}
                />
            </div>
        </div>,
        {
            width: 1200,
            height: 630,
            fonts: font
                ? [
                      {
                          name: "Playfair",
                          data: font,
                          weight: 700,
                          style: "normal",
                      },
                  ]
                : undefined,
            headers: {
                // OG görselleri statik — agresif cache'le
                "Cache-Control": "public, max-age=86400, immutable",
            },
        },
    );
}
