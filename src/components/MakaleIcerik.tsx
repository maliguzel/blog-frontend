// src/components/MakaleIcerik.tsx
// react-markdown kullanır:  npm i react-markdown remark-gfm
//
// h2/h3 başlıklarına createSlug(metin) ile id basar — TOC anchor'larıyla
// BİREBİR eşleşir. Yoksa #linkler boşa düşer.

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createSlug, cocukMetni } from "@/src/lib/slug";

export function MakaleIcerik({ icerik }: { icerik: string }) {
    return (
        <div className="prose max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h2: ({ children }) => (
                        <h2 id={createSlug(cocukMetni(children))}>
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 id={createSlug(cocukMetni(children))}>
                            {children}
                        </h3>
                    ),
                }}
            >
                {icerik}
            </ReactMarkdown>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// ALTERNATİF: marked + dangerouslySetInnerHTML kullanıyorsan
// renderer'ı değiştiremezsin; HTML string'ini post-process et:
//
//   import { marked } from "marked";
//   import { createSlug } from "@/src/lib/slug";
//
//   const html = marked.parse(icerik) as string;
//   const htmlIdli = html.replace(
//       /<(h[23])>(.*?)<\/\1>/g,
//       (_, tag, ic) => {
//           const dumduz = ic.replace(/<[^>]+>/g, ""); // iç etiketleri at
//           return `<${tag} id="${createSlug(dumduz)}">${ic}</${tag}>`;
//       }
//   );
//   // <div className="prose" dangerouslySetInnerHTML={{ __html: htmlIdli }} />
// ─────────────────────────────────────────────────────────────
