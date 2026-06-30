# Base de Datos Chile — Landing con asistente de IA

Landing page de alto rendimiento para [basededatoschile.cl](https://basededatoschile.cl)
con un **asistente conversacional de IA (Claude)** que entiende a quién quiere
llegar el cliente y le recomienda la **base de datos de contactos más idónea**
del catálogo, conectada a **Shopify** para comprar al instante.

Construida con **Next.js 14 (App Router) + TypeScript + Tailwind CSS**.

---

## ✨ Qué incluye

- **Asistente IA "Dato"** (`/api/chat`): conversa en español de Chile, busca sobre
  el catálogo **real** mediante una herramienta (`search_products`) — nunca inventa
  productos — y recomienda 1–3 bases con su precio y el porqué de cada una.
- **Conexión a Shopify**: cada producto enlaza al checkout vía *cart permalink*
  (`/cart/{variantId}:1`), por lo que la compra ocurre en tu tienda Shopify con su
  pasarela de pago habitual.
- **Catálogo navegable**: filtros por categoría + buscador, con 386 bases activas.
- **SEO**: metadatos Open Graph/Twitter, JSON-LD (`OnlineStore` + `FAQPage`),
  `sitemap.xml` y `robots.txt` dinámicos, HTML semántico.
- **CRO/UX/UI**: hero con prueba social, barra de confianza, "cómo funciona",
  precios con descuento, FAQ y CTAs claros; diseño responsive y accesible.

---

## 🚀 Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completa tus variables
npm run dev                  # http://localhost:3000
```

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Sí** (para el chat) | API key de Anthropic ([console.anthropic.com](https://console.anthropic.com)). |
| `ANTHROPIC_MODEL` | No | Modelo a usar. Por defecto `claude-sonnet-5`. |
| `NEXT_PUBLIC_SHOPIFY_DOMAIN` | No | Dominio público de la tienda (checkout). Por defecto `basededatoschile.cl`. |
| `SHOPIFY_STORE_DOMAIN` | No | Dominio `.myshopify.com` para la Storefront API. |
| `SHOPIFY_STOREFRONT_TOKEN` | No | Token público Storefront API: refresca el catálogo en vivo. |
| `NEXT_PUBLIC_SITE_URL` | No | URL canónica para SEO/sitemap. |

> Sin `SHOPIFY_STOREFRONT_TOKEN`, la app usa el snapshot empaquetado
> `data/catalog.json` (386 productos). Con token, el catálogo se refresca en vivo
> (caché de 30 min).

---

## 🛒 Conectar con tu Shopify

Hay dos niveles de integración, ambos ya implementados:

1. **Compra (siempre activa).** Los botones "Comprar ahora" usan
   [*cart permalinks*](https://shopify.dev/docs/storefronts/themes/architecture/cart#cart-permalinks)
   de Shopify. No requiere configuración: la compra se completa en tu tienda.

2. **Catálogo en vivo (opcional).** Para que los productos, precios y stock se
   actualicen automáticamente:
   - En Shopify Admin → *Settings → Apps and sales channels → Develop apps* →
     crea una app → habilita **Storefront API** con permisos de lectura de
     productos → copia el **Storefront access token**.
   - Define `SHOPIFY_STORE_DOMAIN` y `SHOPIFY_STOREFRONT_TOKEN`.

### Actualizar el snapshot manualmente

```bash
SHOPIFY_STORE_DOMAIN=basededatoschile-cl.myshopify.com \
SHOPIFY_STOREFRONT_TOKEN=xxxx \
npm run sync:catalog
```

Regenera `data/catalog.json` desde Shopify.

---

## ☁️ Despliegue (recomendado: Vercel)

1. Sube este repo a GitHub (ya hecho en la rama de trabajo).
2. Importa el proyecto en [Vercel](https://vercel.com) → framework **Next.js**.
3. Agrega las variables de entorno (al menos `ANTHROPIC_API_KEY`).
4. Deploy. Apunta tu dominio o subdominio (ej. `nueva.basededatoschile.cl`) a Vercel.

> También funciona en Netlify, Render o cualquier host con soporte Node 18+.

---

## 🧠 Cómo funciona el asistente

```
Usuario → /api/chat → Claude (con tool search_products)
                          │
                          ├─ Claude decide filtros (rubro, ciudad, categoría, precio)
                          ├─ search_products() rankea el catálogo local/vivo
                          └─ Claude recomienda 1–3 bases citándolas por id
        ← respuesta + tarjetas de producto (con link de compra)
```

El *grounding* por herramienta garantiza que la IA solo recomiende productos que
existen en tu catálogo, con precios y cantidades reales.

---

## 📁 Estructura

```
app/
  api/chat/route.ts      # Asistente IA (Claude + tool de búsqueda)
  components/            # Chat, tarjetas, navegador de catálogo, iconos
  page.tsx               # Landing (hero, categorías, catálogo, FAQ)
  layout.tsx             # SEO + metadatos + JSON-LD
  sitemap.ts / robots.ts # SEO técnico
lib/
  catalog.ts             # Carga + motor de búsqueda/ranking
  shopify.ts             # Storefront API + cart permalinks
  format.ts              # Formato CLP / contactos / descuentos
data/catalog.json        # Snapshot del catálogo (386 bases activas)
scripts/sync-catalog.mjs # Regenera el snapshot desde Shopify
```
