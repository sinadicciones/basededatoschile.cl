"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import { SparkIcon, SendIcon } from "./Icons";

const SUGGESTIONS = [
  "Empresas de construcción medianas en Santiago",
  "Dueños de e-commerce en Chile",
  "Profesionales del área de salud",
  "Pymes de la Región de Valparaíso",
  "Gerentes y ejecutivos de grandes empresas",
];

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "¡Hola! 👋 Soy Dato, tu asesor de Base de Datos Chile. Cuéntame a quién quieres llegar —rubro, ciudad, cargo o tipo de empresa— y te recomiendo la base de contactos ideal para tu campaña.",
};

export default function AssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              data?.error ||
              "Ocurrió un problema. Intenta de nuevo en unos segundos.",
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.reply as string,
            products: (data.products as Product[]) || [],
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "No pude conectar con el asistente. Revisa tu conexión e intenta nuevamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card flex h-[640px] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-4 text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <SparkIcon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Dato · Asesor con IA</p>
          <p className="flex items-center gap-1.5 text-xs text-brand-100">
            <span className="h-2 w-2 rounded-full bg-accent-400" />
            En línea · te ayuda a elegir tu base ideal
          </p>
        </div>
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} className="scroll-thin flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4">
        {messages.map((m, i) => (
          <div key={i} className="animate-fade-up">
            <div
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-sm bg-brand-600 text-white"
                    : "rounded-bl-sm bg-white text-slate-700 shadow-sm ring-1 ring-slate-100"
                }`}
              >
                {m.content}
              </div>
            </div>

            {m.products && m.products.length > 0 && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {m.products.map((p) => (
                  <ProductCard key={p.id} product={p} compact />
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
              <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
            </div>
          </div>
        )}
      </div>

      {/* Sugerencias */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 pt-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="chip"
              disabled={loading}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-slate-100 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: empresas de logística en Antofagasta…"
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          disabled={loading}
        />
        <button
          type="submit"
          className="btn-primary !px-4"
          disabled={loading || !input.trim()}
          aria-label="Enviar"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="h-2 w-2 animate-pulse-dot rounded-full bg-brand-400"
      style={{ animationDelay: delay }}
    />
  );
}
