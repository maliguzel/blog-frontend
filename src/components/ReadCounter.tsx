// src/components/ReadCounter.tsx
"use client";

import { useEffect, useRef } from "react";

// Artık Firestore'a dokunmuyor; sadece /api/view'e haber veriyor.
export function ReadCounter({ slug }: { slug: string }) {
    const ran = useRef(false);

    useEffect(() => {
        if (!slug || ran.current) return;
        ran.current = true;

        // Aynı sekme oturumunda tekrar istek atma (gereksiz trafiği önler)
        const key = `nb_v_${slug}`;
        try {
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, "1");
        } catch {
            /* sessionStorage kapalıysa devam et */
        }

        fetch("/api/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
            keepalive: true, // sayfadan hızlı çıkışta da gitsin
        }).catch(() => {
            /* sayaç kritik değil, sessizce geç */
        });
    }, [slug]);

    return null;
}
