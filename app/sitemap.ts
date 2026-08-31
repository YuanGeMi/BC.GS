import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo";

const STATIC_PATHS = [
  "",
  "/casinos",
  "/bonuses",
  "/compare",
  "/best-of",
  "/privacy",
  "/terms",
  "/responsible-gambling",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const [casinos, categories] = await Promise.all([
    prisma.casino.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    }),
    prisma.category.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    }),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: new Date(),
      });
    }

    for (const casino of casinos) {
      entries.push({
        url: `${base}/${locale}/casinos/${casino.slug}`,
        lastModified: casino.updatedAt,
      });
    }

    for (const category of categories) {
      entries.push({
        url: `${base}/${locale}/best/${category.slug}`,
        lastModified: category.updatedAt,
      });
    }
  }

  return entries;
}
