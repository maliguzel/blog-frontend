// src/components/JsonLd.tsx
// JSON-LD script tag'i. Server component — "use client" YOK.
// Tekil obje, dizi ya da null (faqSchema null dönebilir) kabul eder.

export function JsonLd({ data }: { data: object | (object | null)[] | null }) {
    const liste = (Array.isArray(data) ? data : [data]).filter(
        (x): x is object => !!x,
    );
    if (!liste.length) return null;

    return (
        <>
            {liste.map((sema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    // JSON.stringify XSS'e karşı </script> kaçışı: nadir ama güvenli taraf
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(sema).replace(/</g, "\\u003c"),
                    }}
                />
            ))}
        </>
    );
}
