import { posts } from "@/content/posts";

export interface FAQ {
  q: string;
  a: string;
}

export interface Post {
  /** URL sugerida: /blog/<slug> */
  slug: string;
  /** Título SEO (<title>), ideal ≤ 60 caracteres. */
  title: string;
  /** Encabezado H1 visible (puede diferir del title SEO). */
  h1: string;
  /** Meta description, ideal ≤ 155 caracteres. */
  description: string;
  /** Palabra clave foco (keyword principal de oportunidad). */
  focusKeyword: string;
  /** Keywords secundarias / variantes que también ataca el artículo. */
  keywords: string[];
  /** Categoría del catálogo a la que enlaza (para CTA e internal linking). */
  category?: string;
  /** Intención de búsqueda dominante. */
  intent: "comercial" | "informacional" | "transaccional";
  datePublished: string;
  dateModified: string;
  readingMinutes: number;
  /** Resumen para listados y OG. */
  excerpt: string;
  /** Cuerpo en Markdown (GFM). */
  body: string;
  /** Preguntas frecuentes (se renderizan y alimentan el FAQPage JSON-LD). */
  faqs: FAQ[];
}

export function getAllPosts(): Post[] {
  return [...posts].sort(
    (a, b) => +new Date(b.datePublished) - +new Date(a.datePublished),
  );
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): Post[] {
  const current = getPostBySlug(slug);
  if (!current) return getAllPosts().slice(0, limit);
  return getAllPosts()
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const shared = p.keywords.filter((k) =>
        current.keywords.some((c) => c.toLowerCase() === k.toLowerCase()),
      ).length;
      const sameCat = p.category && p.category === current.category ? 2 : 0;
      return { p, score: shared + sameCat };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}
