import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  getCatalog,
  getCategories,
  getTopTags,
  searchProducts,
} from "@/lib/catalog";
import { formatCLP } from "@/lib/format";
import type { Product } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

const search_products_tool: Anthropic.Tool = {
  name: "search_products",
  description:
    "Busca bases de datos de contactos en el catálogo real de Base de Datos Chile. " +
    "Úsala SIEMPRE antes de recomendar productos: nunca inventes bases que no existan. " +
    "Puedes filtrar por categoría, palabras clave (rubro, ciudad, cargo, etc.), rango de precio " +
    "y mínimo de contactos. Devuelve los productos más relevantes con su precio y datos.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Palabras clave de la necesidad del usuario: rubro, ciudad/región, cargo, " +
          "tamaño de empresa, segmento (ej: 'empresas construcción Santiago medianas').",
      },
      type: {
        type: "string",
        description:
          "Categoría exacta para acotar (opcional). Ej: Empresas, Personas, Profesionales, " +
          "Ejecutivos, Municipalidades, Ministerios, Directorios, E-commerce.",
      },
      minPrice: { type: "number", description: "Precio mínimo en CLP (opcional)." },
      maxPrice: { type: "number", description: "Precio máximo en CLP (opcional)." },
      minContacts: {
        type: "number",
        description: "Cantidad mínima de contactos que debe incluir la base (opcional).",
      },
    },
    required: ["query"],
  },
};

function compactProduct(p: Product) {
  return {
    id: p.id,
    titulo: p.title,
    categoria: p.type,
    contactos: p.contacts,
    precio: p.price != null ? formatCLP(p.price) : "Consultar",
    tags: p.tags.slice(0, 10),
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "El asistente de IA no está configurado. Falta la variable ANTHROPIC_API_KEY.",
      },
      { status: 503 },
    );
  }

  let body: { messages?: { role: "user" | "assistant"; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const history = (body.messages || [])
    .filter((m) => m.content?.trim())
    .slice(-12);
  if (history.length === 0) {
    return NextResponse.json({ error: "Sin mensajes." }, { status: 400 });
  }

  const catalog = await getCatalog();
  const categories = getCategories(catalog);
  const topTags = getTopTags(catalog, 30);

  const systemPrompt = `Eres "Dato", el asesor experto de Base de Datos Chile (basededatoschile.cl), un e-commerce chileno que vende bases de datos de contactos B2B y B2C verificadas (empresas, personas, profesionales, ejecutivos, municipios, etc.).

Tu misión: entender a quién quiere llegar el cliente y recomendarle la base de contactos MÁS IDÓNEA del catálogo, para que compre con confianza.

Catálogo disponible (${catalog.length} bases activas). Categorías:
${categories.map((c) => `- ${c.type}: ${c.count} bases, desde ${formatCLP(c.fromPrice)}`).join("\n")}

Segmentos/tags frecuentes: ${topTags.join(", ")}.

REGLAS:
1. Usa SIEMPRE la herramienta search_products antes de recomendar. Jamás inventes bases, precios ni cantidades. Solo recomienda productos devueltos por la herramienta (cítalos por su id exacto).
2. Si la consulta es vaga, haz 1 sola pregunta breve para acotar (rubro, ciudad/región, cargo objetivo, o tamaño de empresa). No interrogues de más.
3. Recomienda entre 1 y 3 bases. Para cada una explica en 1 frase POR QUÉ encaja con su necesidad (rubro, cobertura, cantidad de contactos). Menciona el precio.
4. Sé concreto, cálido y consultivo. Español de Chile, tono profesional cercano, sin tecnicismos. Respuestas breves (máx ~120 palabras) y escaneables.
5. Cierra siempre orientando a la acción ("haz clic en la base para verla y comprarla").
6. Si no hay coincidencia exacta, ofrece la base más cercana y dilo con honestidad.
7. Recuerda el valor: datos actualizados, descarga inmediata en Excel, uso para campañas de marketing, ventas y prospección.

Hoy es ${new Date().toLocaleDateString("es-CL")}.`;

  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const client = new Anthropic({ apiKey });
  const recommended = new Map<string, Product>();

  try {
    let guard = 0;
    while (guard < 4) {
      guard += 1;
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        tools: [search_products_tool],
        messages,
      });

      const toolUses = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );

      if (response.stop_reason === "tool_use" && toolUses.length > 0) {
        messages.push({ role: "assistant", content: response.content });
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const tu of toolUses) {
          const input = tu.input as {
            query?: string;
            type?: string;
            minPrice?: number;
            maxPrice?: number;
            minContacts?: number;
          };
          const results = searchProducts(
            catalog,
            {
              query: input.query,
              type: input.type,
              minPrice: input.minPrice,
              maxPrice: input.maxPrice,
              minContacts: input.minContacts,
            },
            8,
          );
          for (const p of results) recommended.set(p.id, p);
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: JSON.stringify(
              results.length
                ? results.map(compactProduct)
                : { mensaje: "Sin coincidencias. Sugiere ampliar el criterio." },
            ),
          });
        }
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      // Respuesta final
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();

      // Adjunta solo los productos efectivamente mencionados por id, si los hay;
      // si no menciona ids, devuelve los más relevantes de la última búsqueda.
      const all = Array.from(recommended.values());
      const mentioned = all.filter((p) => text.includes(p.id));
      const products = (mentioned.length ? mentioned : all).slice(0, 4);

      return NextResponse.json({
        reply:
          text ||
          "¿Me cuentas a quién quieres llegar (rubro, ciudad o cargo)? Así te recomiendo la base ideal.",
        products,
      });
    }

    return NextResponse.json({
      reply:
        "Estoy teniendo problemas para acotar la búsqueda. ¿Puedes darme un dato más (rubro, ciudad o cargo)?",
      products: Array.from(recommended.values()).slice(0, 4),
    });
  } catch (err: any) {
    console.error("[chat] error", err?.message || err);
    return NextResponse.json(
      {
        error:
          "El asistente no está disponible en este momento. Intenta de nuevo en unos segundos.",
      },
      { status: 502 },
    );
  }
}
