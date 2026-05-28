"use client";

import { useEffect, useRef } from "react";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

interface ReadCounterProps {
    docId: string; // Firestore belgesinin gerçek ID'si (slug DEĞİL)
}

export function ReadCounter({ docId }: ReadCounterProps) {
    const hasRun = useRef(false);

    useEffect(() => {
        // Belge ID yoksa veya zaten çalıştıysa tekrar deneme
        if (!docId || hasRun.current) return;
        hasRun.current = true;

        const ref = doc(db, "makaleler", docId);
        updateDoc(ref, { okunma_sayisi: increment(1) }).catch((err) => {
            // Sayaç kritik değil, sessizce başarısız ol
            if (process.env.NODE_ENV === "development") {
                console.warn("Okunma sayacı güncellenemedi:", err);
            }
        });
    }, [docId]);

    return null;
}
