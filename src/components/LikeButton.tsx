"use client";
import { useState, useEffect } from "react";

export function LikeButton({
    articleId,
    initialLikes,
}: {
    articleId: string;
    initialLikes: number;
}) {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(initialLikes);

    useEffect(() => {
        const stored = localStorage.getItem(`liked_${articleId}`);
        if (stored === "true") setLiked(true);
    }, [articleId]);

    const toggleLike = () => {
        const newLiked = !liked;
        setLiked(newLiked);
        setCount((prev) => (newLiked ? prev + 1 : prev - 1));
        localStorage.setItem(`liked_${articleId}`, String(newLiked));
        // İsteğe bağlı: backend'e kaydetmek için fetch
    };

    return (
        <button
            onClick={toggleLike}
            className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-red-500 transition"
            aria-label="Beğen"
            aria-pressed={liked}
        >
            <svg
                className="w-4 h-4"
                fill={liked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
            <span>{count}</span>
        </button>
    );
}
