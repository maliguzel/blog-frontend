// src/app/api/revalidate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const secret = req.nextUrl.searchParams.get("secret");

    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    let slug = "";

    try {
        const body = await req.json();
        slug = typeof body?.slug === "string" ? body.slug : "";
    } catch {
        // gövde yok
    }

    // NOT: Firestore admin SDK ile veri çekildiği için bu tag'in bağlı
    // olduğu cache yalnızca unstable_cache(fn, keys, { tags: ["makaleler"] })
    // ile sarılmış okumalarda çalışır. Şu an gerçek yenileme revalidatePath'ten.
    revalidateTag("makaleler");

    if (slug) {
        revalidatePath(`/makale/${slug}`);
    }

    revalidatePath("/");

    return NextResponse.json({
        ok: true,
        revalidated: true,
        slug,
    });
}
