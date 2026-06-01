import Link from "next/link";
import { Makale } from "@/src/app/page";

export function Sidebar({ populerMakaleler }: { populerMakaleler: Makale[] }) {
    return (
        <div className="space-y-6 sticky top-24">
            {/* Popüler Makaleler */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-6 hover:border-[var(--accent)]/50 transition-all">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[var(--border)]">
                    <span className="text-xl">🔥</span>
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
                        En Çok Okunanlar
                    </h3>
                </div>
                <ul className="space-y-4">
                    {populerMakaleler.map((m, idx) => (
                        <li
                            key={m.id}
                            className="group flex gap-3 items-start hover:gap-4 transition-all"
                        >
                            <span className="text-sm font-bold w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-white flex items-center justify-center shrink-0 text-[12px]">
                                {idx + 1}
                            </span>
                            <Link
                                href={`/makale/${m.slug}`}
                                className="hover:text-[var(--accent)] transition-colors line-clamp-2 text-sm font-medium leading-tight group-hover:translate-x-0.5 transition-transform"
                            >
                                {m.seo_baslik || m.baslik}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Trend Konular */}
            <div className="bg-gradient-to-br from-[var(--card-bg)] to-[var(--accent-light)]/30 rounded-2xl border border-[var(--border)] p-6">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[var(--border)]">
                    <span className="text-xl">📈</span>
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
                        Trend Konular
                    </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[
                        { tag: "Seçim 2024", icon: "🗳️" },
                        { tag: "Yapay Zeka", icon: "🤖" },
                        { tag: "Spor", icon: "⚽" },
                        { tag: "Enflasyon", icon: "📊" },
                        { tag: "Teknoloji", icon: "💻" },
                    ].map((item) => (
                        <Link
                            key={item.tag}
                            href={`/?arama=${item.tag}`}
                            className="group inline-flex items-center gap-1.5 text-xs font-semibold
                                 bg-[var(--card-bg)] text-[var(--accent)] px-3 py-2 rounded-full
                                 border border-[var(--accent)]/30 hover:border-[var(--accent)]
                                 hover:bg-[var(--accent)] hover:text-white transition-all duration-200"
                        >
                            <span className="group-hover:scale-110 transition-transform">
                                {item.icon}
                            </span>
                            {item.tag}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Newsletter Aboneliği */}
            <div className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent-light)]/30 rounded-2xl border border-[var(--accent)]/20 p-6 relative overflow-hidden">
                {/* Dekoratif Arka Plan */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[var(--accent)]/5 blur-2xl -mr-16 -mt-16"></div>

                <div className="relative z-10">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold mb-2">
                        📬 Haftalık Bülten
                    </h3>
                    <p className="text-xs text-[var(--muted)] mb-4 leading-relaxed">
                        En önemli olayları her hafta özet halinde alın
                    </p>

                    <form className="flex flex-col gap-2">
                        <input
                            type="email"
                            placeholder="E-posta adresiniz"
                            className="w-full bg-[var(--card-bg)] border border-[var(--border)] 
                                 rounded-xl px-4 py-2.5 text-sm
                                 focus:border-[var(--accent)] focus:outline-none transition-colors"
                            required
                        />
                        <button
                            type="submit"
                            className="btn-primary w-full justify-center"
                        >
                            Abone Ol
                        </button>
                    </form>

                    <p className="text-[10px] text-[var(--muted)] mt-3 text-center">
                        Spamı sevmeyiz. Anlaşmayı kabul ediyorsunuz.
                    </p>
                </div>
            </div>

            {/* Hızlı Linkler */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-6">
                <h3 className="font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-widest mb-4">
                    Hızlı Linkler
                </h3>
                <ul className="space-y-2 text-sm">
                    {[
                        { label: "Tüm Makaleler", href: "/" },
                        { label: "Kategoriler", href: "/?kategori=Tümü" },
                        { label: "İletişim", href: "#" },
                    ].map((link) => (
                        <li key={link.label}>
                            <Link
                                href={link.href}
                                className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors
                                     flex items-center gap-2 group"
                            >
                                <span className="group-hover:translate-x-1 transition-transform">
                                    →
                                </span>
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
