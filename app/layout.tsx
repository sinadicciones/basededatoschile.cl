import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://basededatoschile.cl";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Base de Datos Chile · Bases de contactos de empresas y personas con IA",
    template: "%s · Base de Datos Chile",
  },
  description:
    "Encuentra con IA la base de datos de contactos ideal para tu campaña: empresas, personas, profesionales y ejecutivos de Chile. Datos verificados, descarga inmediata en Excel y compra segura.",
  keywords: [
    "base de datos Chile",
    "bases de datos de empresas",
    "contactos de empresas Chile",
    "base de datos de personas",
    "email marketing Chile",
    "prospección B2B",
    "directorio de empresas Chile",
    "comprar base de datos",
  ],
  authors: [{ name: "Base de Datos Chile" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: SITE_URL,
    siteName: "Base de Datos Chile",
    title: "Encuentra con IA la base de contactos ideal para tu negocio",
    description:
      "Asistente con inteligencia artificial que te recomienda la base de datos de contactos más idónea entre cientos de bases verificadas de Chile.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base de Datos Chile · Bases de contactos con IA",
    description:
      "Recomendación con IA de la base de datos de contactos ideal para tu campaña. Datos verificados y descarga inmediata.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "Base de Datos Chile",
    url: SITE_URL,
    description:
      "Venta de bases de datos de contactos de empresas y personas de Chile con asistente de IA.",
    areaServed: "CL",
    knowsLanguage: "es-CL",
  };
  return (
    <html lang="es-CL" className={inter.variable}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
      </body>
    </html>
  );
}
