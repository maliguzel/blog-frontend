// src/app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4 } from "next/font/google";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import "./globals.css";
import Script from "next/script";

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
                <header className="border-b border-[var(--border)] bg-[var(--card-bg)] sticky top-0 z-50">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                        <a
                            href="/"
                            className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight hover:text-[var(--accent)] transition-colors"
                        >
                            Nedir Bunlar?
                        </a>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-[var(--muted)] hidden sm:block">
                                Gündemin peşinde, merakın rehberi
                            </span>
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <main className="flex-1">{children}</main>

                <footer className="border-t border-[var(--border)] mt-16 py-8 text-center text-sm text-[var(--muted)]">
                    <p>
                        © {new Date().getFullYear()} Nedir Bunlar? · Otomatik
                        olarak üretilmiştir.
                    </p>
                </footer>
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
