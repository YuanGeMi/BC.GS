import type {
  Bonus,
  BonusTranslation,
  Casino,
  CasinoTranslation,
  CategoryTranslation,
  PayoutSpeedOption,
  PayoutSpeedOptionTranslation,
} from "@prisma/client";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { bonusListOrder } from "@/lib/bonuses";
import {
  CASINO_DIRECTORY_TAG,
  CATEGORY_DIRECTORY_TAG,
} from "@/lib/cache-tags";
import { getPayoutSpeedLabel } from "@/lib/casinos";
import { dedupeInflight } from "@/lib/dedupe-inflight";
import { publishedContentWhere } from "@/lib/db-enums";
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
  bonuses: Array<
    Bonus & {
      translations: BonusTranslation[];
      bonusType: { slug: string };
    }
  >,
  locale: string,
): { title: string; amount: string } | null {
  const preferred =
    bonuses.find((bonus) => bonus.bonusType.slug === "welcome") ?? bonuses[0];

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
  editorialNote?: string;
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
  bonuses: Array<
    Bonus & {
      translations: BonusTranslation[];
      bonusType: { slug: string };
    }
  >,
  locale: string,
  editorialNote?: string,
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
    editorialNote,
    lede: editorialNote || firstParagraph(translation.reviewBody),
  };
}

export const getCategoryBySlug = cache(
  async (slug: string, locale: string): Promise<CategoryView | null> => {
    const row = await unstable_cache(
      async () => {
        return prisma.category.findFirst({
          where: { slug, ...publishedContentWhere },
          include: { translations: true },
        });
      },
      ["category-by-slug", slug],
      { revalidate: false, tags: [CATEGORY_DIRECTORY_TAG] },
    )();

    if (!row) return null;

    const translation = pickTranslation(row.translations, locale);
    if (!translation) return null;

    return toCategoryView(row.slug, row.id, translation);
  },
);

export const getCasinosForCategory = cache(
  async (
    categoryId: string,
    locale: string,
  ): Promise<CategoryCasinoView[]> => {
    const rows = await unstable_cache(
      async () => {
        return prisma.casinoCategory.findMany({
          where: {
            categoryId,
            casino: publishedContentWhere,
          },
          include: {
            notes: true,
            casino: {
              include: {
                translations: true,
                bonuses: {
                  where: publishedContentWhere,
                  include: {
                    translations: true,
                    bonusType: { select: { slug: true } },
                  },
                  orderBy: bonusListOrder,
                },
                payoutSpeed: { include: { translations: true } },
              },
            },
          },
          orderBy: [
            { rank: { sort: "asc", nulls: "last" } },
            { casino: { slug: "asc" } },
          ],
        });
      },
      ["category-casino-rows", categoryId],
      {
        revalidate: false,
        tags: [CATEGORY_DIRECTORY_TAG, CASINO_DIRECTORY_TAG],
      },
    )();

    return rows.flatMap(({ casino, notes }) => {
      const translation = pickTranslation(casino.translations, locale);
      if (!translation) return [];
      const note = pickTranslation(notes, locale)?.editorialNote.trim();
      return [
        toCategoryCasino(
          casino,
          translation,
          casino.bonuses,
          locale,
          note || undefined,
        ),
      ];
    });
  },
);

export async function getRelatedCategories(
  slug: string,
  locale: string,
  count = 3,
): Promise<RelatedCategoryView[]> {
  const rows = await getCachedPublishedCategoryRows();
  return rows
    .filter((category) => category.slug !== slug)
    .slice(0, count)
    .flatMap((category) => {
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

const publishedCategoryRowsInflight: {
  current: Promise<
    {
      slug: string;
      translations: CategoryTranslation[];
    }[]
  > | null;
} = { current: null };

const getCachedPublishedCategoryRows = cache(async () => {
  return unstable_cache(
    () =>
      dedupeInflight(publishedCategoryRowsInflight, async () => {
        return prisma.category.findMany({
          where: publishedContentWhere,
          include: { translations: true },
          orderBy: { createdAt: "asc" },
        });
      }),
    ["published-category-rows"],
    { revalidate: false, tags: [CATEGORY_DIRECTORY_TAG] },
  )();
});

export async function getPublishedCategories(
  locale: string,
): Promise<RelatedCategoryView[]> {
  const rows = await getCachedPublishedCategoryRows();

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
    where: publishedContentWhere,
    select: { slug: true },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => row.slug);
}
