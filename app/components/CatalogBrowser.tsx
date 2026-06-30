"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { normalizeType, searchProducts } from "@/lib/catalog";
import ProductCard from "./ProductCard";

const PAGE = 12;

export default function CatalogBrowser({
  products,
  categories,
}: {
  products: Product[];
  categories: { type: string; count: number }[];
}) {
  const [active, setActive] = useState<string>("Todas");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE);

  const filtered = useMemo(() => {
    let base = products;
    if (active !== "Todas") {
      base = base.filter((p) => normalizeType(p.type) === active);
    }
    if (query.trim()) {
      return searchProducts(base, { query }, 200);
    }
    // sin búsqueda: ordena por cantidad de contactos desc
    return [...base].sort((a, b) => (b.contacts ?? 0) - (a.contacts ?? 0));
  }, [products, active, query]);

  const shown = filtered.slice(0, visible);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <CatBtn
            label="Todas"
            count={products.length}
            active={active === "Todas"}
            onClick={() => {
              setActive("Todas");
              setVisible(PAGE);
            }}
          />
          {categories.map((c) => (
            <CatBtn
              key={c.type}
              label={c.type}
              count={c.count}
              active={active === c.type}
              onClick={() => {
                setActive(c.type);
                setVisible(PAGE);
              }}
            />
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE);
          }}
          placeholder="Buscar por rubro, ciudad, cargo…"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-72"
        />
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {filtered.length} bases encontradas
      </p>

      {shown.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-slate-500">
          No encontramos bases con ese criterio. Prueba con el asistente de IA arriba 👆
        </p>
      )}

      {visible < filtered.length && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setVisible((v) => v + PAGE)}
          >
            Ver más bases
          </button>
        </div>
      )}
    </div>
  );
}

function CatBtn({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-brand-600 text-white shadow"
          : "border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
      }`}
    >
      {label}
      <span className={`ml-1.5 text-xs ${active ? "text-brand-100" : "text-slate-400"}`}>
        {count}
      </span>
    </button>
  );
}
