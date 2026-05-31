import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4 } from "next/font/google";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import Link from "next/link";
import "./globals.css";

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

export const metadata: Metadata = {
    title: {
        default: "Ana Sayfa",
        template: "%s | Nedir Bunlar?",
    },
    description:
        "Türkiye'nin gündemindeki trendler, olaylar ve merak edilenler - Nedir Bunlar? ile derinlemesine analiz.",
    openGraph: {
        siteName: "Nedir Bunlar?",
        locale: "tr_TR",
        type: "website",
    },
};

const NAV_LINKS = [
    { href: "/kategori/gundem", label: "Gündem" },
    { href: "/kategori/teknoloji", label: "Teknoloji" },
    { href: "/kategori/ekonomi", label: "Ekonomi" },
    { href: "/kategori/kultur", label: "Kültür" },
    { href: "/kategori/spor", label: "Spor" },
    { href: "/kategori/dunya", label: "Dünya" },
    { href: "/kategori/bilim", label: "Bilim" },
];

function getCurrentDateTR() {
    return new Date().toLocaleDateString("tr-TR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang="tr"
            className={`${playfair.variable} ${sourceSerif.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
                {/* ── HEADER ─────────────────────────────────────────────── */}
                <header className="bg-[var(--card-bg)] sticky top-0 z-50 shadow-[0_1px_0_var(--border),0_2px_8px_rgba(0,0,0,0.04)]">
                    {/* Top Strip — tarih + slogan + tema */}
                    <div className="border-b border-[var(--border)]">
                        <div className="max-w-6xl mx-auto px-6 h-9 flex items-center justify-between">
                            <time
                                dateTime={new Date().toISOString()}
                                className="text-[11px] tracking-widest uppercase text-[var(--muted)] font-[family-name:var(--font-body)] hidden sm:block"
                            >
                                {getCurrentDateTR()}
                            </time>

                            <p className="text-[11px] tracking-widest uppercase text-[var(--muted)] font-[family-name:var(--font-body)] sm:hidden">
                                Nedir Bunlar?
                            </p>

                            <div className="flex items-center gap-4">
                                <span className="text-[11px] tracking-widest uppercase text-[var(--muted)] hidden md:block">
                                    Gündemin peşinde · Merakın rehberi
                                </span>
                                <div className="w-px h-4 bg-[var(--border)]" />
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>

                    {/* Logo Alanı */}
                    <div className="border-b border-[var(--border)]">
                        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-center relative">
                            {/* Sol dekoratif çizgi */}
                            <div className="hidden md:flex items-center gap-3 absolute left-6">
                                <div className="h-px w-12 bg-[var(--accent)] opacity-60" />
                                <div className="h-px w-4 bg-[var(--border)]" />
                            </div>

                            <Link
                                href="/"
                                className="group flex flex-col items-center gap-0.5"
                                aria-label="Ana Sayfa - Nedir Bunlar?"
                            >
                                <span className="font-[family-name:var(--font-display)] text-[2.1rem] md:text-[2.6rem] font-extrabold tracking-[-0.02em] leading-none group-hover:text-[var(--accent)] transition-colors duration-200">
                                    Nedir Bunlar?
                                </span>
                                <span className="text-[10px] tracking-[0.25em] uppercase text-[var(--muted)] font-[family-name:var(--font-body)]">
                                    Derinlemesine Analiz
                                </span>
                            </Link>

                            {/* Sağ dekoratif çizgi */}
                            <div className="hidden md:flex items-center gap-3 absolute right-6">
                                <div className="h-px w-4 bg-[var(--border)]" />
                                <div className="h-px w-12 bg-[var(--accent)] opacity-60" />
                            </div>
                        </div>
                    </div>

                    {/* Navigasyon */}
                    <div>
                        <nav
                            aria-label="Ana navigasyon"
                            className="max-w-6xl mx-auto px-6 h-10 flex items-center gap-0 overflow-x-auto scrollbar-none"
                        >
                            {NAV_LINKS.map((link, i) => (
                                <span
                                    key={link.href}
                                    className="flex items-center shrink-0"
                                >
                                    {i > 0 && (
                                        <span
                                            aria-hidden="true"
                                            className="text-[var(--border)] mx-0.5 select-none text-xs"
                                        >
                                            ·
                                        </span>
                                    )}
                                    <Link
                                        href={link.href}
                                        className="px-2.5 py-1 text-[12.5px] tracking-wide font-[family-name:var(--font-body)] font-semibold text-[var(--muted)] hover:text-[var(--accent)] transition-colors uppercase"
                                    >
                                        {link.label}
                                    </Link>
                                </span>
                            ))}
                        </nav>
                    </div>
                </header>

                {/* ── CONTENT ────────────────────────────────────────────── */}
                <main className="flex-1">{children}</main>

                {/* ── FOOTER ─────────────────────────────────────────────── */}
                <footer className="mt-20 border-t-2 border-[var(--foreground)] bg-[var(--card-bg)]">
                    {/* Ana footer içeriği */}
                    <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Kolon 1 — Marka */}
                        <div className="md:col-span-1">
                            <Link
                                href="/"
                                className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight hover:text-[var(--accent)] transition-colors"
                            >
                                Nedir Bunlar?
                            </Link>
                            <p className="mt-3 text-sm font-[family-name:var(--font-body)] text-[var(--muted)] leading-relaxed max-w-xs">
                                Türkiye'nin gündemine dair trendler, gelişmeler
                                ve merak edilenler — sade dille, derinlemesine.
                            </p>
                            <div className="mt-5 h-px w-10 bg-[var(--accent)]" />
                            <p className="mt-4 text-[11px] tracking-widest uppercase text-[var(--muted)]">
                                Otomatik olarak üretilmektedir
                            </p>
                        </div>

                        {/* Kolon 2 — Kategoriler */}
                        <div>
                            <h3 className="font-[family-name:var(--font-body)] text-[11px] tracking-widest uppercase text-[var(--muted)] mb-4 font-semibold">
                                Kategoriler
                            </h3>
                            <ul className="space-y-2">
                                {NAV_LINKS.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm font-[family-name:var(--font-body)] text-[var(--muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-2 group"
                                        >
                                            <span className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                                                →
                                            </span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Kolon 3 — Hakkında */}
                        <div>
                            <h3 className="font-[family-name:var(--font-body)] text-[11px] tracking-widest uppercase text-[var(--muted)] mb-4 font-semibold">
                                Site Hakkında
                            </h3>
                            <ul className="space-y-2">
                                {[
                                    { href: "/hakkinda", label: "Hakkımızda" },
                                    {
                                        href: "/gizlilik",
                                        label: "Gizlilik Politikası",
                                    },
                                    {
                                        href: "/kullanim-kosullari",
                                        label: "Kullanım Koşulları",
                                    },
                                    { href: "/iletisim", label: "İletişim" },
                                ].map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm font-[family-name:var(--font-body)] text-[var(--muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-2 group"
                                        >
                                            <span className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                                                →
                                            </span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Alt şerit */}
                    <div className="border-t border-[var(--border)]">
                        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                            <p className="text-[11px] text-[var(--muted)] tracking-wide font-[family-name:var(--font-body)]">
                                © {new Date().getFullYear()} Nedir Bunlar? — Tüm
                                hakları saklıdır.
                            </p>
                            <p className="text-[11px] text-[var(--muted)] tracking-wide font-[family-name:var(--font-body)]">
                                Yapay zeka ile otomatik üretilmiştir.
                            </p>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
