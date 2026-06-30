import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatCLP, formatContacts, discountPercent } from "@/lib/format";
import { addToCartUrl, productUrl } from "@/lib/shopify";
import { CartIcon } from "./Icons";

export default function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const off = discountPercent(product.price, product.compareAtPrice);
  const contacts = formatContacts(product.contacts);

  return (
    <article
      className={`card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-glow ${
        compact ? "" : "h-full"
      }`}
    >
      <a
        href={productUrl(product)}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[4/3] overflow-hidden bg-slate-50"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            Sin imagen
          </div>
        )}
        {off != null && (
          <span className="absolute left-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-bold text-white shadow">
            -{off}%
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-700 backdrop-blur">
          {product.type}
        </span>
      </a>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
          <a href={productUrl(product)} target="_blank" rel="noopener noreferrer">
            {product.title}
          </a>
        </h3>

        {contacts && (
          <p className="mt-1.5 text-xs font-medium text-slate-500">
            {contacts} contactos
          </p>
        )}

        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-bold text-ink">
            {formatCLP(product.price)}
          </span>
          {product.compareAtPrice && off != null && (
            <span className="text-sm text-slate-400 line-through">
              {formatCLP(product.compareAtPrice)}
            </span>
          )}
        </div>

        <a
          href={addToCartUrl(product)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4 w-full"
        >
          <CartIcon className="h-4 w-4" />
          Comprar ahora
        </a>
      </div>
    </article>
  );
}
