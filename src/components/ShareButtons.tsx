"use client";

import { useState } from "react";

type Props = { baslik: string; slug: string };

export function ShareButtons({ baslik, slug }: Props) {
    const [copied, setCopied] = useState(false);

    const url =
        typeof window !== "undefined"
            ? `${window.location.origin}/makale/${slug}`
            : `/makale/${slug}`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(baslik)}&url=${encodeURIComponent(url)}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        `${baslik}\n${url}`,
    )}`;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            /* Sessizce geç */
        }
    };

    const shareButtons = [
        {
            name: "Twitter / X",
            icon: "𝕏",
            href: twitterUrl,
            color: "hover:text-black dark:hover:text-white",
            borderColor: "hover:border-black dark:hover:border-white",
        },
        {
            name: "WhatsApp",
            icon: "💬",
            href: whatsappUrl,
            color: "hover:text-green-500",
            borderColor: "hover:border-green-500",
        },
        {
            name: "Linki Kopyala",
            icon: copied ? "✓" : "📋",
            onClick: copyLink,
            color: copied ? "text-green-500" : "hover:text-[var(--accent)]",
            borderColor: copied
                ? "border-green-500"
                : "hover:border-[var(--accent)]",
        },
    ];

    return (
        <div className="flex items-center gap-3 py-4 px-6 bg-[var(--card-bg)] rounded-2xl border border-[var(--border)]">
            <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Paylaş:
            </span>

            <div className="flex items-center gap-2">
                {shareButtons.map((btn, idx) => (
                    <div key={idx} className="group relative">
                        {btn.href ? (
                            <a
                                href={btn.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={btn.name}
                                className={`w-9 h-9 rounded-full border border-[var(--border)] 
                                       flex items-center justify-center transition-all duration-200
                                       text-sm font-bold hover:scale-110 hover:shadow-lg
                                       ${btn.color} ${btn.borderColor}`}
                                title={btn.name}
                            >
                                {btn.icon}
                            </a>
                        ) : (
                            <button
                                onClick={btn.onClick}
                                aria-label={btn.name}
                                className={`w-9 h-9 rounded-full border border-[var(--border)]
                                       flex items-center justify-center transition-all duration-200
                                       text-sm font-bold hover:scale-110 hover:shadow-lg
                                       ${btn.color} ${btn.borderColor}`}
                                title={btn.name}
                            >
                                {btn.icon}
                            </button>
                        )}

                        {/* Tooltip */}
                        <div
                            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--card-bg)] 
                                   text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity 
                                   whitespace-nowrap pointer-events-none font-medium"
                        >
                            {copied && btn.name === "Linki Kopyala"
                                ? "Kopyalandı!"
                                : btn.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
