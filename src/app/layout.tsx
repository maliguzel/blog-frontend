// src/app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4 } from "next/font/google";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import "./globals.css";
import Script from "next/script";
import Link from "next/link";

const playfair = Playfair_Display({
    variable: "--font-display",
    subsets: ["latin"],
    weight: ["400", "600", "700", "800"],
    display: "swap",
});

const sourceSerif = Source_Serif_4({
    variable: "--font-body",
    subsets: ["latin"],
    weight: ["300", "400", "600"],
    display: "swap",
});

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://nedirbunlar.com.tr";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),

    title: {
        default: "Ana Sayfa",
        template: "%s | Nedir Bunlar?",
    },

    description:
        "Türkiye'nin gündemindeki trendler, olaylar ve merak edilenler - Nedir Bunlar? ile derinlemesine analiz.",

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-video-preview": -1,
            "max-snippet": -1,
        },
    },

    openGraph: {
        siteName: "Nedir Bunlar?",
        locale: "tr_TR",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang="tr"
            className={`${playfair.variable} ${sourceSerif.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
                {/* ── Modern Sticky Header ── */}
                <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-[var(--border)]/40 bg-[var(--card-bg)]/80">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <Link
                                href="/"
                                className="group flex items-center gap-2 relative"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
                                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center text-white font-bold text-lg">
                                        ?
                                    </div>
                                </div>
                                <div>
                                    <h1 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                                        Nedir Bunlar?
                                    </h1>
                                    <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold hidden sm:block">
                                        Türkiye Gündemi
                                    </p>
                                </div>
                            </Link>

                            {/* Sağ Taraf - Motto ve Theme Toggle */}
                            <div className="flex items-center gap-4 sm:gap-6">
                                <span className="text-xs text-[var(--muted)] hidden sm:block max-w-xs text-right font-medium leading-tight">
                                    Gündemin Peşinde,{" "}
                                    <br className="hidden md:block" />
                                    <span className="text-[var(--accent)]">
                                        Merakın Rehberi
                                    </span>
                                </span>
                                <div className="w-px h-8 bg-[var(--border)] hidden sm:block"></div>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Ana İçerik ── */}
                <main className="flex-1">{children}</main>

                {/* ── Modern Footer ── */}
                <footer className="border-t border-[var(--border)]/40 mt-20 py-12 bg-[var(--card-bg)]/50 backdrop-blur">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                            {/* Hakkında */}
                            <div>
                                <h3 className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-widest mb-3 text-[var(--foreground)]">
                                    Hakkında
                                </h3>
                                <p className="text-xs text-[var(--muted)] leading-relaxed">
                                    Türkiye'nin gündemini yakından takip ederek,
                                    merak edilen konuları sade ve anlaşılır
                                    dilde analiz ediyoruz.
                                </p>
                            </div>

                            {/* Kategoriler */}
                            <div>
                                <h3 className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-widest mb-3 text-[var(--foreground)]">
                                    Kategoriler
                                </h3>
                                <div className="flex flex-wrap gap-1">
                                    {[
                                        "Spor",
                                        "Teknoloji",
                                        "Ekonomi",
                                        "Sağlık",
                                    ].map((cat) => (
                                        <Link
                                            key={cat}
                                            href={`/?kategori=${cat}`}
                                            className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                                        >
                                            {cat} ·
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* İletişim */}
                            <div>
                                <h3 className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-widest mb-3 text-[var(--foreground)]">
                                    Sosyal Medya
                                </h3>
                                <div className="flex gap-3">
                                    {[
                                        { name: "Twitter", icon: "𝕏" },
                                        { name: "Instagram", icon: "📸" },
                                    ].map((social) => (
                                        <a
                                            key={social.name}
                                            href="#"
                                            className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all text-sm"
                                            aria-label={social.name}
                                        >
                                            {social.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-8"></div>

                        {/* Copyright */}
                        <div className="text-center text-xs text-[var(--muted)] space-y-2">
                            <p>
                                © {new Date().getFullYear()} Nedir Bunlar? ·
                                Otomatik olarak üretilmiştir.
                            </p>
                            <p className="text-[10px] opacity-70">
                                Tasarım & Geliştirme: Modern Teknoloji
                            </p>
                        </div>
                    </div>
                </footer>

                {/* ── Google Analytics ── */}
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-EN7ZGL36XC"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-EN7ZGL36XC');
                    `}
                </Script>
            </body>
        </html>
    );
}
