import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://basededatoschile.cl";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/#asistente`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/#catalogo`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/#faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
