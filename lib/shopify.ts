import type { Product } from "./types";

const PUBLIC_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || "basededatoschile.cl";

/**
 * Link directo al producto en la tienda Shopify.
 */
export function productUrl(product: Pick<Product, "handle">): string {
  return `https://${PUBLIC_DOMAIN}/products/${product.handle}`;
}

/**
 * Permalink que agrega la variante al carrito de Shopify y lleva al checkout.
 * https://shopify.dev/docs/storefronts/themes/architecture/cart#cart-permalinks
 */
export function addToCartUrl(
  product: Pick<Product, "variantId" | "handle">,
  quantity = 1,
): string {
  if (!product.variantId) return productUrl(product);
  return `https://${PUBLIC_DOMAIN}/cart/${product.variantId}:${quantity}`;
}

/**
 * Permalink para checkout directo de varios productos a la vez.
 */
export function checkoutUrl(
  items: { variantId: string | null; quantity?: number }[],
): string {
  const parts = items
    .filter((i) => i.variantId)
    .map((i) => `${i.variantId}:${i.quantity ?? 1}`);
  if (parts.length === 0) return `https://${PUBLIC_DOMAIN}`;
  return `https://${PUBLIC_DOMAIN}/cart/${parts.join(",")}`;
}

// ---------------------------------------------------------------------------
// Storefront API (opcional) — refresca el catálogo en vivo si hay token.
// ---------------------------------------------------------------------------

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

const PRODUCTS_QUERY = `
  query Products($cursor: String) {
    products(first: 250, after: $cursor, query: "status:active") {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          handle
          productType
          tags
          description
          featuredImage { url }
          variants(first: 1) {
            edges { node { id price { amount } compareAtPrice { amount } } }
          }
        }
      }
    }
  }
`;

/** ¿Está configurada la Storefront API? */
export function hasStorefront(): boolean {
  return Boolean(STORE_DOMAIN && STOREFRONT_TOKEN);
}

function numericId(gid: string): string {
  const m = gid.match(/\/(\d+)(?:\?|$)/);
  return m ? m[1] : gid;
}

function contactsFromTitle(title: string): number | null {
  const m = title.match(/\(([\d.,]+)\s*contactos?\)/i);
  if (!m) return null;
  const n = parseInt(m[1].replace(/[.,]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Trae todos los productos activos desde la Storefront API.
 * Devuelve null si no hay credenciales o si falla la petición.
 */
export async function fetchLiveCatalog(): Promise<Product[] | null> {
  if (!hasStorefront()) return null;
  try {
    const products: Product[] = [];
    let cursor: string | null = null;
    let hasNext = true;
    let guard = 0;
    while (hasNext && guard < 20) {
      guard += 1;
      const res = await fetch(
        `https://${STORE_DOMAIN}/api/2024-10/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN as string,
          },
          body: JSON.stringify({
            query: PRODUCTS_QUERY,
            variables: { cursor },
          }),
          next: { revalidate: 60 * 30 },
        },
      );
      if (!res.ok) return null;
      const json: any = await res.json();
      const conn = json?.data?.products;
      if (!conn) return null;
      for (const edge of conn.edges) {
        const n = edge.node;
        const variant = n.variants?.edges?.[0]?.node;
        const price = variant?.price?.amount
          ? Math.round(parseFloat(variant.price.amount))
          : null;
        const compareAt = variant?.compareAtPrice?.amount
          ? Math.round(parseFloat(variant.compareAtPrice.amount))
          : null;
        products.push({
          id: numericId(n.id),
          title: n.title,
          handle: n.handle,
          type: n.productType || "Otros",
          tags: Array.isArray(n.tags) ? n.tags : [],
          price,
          compareAtPrice: compareAt && compareAt > (price ?? 0) ? compareAt : null,
          image: n.featuredImage?.url || null,
          variantId: variant?.id ? numericId(variant.id) : null,
          contacts: contactsFromTitle(n.title),
          description: (n.description || "").slice(0, 600),
        });
      }
      hasNext = conn.pageInfo.hasNextPage;
      cursor = conn.pageInfo.endCursor;
    }
    return products.length ? products : null;
  } catch {
    return null;
  }
}
