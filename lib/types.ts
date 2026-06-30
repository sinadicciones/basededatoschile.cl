export interface Product {
  id: string;
  title: string;
  handle: string;
  type: string;
  tags: string[];
  price: number | null;
  compareAtPrice: number | null;
  image: string | null;
  variantId: string | null;
  /** Cantidad de contactos extraída del título, si está disponible. */
  contacts: number | null;
  description: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** Productos recomendados que acompañan a una respuesta del asistente. */
  products?: Product[];
}

export interface SearchFilters {
  query?: string;
  type?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  minContacts?: number;
}
