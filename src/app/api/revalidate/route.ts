// src/app/api/revalidate/route.ts
// Otomasyon yeni makale yayınlayınca/güncelleyince çağırır → cache anında tazelenir.
// Çağrı: POST /api/revalidate?secret=XXX   body: { "slug": "..." }

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    // Gizli anahtar kontrolü (sadece otomasyon tetikleyebilsin)
    const secret = req.nextUrl.searchParams.get("secret");
    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    let slug = "";
    try {
        const body = await req.json();
        slug = typeof body?.slug === "string" ? body.slug : "";
    } catch {
        /* gövde yok */
    }

    // Anasayfa + kategori listelerini cache'leyen unstable_cache'i tazele
    revalidateTag("makaleler");

    // İlgili makale sayfasını (ISR) hemen yenile
    if (slug) revalidatePath(`/makale/${slug}`);

    // Anasayfa (dynamic ise no-op, zararsız)
    revalidatePath("/");

    return NextResponse.json({ ok: true, revalidated: true, slug });
}
