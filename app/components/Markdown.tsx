import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

/**
 * Renderiza Markdown (GFM) con estilos tipográficos consistentes con la marca.
 * Los enlaces internos (que empiezan con "/") usan next/link.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="article-body text-[1.0625rem] leading-relaxed text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="mt-12 scroll-mt-24 text-2xl font-bold tracking-tight text-ink">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 text-xl font-semibold text-ink">{children}</h3>
          ),
          p: ({ children }) => <p className="mt-5">{children}</p>,
          ul: ({ children }) => (
            <ul className="mt-5 list-disc space-y-2 pl-6 marker:text-brand-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-5 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-brand-500">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          a: ({ href, children }) => {
            const url = href || "#";
            if (url.startsWith("/")) {
              return (
                <Link
                  href={url}
                  className="font-semibold text-brand-600 underline-offset-2 hover:underline"
                >
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-600 underline-offset-2 hover:underline"
              >
                {children}
              </a>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="mt-6 rounded-r-xl border-l-4 border-brand-400 bg-brand-50/60 px-5 py-3 text-slate-700">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
          th: ({ children }) => (
            <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-ink">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-200 px-3 py-2 align-top">{children}</td>
          ),
          code: ({ children }) => (
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] text-brand-700">
              {children}
            </code>
          ),
          hr: () => <hr className="my-10 border-slate-100" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
