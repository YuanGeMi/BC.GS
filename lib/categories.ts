import type {
  Bonus,
  BonusTranslation,
  Casino,
  CasinoTranslation,
  CategoryTranslation,
  PayoutSpeedOption,
  PayoutSpeedOptionTranslation,
} from "@prisma/client";

import { getPayoutSpeedLabel } from "@/lib/casinos";
import { prisma } from "@/lib/prisma";

function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
): T | undefined {
  return (
    translations.find((item) => item.locale === locale) ??
    translations.find((item) => item.locale === "en")
  );
}

function firstParagraph(body: string): string | undefined {
  const paragraph = body
    .split(/\n\n+/)
    .map((part) => part.trim())
    .find(Boolean);

  return paragraph;
}

function pickBonus(
  bonuses: Array<Bonus & { translations: BonusTranslation[] }>,
  locale: string,
): { title: string; amount: string } | null {
  const preferred =
    bonuses.find((bonus) => bonus.type === "welcome") ?? bonuses[0];

  if (!preferred) return null;

  const translation = pickTranslation(preferred.translations, locale);
  const amount = preferred.amount?.trim();
  if (!amount) return null;

  return {
    title: translation?.title ?? amount,
    amount,
  };
}

export type CategoryView = {
  id: string;
  slug: string;
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  methodology: string | null;
};

export type RelatedCategoryView = {
  slug: string;
  name: string;
  description: string;
};

export type CategoryCasinoView = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  rating: number;
  badges: string[];
  highlight: { label: string; value: string };
  welcomeBonus: string;
  lede?: string;
};

function toCategoryView(
  slug: string,
  id: string,
  translation: CategoryTranslation,
): CategoryView {
  return {
    id,
    slug,
    name: translation.name,
    description: translation.description ?? "",
    seoTitle: translation.seoTitle ?? translation.name,
    seoDescription: translation.seoDescription ?? translation.description ?? "",
    methodology: translation.methodology?.trim() || null,
  };
}

function toCategoryCasino(
  casino: Casino & {
    payoutSpeed:
      | (PayoutSpeedOption & {
          translations: PayoutSpeedOptionTranslation[];
        })
      | null;
  },
  translation: CasinoTranslation,
  bonuses: Array<Bonus & { translations: BonusTranslation[] }>,
  locale: string,
): CategoryCasinoView {
  const bonus = pickBonus(bonuses, locale);
  const payout = getPayoutSpeedLabel(casino.payoutSpeed, locale);

  return {
    id: casino.id,
    slug: casino.slug,
    name: translation.name,
    logoUrl: casino.logoUrl ?? undefined,
    rating: casino.overallRating ?? 0,
    badges: [],
    highlight: bonus
      ? { label: bonus.title, value: bonus.amount }
      : {
          label: "",
          value: payout,
        },
    welcomeBonus: bonus?.amount ?? "—",
    lede: firstParagraph(translation.reviewBody),
  };
}

export async function getCategoryBySlug(
  slug: string,
  locale: string,
): Promise<CategoryView | null> {
  const row = await prisma.category.findUnique({
    where: { slug },
    include: { translations: true },
  });

  if (!row || row.status !== "published") return null;

  const translation = pickTranslation(row.translations, locale);
  if (!translation) return null;

  return toCategoryView(row.slug, row.id, translation);
}

export async function getCasinosForCategory(
  categoryId: string,
  locale: string,
): Promise<CategoryCasinoView[]> {
  const rows = await prisma.casino.findMany({
    where: {
      status: "published",
      categories: { some: { categoryId } },
    },
    include: {
      translations: true,
      bonuses: {
        where: { status: "published" },
        include: { translations: true },
        orderBy: { createdAt: "desc" },
      },
      payoutSpeed: { include: { translations: true } },
    },
    orderBy: [{ overallRating: "desc" }, { slug: "asc" }],
  });

  return rows.flatMap((casino) => {
    const translation = pickTranslation(casino.translations, locale);
    if (!translation) return [];
    return [toCategoryCasino(casino, translation, casino.bonuses, locale)];
  });
}

export async function getRelatedCategories(
  slug: string,
  locale: string,
  count = 3,
): Promise<RelatedCategoryView[]> {
  const rows = await prisma.category.findMany({
    where: { status: "published", slug: { not: slug } },
    include: { translations: true },
    orderBy: { createdAt: "asc" },
    take: count,
  });

  return rows.flatMap((category) => {
    const translation = pickTranslation(category.translations, locale);
    if (!translation) return [];

    return [
      {
        slug: category.slug,
        name: translation.name,
        description: translation.description ?? "",
      },
    ];
  });
}

export async function getPublishedCategories(
  locale: string,
): Promise<RelatedCategoryView[]> {
  const rows = await prisma.category.findMany({
    where: { status: "published" },
    include: { translations: true },
    orderBy: { createdAt: "asc" },
  });

  return rows.flatMap((category) => {
    const translation = pickTranslation(category.translations, locale);
    if (!translation) return [];

    return [
      {
        slug: category.slug,
        name: translation.name,
        description: translation.description ?? "",
      },
    ];
  });
}

export async function getPublishedCategorySlugs(): Promise<string[]> {
  const rows = await prisma.category.findMany({
    where: { status: "published" },
    select: { slug: true },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => row.slug);
}
