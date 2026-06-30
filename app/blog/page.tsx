import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { DatabaseIcon, SparkIcon } from "../components/Icons";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://basededatoschile.cl";

export const metadata: Metadata = {
  title: "Blog · Guías de bases de datos y marketing en Chile",
  description:
    "Guías prácticas sobre bases de datos de empresas y personas en Chile: rutificador, email marketing, segmentación B2B, precios y cómo comprar. Aprende a vender más.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Blog de Base de Datos Chile",
    description:
      "Guías de bases de datos, prospección B2B y marketing en Chile.",
    url: `${SITE_URL}/blog`,
  },
};

export const revalidate = 3600;

export default function BlogIndex() {
  const posts = getAllPosts();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${p.slug}`,
      name: p.h1,
    })),
  };

  return (
    <main className="bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <DatabaseIcon className="h-5 w-5" />
            </span>
            Base de Datos Chile
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="/#asistente" className="hover:text-brand-700">Asistente IA</Link>
            <Link href="/#catalogo" className="hover:text-brand-700">Catálogo</Link>
            <Link href="/blog" className="text-brand-700">Blog</Link>
          </nav>
          <Link href="/#asistente" className="btn-primary !py-2.5 !px-4 text-xs sm:text-sm">
            Encontrar mi base
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50 to-white" />
        <div className="container-page relative py-14">
          <nav aria-label="breadcrumb" className="text-sm text-slate-500">
            <Link href="/" className="hover:text-brand-700">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">Blog</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Guías de bases de datos y marketing en Chile
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Aprende a encontrar, comprar y aprovechar bases de datos de empresas y personas
            para vender más. Estrategias de prospección B2B, email marketing y segmentación.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article key={p.slug} className="card flex flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-glow">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {p.category || "Guía"}
              </span>
              <h2 className="mt-4 text-lg font-bold leading-snug text-ink">
                <Link href={`/blog/${p.slug}`} className="hover:text-brand-700">
                  {p.h1}
                </Link>
              </h2>
              <p className="mt-3 flex-1 text-sm text-slate-600">{p.excerpt}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
                <span>{p.readingMinutes} min de lectura</span>
                <Link
                  href={`/blog/${p.slug}`}
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  Leer guía →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 px-8 py-12 text-center text-white shadow-glow">
          <h2 className="text-2xl font-bold sm:text-3xl">¿Buscas una base específica?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Deja que la IA te recomiende la base de contactos ideal para tu campaña en segundos.
          </p>
          <Link
            href="/#asistente"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <SparkIcon className="h-5 w-5" /> Hablar con el asistente IA
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
    </main>
  );
}
