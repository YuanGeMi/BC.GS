import { cache } from "react";

import { publishedContentWhere } from "@/lib/db-enums";
import { prisma } from "@/lib/prisma";

export const LEGAL_PAGE_SLUGS = [
  "privacy",
  "terms",
  "responsible-gambling",
] as const;

export type StaticPageSlug = (typeof LEGAL_PAGE_SLUGS)[number];

export function isLegalPageSlug(value: string): value is StaticPageSlug {
  return (LEGAL_PAGE_SLUGS as readonly string[]).includes(value);
}

export const LEGAL_PAGE_LABELS: Record<StaticPageSlug, string> = {
  privacy: "Privacy",
  terms: "Terms",
  "responsible-gambling": "Responsible gambling",
};

/** Footer legal links — filtered by published slugs at render time. */
export const FOOTER_LEGAL_LINKS: ReadonlyArray<{
  slug: StaticPageSlug;
  href: `/${StaticPageSlug}`;
  labelKey: "privacy" | "terms" | "responsibleGambling";
}> = [
  { slug: "privacy", href: "/privacy", labelKey: "privacy" },
  { slug: "terms", href: "/terms", labelKey: "terms" },
  {
    slug: "responsible-gambling",
    href: "/responsible-gambling",
    labelKey: "responsibleGambling",
  },
];

/** Published legal slugs only, in canonical footer order. */
export const getPublishedLegalPageSlugs = cache(async (): Promise<
  StaticPageSlug[]
> => {
  const rows = await prisma.staticPage.findMany({
    where: {
      slug: { in: [...LEGAL_PAGE_SLUGS] },
      ...publishedContentWhere,
    },
    select: { slug: true },
  });

  const published = new Set(rows.map((row) => row.slug));
  return LEGAL_PAGE_SLUGS.filter((slug) => published.has(slug));
});

export type StaticPageView = {
  slug: StaticPageSlug;
  title: string;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
};

function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
): T | undefined {
  return (
    translations.find((item) => item.locale === locale) ??
    translations.find((item) => item.locale === "en")
  );
}

export const getStaticPage = cache(
  async (
    slug: StaticPageSlug,
    locale: string,
  ): Promise<StaticPageView | null> => {
    const row = await prisma.staticPage.findFirst({
      where: { slug, ...publishedContentWhere },
      include: { translations: true },
    });

    if (!row) return null;

    const translation = pickTranslation(row.translations, locale);
    if (!translation) return null;

    return {
      slug: row.slug as StaticPageSlug,
      title: translation.title,
      content: translation.content,
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
      updatedAt: row.updatedAt,
    };
  },
);
