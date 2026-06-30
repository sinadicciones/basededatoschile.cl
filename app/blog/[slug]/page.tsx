import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import Markdown from "../../components/Markdown";
import { DatabaseIcon, SparkIcon } from "../../components/Icons";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://basededatoschile.cl";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();
  const related = getRelatedPosts(post.slug, 3);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.h1,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: "es-CL",
    author: { "@type": "Organization", name: "Base de Datos Chile" },
    publisher: {
      "@type": "Organization",
      name: "Base de Datos Chile",
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: post.h1,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
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
            <Link href="/blog" className="hover:text-brand-700">Blog</Link>
          </nav>
          <Link href="/#asistente" className="btn-primary !py-2.5 !px-4 text-xs sm:text-sm">
            Encontrar mi base
          </Link>
        </div>
      </header>

      <article className="container-page max-w-3xl py-12">
        <nav aria-label="breadcrumb" className="text-sm text-slate-500">
          <Link href="/" className="hover:text-brand-700">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-brand-700">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{post.category || "Guía"}</span>
        </nav>

        <span className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {post.category || "Guía"}
        </span>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
          {post.h1}
        </h1>

        <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
          <time dateTime={post.datePublished}>
            Actualizado el{" "}
            {new Date(post.dateModified).toLocaleDateString("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{post.readingMinutes} min de lectura</span>
        </div>

        <div className="mt-8">
          <Markdown>{post.body}</Markdown>
        </div>

        {/* FAQ */}
        {post.faqs.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold text-ink">Preguntas frecuentes</h2>
            <div className="mt-6 space-y-3">
              {post.faqs.map((f) => (
                <details key={f.q} className="card group p-5 [&_summary]:cursor-pointer">
                  <summary className="flex items-center justify-between font-semibold text-ink">
                    {f.q}
                    <span className="ml-4 text-brand-500 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-14 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 px-8 py-10 text-center text-white shadow-glow">
          <h2 className="text-2xl font-bold">Encuentra tu base ideal con IA</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            Describe a quién quieres llegar y la inteligencia artificial te recomienda la base
            de contactos perfecta, con su precio y descarga inmediata.
          </p>
          <Link
            href="/#asistente"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <SparkIcon className="h-5 w-5" /> Hablar con el asistente IA
          </Link>
        </div>
      </article>

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50/60 py-14">
          <div className="container-page">
            <h2 className="text-2xl font-bold text-ink">Sigue leyendo</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <article key={p.slug} className="card flex flex-col p-6">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {p.category || "Guía"}
                  </span>
                  <h3 className="mt-4 text-base font-bold leading-snug text-ink">
                    <Link href={`/blog/${p.slug}`} className="hover:text-brand-700">
                      {p.h1}
                    </Link>
                  </h3>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Leer guía →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </main>
  );
}
