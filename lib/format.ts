/** Formatea un precio en pesos chilenos (CLP). */
export function formatCLP(value: number | null | undefined): string {
  if (value == null) return "Consultar";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formatea una cantidad de contactos con separador de miles. */
export function formatContacts(value: number | null | undefined): string | null {
  if (value == null) return null;
  return new Intl.NumberFormat("es-CL").format(value);
}

/** Porcentaje de descuento respecto al precio comparativo. */
export function discountPercent(
  price: number | null,
  compareAtPrice: number | null,
): number | null {
  if (!price || !compareAtPrice || compareAtPrice <= price) return null;
  return Math.round((1 - price / compareAtPrice) * 100);
}
