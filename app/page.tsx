import {
  getCatalog,
  getCategories,
  normalizeType,
} from "@/lib/catalog";
import { formatCLP } from "@/lib/format";
import AssistantChat from "./components/AssistantChat";
import CatalogBrowser from "./components/CatalogBrowser";
import {
  SparkIcon,
  BoltIcon,
  ShieldIcon,
  CheckIcon,
  DatabaseIcon,
} from "./components/Icons";

export const revalidate = 1800; // 30 min

const FAQS = [
  {
    q: "¿Qué incluye cada base de datos de contactos?",
    a: "Cada base se entrega en un archivo Excel descargable con campos como razón social o nombre, RUT, rubro, comuna/región, teléfono y correo según disponibilidad. La cantidad de contactos se indica en el título de cada base.",
  },
  {
    q: "¿Cómo me ayuda el asistente con IA a elegir?",
    a: "Le cuentas a quién quieres llegar (rubro, ciudad, cargo o tipo de empresa) y la IA analiza todo el catálogo para recomendarte la base más idónea, con su precio y la razón por la que encaja con tu objetivo.",
  },
  {
    q: "¿Cómo compro y cuándo recibo los datos?",
    a: "El pago se realiza de forma segura dentro de la tienda (Shopify). Tras la compra recibes la descarga de inmediato, sin esperas.",
  },
  {
    q: "¿Los datos están actualizados y son legales de usar?",
    a: "Trabajamos con bases actualizadas para campañas de marketing, ventas y prospección comercial. Recomendamos usarlas conforme a la Ley N° 19.628 de protección de datos de Chile.",
  },
  {
    q: "¿Puedo pedir una base a medida si no encuentro la que necesito?",
    a: "Sí. Si el asistente no encuentra una coincidencia exacta, te muestra la base más cercana y puedes escribirnos para una base personalizada según tu segmento.",
  },
];

export default async function HomePage() {
  const catalog = await getCatalog();
  const categories = getCategories(catalog);
  const totalContacts = catalog.reduce((sum, p) => sum + (p.contacts || 0), 0);
  const minPrice = catalog.reduce(
    (min, p) => (p.price != null ? Math.min(min, p.price) : min),
    Infinity,
  );

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const fmtBig = new Intl.NumberFormat("es-CL");

  return (
    <main className="bg-white">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <a href="#top" className="flex items-center gap-2 font-bold text-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <DatabaseIcon className="h-5 w-5" />
            </span>
            Base de Datos Chile
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#asistente" className="hover:text-brand-700">Asistente IA</a>
            <a href="#categorias" className="hover:text-brand-700">Categorías</a>
            <a href="#catalogo" className="hover:text-brand-700">Catálogo</a>
            <a href="/blog" className="hover:text-brand-700">Blog</a>
            <a href="#faq" className="hover:text-brand-700">Preguntas</a>
          </nav>
          <a href="#asistente" className="btn-primary !py-2.5 !px-4 text-xs sm:text-sm">
            Encontrar mi base
          </a>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50 to-white" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="container-page relative grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:py-16">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
              <SparkIcon className="h-4 w-4" /> Nuevo · Buscador con Inteligencia Artificial
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              Encuentra la{" "}
              <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
                base de contactos ideal
              </span>{" "}
              para tu próxima campaña
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Cuéntale a nuestra IA a quién quieres llegar y te recomienda, entre{" "}
              <strong>{catalog.length} bases verificadas</strong> de empresas y personas de
              Chile, la más idónea para vender, prospectar o hacer marketing.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#asistente" className="btn-primary">
                <SparkIcon className="h-5 w-5" /> Probar el asistente IA
              </a>
              <a href="#catalogo" className="btn-secondary">
                Ver catálogo completo
              </a>
            </div>

            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4">
              <Stat value={`${catalog.length}`} label="bases activas" />
              <Stat value={`${fmtBig.format(Math.round(totalContacts / 1_000_000))}M+`} label="contactos" />
              <Stat
                value={Number.isFinite(minPrice) ? `${formatCLP(minPrice)}` : "—"}
                label="desde"
              />
            </dl>
          </div>

          {/* Asistente */}
          <div id="asistente" className="animate-fade-up lg:pl-4">
            <AssistantChat />
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="container-page grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          <Feature icon={<BoltIcon className="h-5 w-5" />} title="Descarga inmediata" desc="Recibe tu Excel al instante tras la compra." />
          <Feature icon={<ShieldIcon className="h-5 w-5" />} title="Pago seguro" desc="Checkout protegido en Shopify." />
          <Feature icon={<DatabaseIcon className="h-5 w-5" />} title="Datos verificados" desc="Bases actualizadas de empresas y personas." />
          <Feature icon={<SparkIcon className="h-5 w-5" />} title="Asesoría con IA" desc="Encuentra la base correcta en segundos." />
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="container-page py-14">
        <h2 className="text-center text-3xl font-bold text-ink">Cómo funciona</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          De la necesidad a la base correcta en tres pasos simples.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Step n={1} title="Describe tu objetivo" desc="Indica rubro, ciudad/región, cargo o tipo de empresa al asistente con IA." />
          <Step n={2} title="Recibe la recomendación" desc="La IA analiza el catálogo y te sugiere las bases más idóneas con su precio." />
          <Step n={3} title="Compra y descarga" desc="Pagas seguro en Shopify y descargas tu base en Excel al instante." />
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section id="categorias" className="bg-slate-50/60 py-14">
        <div className="container-page">
          <h2 className="text-3xl font-bold text-ink">Explora por categoría</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Bases organizadas por tipo de contacto para que llegues exactamente a quien necesitas.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <a
                key={c.type}
                href="#catalogo"
                className="card group flex flex-col gap-2 p-5 transition hover:-translate-y-0.5 hover:shadow-glow"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <DatabaseIcon className="h-5 w-5" />
                </span>
                <span className="mt-1 font-semibold text-ink">{c.type}</span>
                <span className="text-sm text-slate-500">{c.count} bases</span>
                {c.fromPrice != null && (
                  <span className="text-xs font-medium text-brand-600">
                    desde {formatCLP(c.fromPrice)}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="catalogo" className="container-page py-14">
        <h2 className="text-3xl font-bold text-ink">Catálogo de bases de datos</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Filtra por categoría o busca por rubro, ciudad o cargo. ¿Dudas? Usa el{" "}
          <a href="#asistente" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
            asistente con IA
          </a>.
        </p>
        <div className="mt-8">
          <CatalogBrowser products={catalog} categories={categories} />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50/60 py-14">
        <div className="container-page max-w-3xl">
          <h2 className="text-3xl font-bold text-ink">Preguntas frecuentes</h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="card group p-5 [&_summary]:cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-ink">
                  {f.q}
                  <span className="ml-4 text-brand-500 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container-page py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 px-8 py-12 text-center text-white shadow-glow">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-3xl font-bold sm:text-4xl">
            ¿Listo para encontrar tu base ideal?
          </h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-brand-50">
            Deja que la IA haga el trabajo. En segundos sabrás exactamente qué base de
            contactos necesitas para tu próxima campaña.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#asistente"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              <SparkIcon className="h-5 w-5" /> Hablar con el asistente
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="container-page grid gap-8 py-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-bold text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <DatabaseIcon className="h-5 w-5" />
              </span>
              Base de Datos Chile
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Bases de datos de contactos de empresas y personas de Chile, con asesoría de
              inteligencia artificial para que elijas la base correcta.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Navegación</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><a href="#asistente" className="hover:text-brand-700">Asistente IA</a></li>
              <li><a href="#categorias" className="hover:text-brand-700">Categorías</a></li>
              <li><a href="#catalogo" className="hover:text-brand-700">Catálogo</a></li>
              <li><a href="#faq" className="hover:text-brand-700">Preguntas frecuentes</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Garantías</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-accent-500" /> Descarga inmediata</li>
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-accent-500" /> Pago seguro en Shopify</li>
              <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-accent-500" /> Datos verificados</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Base de Datos Chile · basededatoschile.cl · Uso conforme a la Ley N° 19.628.
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white/70 p-3 text-center shadow-sm">
      <dt className="text-xl font-extrabold text-ink">{value}</dt>
      <dd className="text-xs text-slate-500">{label}</dd>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="card p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
        {n}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-slate-600">{desc}</p>
    </div>
  );
}
