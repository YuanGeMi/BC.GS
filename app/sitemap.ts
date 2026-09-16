import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { publishedContentWhere } from "@/lib/db-enums";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo";
import { getPublishedLegalPageSlugs } from "@/lib/static-pages";

const STATIC_PATHS = [
  "",
  "/casinos",
  "/bonuses",
  "/compare",
  "/best-of",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const [casinos, categories, legalSlugs] = await Promise.all([
    prisma.casino.findMany({
      where: publishedContentWhere,
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    }),
    prisma.category.findMany({
      where: publishedContentWhere,
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    }),
    getPublishedLegalPageSlugs(),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: new Date(),
      });
    }

    for (const slug of legalSlugs) {
      entries.push({
        url: `${base}/${locale}/${slug}`,
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
