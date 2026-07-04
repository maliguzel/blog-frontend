/**
 * app/api/hizmet-gruplari/route.ts
 *
 * GET /api/hizmet-gruplari
 *
 * Firestore'daki `hizmet_gruplari` koleksiyonundan aktif == true olan
 * ilk dokümanı döner.
 */

import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/src/lib/firebase-admin";

// Bu veri Python script'i tarafından dönemsel olarak (2 ayda bir)
// güncellendiği için Next.js'in statik olarak cache'lememesi gerekir.
// Route her istekte Firestore'a gidip güncel "aktif" dokümanı çeker.
export const dynamic = "force-dynamic";

interface HizmetGruplariResponse {
    success: true;
    data: {
        id: string;
        donem: string;
        donem_label: string;
        kaynak_url: string;
        veriler: Record<string, unknown>;
    };
}

interface HataResponse {
    success: false;
    error: string;
}

export async function GET(): Promise<
    NextResponse<HizmetGruplariResponse | HataResponse>
> {
    try {
        const db = getAdminFirestore();

        const snapshot = await db
            .collection("hizmet_gruplari")
            .where("aktif", "==", true)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Aktif hizmet grubu verisi bulunamadı.",
                },
                { status: 404 },
            );
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        if (!data?.veriler || typeof data.veriler !== "object") {
            return NextResponse.json(
                {
                    success: false,
                    error: `'${doc.id}' dokümanında geçerli bir 'veriler' alanı bulunamadı.`,
                },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: doc.id,
                donem: (data.donem as string) ?? doc.id,
                donem_label: (data.donem_label as string) ?? doc.id,
                kaynak_url: (data.kaynak_url as string) ?? "",
                veriler: data.veriler as Record<string, unknown>,
            },
        });
    } catch (error) {
        const mesaj =
            error instanceof Error
                ? error.message
                : "Bilinmeyen bir hata oluştu.";
        return NextResponse.json(
            { success: false, error: mesaj },
            { status: 500 },
        );
    }
}
