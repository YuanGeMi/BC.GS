import { prisma } from "@/lib/prisma";

export type StaticPageSlug = "privacy" | "terms" | "responsible-gambling";

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

export async function getStaticPage(
  slug: StaticPageSlug,
  locale: string,
): Promise<StaticPageView | null> {
  const row = await prisma.staticPage.findUnique({
    where: { slug },
    include: { translations: true },
  });

  if (!row || row.status !== "published") return null;

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
}
