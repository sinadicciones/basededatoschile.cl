#!/usr/bin/env node
/**
 * Regenera data/catalog.json desde la Storefront API de Shopify.
 *
 * Uso:
 *   SHOPIFY_STORE_DOMAIN=basededatoschile-cl.myshopify.com \
 *   SHOPIFY_STOREFRONT_TOKEN=xxxx \
 *   node scripts/sync-catalog.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

if (!DOMAIN || !TOKEN) {
  console.error(
    "Falta SHOPIFY_STORE_DOMAIN y/o SHOPIFY_STOREFRONT_TOKEN en el entorno.",
  );
  process.exit(1);
}

const QUERY = `
  query Products($cursor: String) {
    products(first: 250, after: $cursor, query: "status:active") {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id title handle productType tags description
          featuredImage { url }
          variants(first: 1) {
            edges { node { id price { amount } compareAtPrice { amount } } }
          }
        }
      }
    }
  }
`;

const numericId = (gid) => (gid.match(/\/(\d+)(?:\?|$)/)?.[1] ?? gid);
const contactsFromTitle = (t) => {
  const m = t.match(/\(([\d.,]+)\s*contactos?\)/i);
  if (!m) return null;
  const n = parseInt(m[1].replace(/[.,]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};
const stripHtml = (s) =>
  (s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 600);

async function main() {
  const products = [];
  let cursor = null;
  let hasNext = true;
  let guard = 0;
  while (hasNext && guard < 20) {
    guard += 1;
    const res = await fetch(`https://${DOMAIN}/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
      },
      body: JSON.stringify({ query: QUERY, variables: { cursor } }),
    });
    if (!res.ok) {
      console.error("Error HTTP", res.status, await res.text());
      process.exit(1);
    }
    const json = await res.json();
    const conn = json?.data?.products;
    if (!conn) {
      console.error("Respuesta inesperada:", JSON.stringify(json).slice(0, 500));
      process.exit(1);
    }
    for (const { node: n } of conn.edges) {
      const v = n.variants?.edges?.[0]?.node;
      const price = v?.price?.amount ? Math.round(parseFloat(v.price.amount)) : null;
      const compare = v?.compareAtPrice?.amount
        ? Math.round(parseFloat(v.compareAtPrice.amount))
        : null;
      products.push({
        id: numericId(n.id),
        title: n.title,
        handle: n.handle,
        type: n.productType || "Otros",
        tags: Array.isArray(n.tags) ? n.tags : [],
        price,
        compareAtPrice: compare && compare > (price ?? 0) ? compare : null,
        image: n.featuredImage?.url || null,
        variantId: v?.id ? numericId(v.id) : null,
        contacts: contactsFromTitle(n.title),
        description: stripHtml(n.description),
      });
    }
    hasNext = conn.pageInfo.hasNextPage;
    cursor = conn.pageInfo.endCursor;
  }

  products.sort((a, b) =>
    a.type === b.type
      ? (b.contacts ?? 0) - (a.contacts ?? 0)
      : a.type.localeCompare(b.type),
  );

  const out = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "catalog.json");
  writeFileSync(out, JSON.stringify(products, null, 2), "utf-8");
  console.log(`✓ ${products.length} productos guardados en data/catalog.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
