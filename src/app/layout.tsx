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

// Footer'da gösterilecek gerçek kategoriler (page.tsx'teki KATEGORILER ile uyumlu)
const FOOTER_KATEGORILER = [
    "Spor",
    "Teknoloji",
    "Ekonomi",
    "Dünya",
    "Sağlık",
    "Bilim",
];

// Sosyal linkler env'den gelir; tanımlı olmayanlar gösterilmez (ölü "#" link yok)
const ILETISIM_EPOSTA =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "iletisim@nedirbunlar.com.tr";

const SOSYAL_LINKLER = [
    { name: "X", url: process.env.NEXT_PUBLIC_X_URL },
    { name: "Instagram", url: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
].filter((s): s is { name: string; url: string } => Boolean(s.url));

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
                                    {FOOTER_KATEGORILER.map((cat) => (
                                        <Link
                                            key={cat}
                                            href={`/?kategori=${encodeURIComponent(cat)}`}
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
                                    İletişim
                                </h3>

                                {/* E-posta (her zaman gösterilir) */}
                                <a
                                    href={`mailto:${ILETISIM_EPOSTA}`}
                                    className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors break-all"
                                >
                                    {ILETISIM_EPOSTA}
                                </a>

                                {/* Sosyal linkler — yalnızca env'de tanımlıysa */}
                                {SOSYAL_LINKLER.length > 0 && (
                                    <div className="flex gap-3 mt-4">
                                        {SOSYAL_LINKLER.map((social) => (
                                            <a
                                                key={social.name}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all text-xs font-bold"
                                                aria-label={social.name}
                                            >
                                                {social.name === "X" ? (
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        className="w-4 h-4 fill-current"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        className="w-4 h-4 fill-current"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                                    </svg>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-8"></div>

                        {/* Copyright */}
                        <div className="text-center text-xs text-[var(--muted)] space-y-2">
                            <p>
                                © {new Date().getFullYear()} Nedir Bunlar? · Tüm
                                hakları saklıdır.
                            </p>
                            <p className="text-[10px] opacity-70">
                                İçerikler yapay zeka ile otomatik olarak
                                üretilmektedir.
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
