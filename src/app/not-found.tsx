// src/app/not-found.tsx
// next.js bu dosyayı notFound() çağrıldığında otomatik kullanır

import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <p className="text-8xl mb-6 select-none">📄</p>
            <h1 className="font-display text-5xl font-extrabold mb-3">
                404
            </h1>
            <p className="text-xl text-(--muted) mb-2">
                Makale bulunamadı
            </p>
            <p className="text-sm text-(--muted) max-w-sm mb-8">
                Aradığınız makale silinmiş ya da hiç oluşturulmamış olabilir.
            </p>
            <Link
                href="/"
                className="inline-flex items-center gap-2 bg-(--accent) text-white
                   px-6 py-3 rounded-xl font-semibold text-sm
                   hover:opacity-90 transition-opacity"
            >
                Ana sayfaya dön
            </Link>
        </div>
    );
}
