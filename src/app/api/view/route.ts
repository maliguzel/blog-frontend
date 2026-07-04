// src/app/api/view/route.ts
// Okunma sayacını SADECE server artırır. İstemci Firestore'a hiç dokunmaz.
// getAdminFirestore (Node SDK) → runtime "nodejs".

import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/src/lib/firebase-admin";

export const runtime = "nodejs";

const COOKIE = "nb_v"; // görülen makaleler (dedup)
const MAX_SLUG = 30; // cookie'de tutulacak en fazla slug — 30 × ~90 ≈ 2.7KB,
//                      attribute payıyla birlikte 4KB tarayıcı limitinin altında.
//                      (60 iken ~5.4KB olup limit aşılınca tarayıcı cookie'yi
//                       sessizce atıyor ve dedup bozuluyordu.)
const COOLDOWN = 60 * 60 * 12; // 12 saat (saniye)

export async function POST(req: NextRequest) {
    // ── CSRF / script koruması: yalnızca kendi origin'imizden ──
    const origin = req.headers.get("origin");
    if (!origin) {
        return NextResponse.json({ ok: false }, { status: 403 });
    }
    try {
        if (new URL(origin).host !== req.nextUrl.host) {
            return NextResponse.json({ ok: false }, { status: 403 });
        }
    } catch {
        return NextResponse.json({ ok: false }, { status: 403 });
    }

    // ── Slug oku ──
    let slug = "";
    try {
        const body = await req.json();
        slug = typeof body?.slug === "string" ? body.slug.slice(0, 120) : "";
    } catch {
        /* gövde yok */
    }
    if (!slug) {
        return NextResponse.json(
            { ok: false, error: "slug yok" },
            { status: 400 },
        );
    }

    // ── Cookie dedup: bu tarayıcı bu makaleyi yakında saydıysa atla ──
    const mevcut = req.cookies.get(COOKIE)?.value ?? "";
    const gorulen = mevcut ? mevcut.split(",").filter(Boolean) : [];
    if (gorulen.includes(slug)) {
        return NextResponse.json({ ok: true, counted: false });
    }

    // ── Sadece var olan makaleyi say (rastgele slug şişiremesin) ──
    try {
        const db = getAdminFirestore();
        const ref = db.collection("makaleler").doc(slug);
        const snap = await ref.get();
        if (!snap.exists) {
            return NextResponse.json(
                { ok: false, error: "yok" },
                { status: 404 },
            );
        }
        await ref.update({ okunma_sayisi: FieldValue.increment(1) });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }

    // ── Cookie güncelle (son MAX_SLUG slug, FIFO) ──
    const yeni = [...gorulen, slug].slice(-MAX_SLUG).join(",");
    const res = NextResponse.json({ ok: true, counted: true });
    res.cookies.set(COOKIE, yeni, {
        maxAge: COOLDOWN,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    });
    return res;
}
