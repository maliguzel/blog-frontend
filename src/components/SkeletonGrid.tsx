export function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card-bg)]"
                    style={{
                        animation: `fadeUp 0.6s ease-out forwards`,
                        animationDelay: `${i * 60}ms`,
                    }}
                >
                    {/* Görsel Placeholder */}
                    <div className="h-52 skeleton relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    </div>

                    {/* İçerik Placeholder */}
                    <div className="p-6 space-y-4">
                        {/* Badge */}
                        <div className="flex gap-2">
                            <div className="h-6 w-24 skeleton rounded-full"></div>
                        </div>

                        {/* Başlık */}
                        <div className="space-y-2">
                            <div className="h-6 w-5/6 skeleton rounded-lg"></div>
                            <div className="h-6 w-4/5 skeleton rounded-lg"></div>
                        </div>

                        {/* Özet */}
                        <div className="space-y-2">
                            <div className="h-4 w-full skeleton rounded-lg"></div>
                            <div className="h-4 w-5/6 skeleton rounded-lg"></div>
                        </div>

                        {/* Alt Bilgi */}
                        <div className="flex gap-4 pt-2">
                            <div className="h-4 w-20 skeleton rounded-lg"></div>
                            <div className="h-4 w-20 skeleton rounded-lg"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
