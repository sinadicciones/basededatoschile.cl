import type { Product, SearchFilters } from "./types";
import snapshot from "@/data/catalog.json";
import { fetchLiveCatalog, hasStorefront } from "./shopify";

const SNAPSHOT = snapshot as Product[];

let cache: { data: Product[]; at: number } | null = null;
const TTL = 1000 * 60 * 30; // 30 min

/**
 * Devuelve el catálogo. Usa la Storefront API en vivo si está configurada
 * (con caché en memoria) y cae al snapshot empaquetado en caso contrario.
 */
export async function getCatalog(): Promise<Product[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  let data: Product[] = SNAPSHOT;
  if (hasStorefront()) {
    const live = await fetchLiveCatalog();
    if (live && live.length) data = live;
  }
  cache = { data, at: Date.now() };
  return data;
}

/** Versión síncrona basada solo en el snapshot (para uso en build/SSR rápido). */
export function getCatalogSync(): Product[] {
  return SNAPSHOT;
}

export interface CategorySummary {
  type: string;
  count: number;
  /** Mínimo precio dentro de la categoría. */
  fromPrice: number | null;
}

/** Resumen de categorías ordenado por cantidad de productos. */
export function getCategories(products: Product[]): CategorySummary[] {
  const map = new Map<string, { count: number; min: number | null }>();
  for (const p of products) {
    const key = normalizeType(p.type);
    const cur = map.get(key) || { count: 0, min: null };
    cur.count += 1;
    if (p.price != null) cur.min = cur.min == null ? p.price : Math.min(cur.min, p.price);
    map.set(key, cur);
  }
  return Array.from(map.entries())
    .map(([type, v]) => ({ type, count: v.count, fromPrice: v.min }))
    .sort((a, b) => b.count - a.count);
}

/** Normaliza variantes de tipo (mayúsc/minúsc) en una etiqueta canónica. */
export function normalizeType(type: string): string {
  const t = type.trim().toLowerCase();
  const canon: Record<string, string> = {
    empresas: "Empresas",
    personas: "Personas",
    profesionales: "Profesionales",
    ejecutivos: "Ejecutivos",
    directorios: "Directorios",
    ministerios: "Ministerios",
    municipalidades: "Municipalidades",
    "e-commerce": "E-commerce",
    autos: "Autos",
    curso: "Cursos",
    "base de datos": "Bases destacadas",
  };
  return canon[t] || (type.trim() ? type.trim() : "Otros");
}

/** Lista de tags más frecuentes para chips de filtrado. */
export function getTopTags(products: Product[], limit = 24): string[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    for (const tag of p.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Motor de búsqueda/ranking sobre el catálogo. Puntúa por coincidencia en
 * título, tipo, tags y descripción. Devuelve productos ordenados por score.
 */
export function searchProducts(
  products: Product[],
  filters: SearchFilters,
  limit = 12,
): Product[] {
  const { query, type, tags, minPrice, maxPrice, minContacts } = filters;
  const terms = query ? norm(query).split(/\s+/).filter((t) => t.length > 2) : [];

  const scored = products
    .filter((p) => {
      if (type && norm(normalizeType(p.type)) !== norm(type) && norm(p.type) !== norm(type))
        return false;
      if (minPrice != null && (p.price ?? 0) < minPrice) return false;
      if (maxPrice != null && (p.price ?? Infinity) > maxPrice) return false;
      if (minContacts != null && (p.contacts ?? 0) < minContacts) return false;
      if (tags && tags.length) {
        const ptags = p.tags.map(norm);
        const ok = tags.some((t) => ptags.includes(norm(t)));
        if (!ok) return false;
      }
      return true;
    })
    .map((p) => {
      let score = 0;
      const title = norm(p.title);
      const desc = norm(p.description);
      const ptype = norm(p.type);
      const ptags = p.tags.map(norm);
      for (const term of terms) {
        if (title.includes(term)) score += 6;
        if (ptype.includes(term)) score += 5;
        if (ptags.some((tg) => tg.includes(term))) score += 4;
        if (desc.includes(term)) score += 2;
      }
      // Pequeño empuje a bases con más contactos (mejor valor percibido).
      if (p.contacts) score += Math.min(p.contacts / 100000, 2);
      // Empuje a productos con descuento activo.
      if (p.compareAtPrice && p.price && p.compareAtPrice > p.price) score += 0.5;
      return { p, score };
    });

  // Si no hay términos de búsqueda, ordena por relevancia comercial.
  if (terms.length === 0) {
    return scored
      .sort((a, b) => b.score - a.score || (b.p.contacts ?? 0) - (a.p.contacts ?? 0))
      .slice(0, limit)
      .map((s) => s.p);
  }

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.p);
}

/** Busca un producto por id. */
export function findProductById(products: Product[], id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
