import type {
  Bonus,
  BonusTranslation,
  BonusType,
  BonusTypeTranslation,
} from "@prisma/client";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import type { MockBonus } from "@/data/mock-bonuses";
import { BONUS_DIRECTORY_TAG } from "@/lib/cache-tags";
import { dedupeInflight } from "@/lib/dedupe-inflight";
import { publishedContentWhere } from "@/lib/db-enums";
import { prisma } from "@/lib/prisma";

type BonusListCasino = {
  slug: string;
  logoUrl: string | null;
  translations: { locale: string; name: string }[];
};

type BonusWithRelations = Bonus & {
  translations: BonusTranslation[];
  bonusType: BonusType & { translations: BonusTypeTranslation[] };
  casino: BonusListCasino;
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

function bonusTypeName(
  bonusType: BonusType & { translations: BonusTypeTranslation[] },
  locale: string,
): string {
  return (
    pickTranslation(bonusType.translations, locale)?.name ?? bonusType.slug
  );
}

function toDirectoryBonus(
  bonus: BonusWithRelations,
  translation: BonusTranslation,
  casinoTranslation: { name: string },
  locale: string,
): MockBonus {
  return {
    id: bonus.id,
    slug: bonus.slug,
    casinoSlug: bonus.casino.slug,
    casinoName: { en: casinoTranslation.name },
    logoUrl: bonus.casino.logoUrl ?? undefined,
    title: { en: translation.title },
    bonusValue: { en: bonus.amount ?? "—" },
    type: bonus.bonusType.slug,
    typeName: bonusTypeName(bonus.bonusType, locale),
    valueAmount: parseValueAmount(bonus.amount),
    listedAt: bonus.createdAt.toISOString(),
    expiresAt: bonus.expiryDate ? bonus.expiryDate.toISOString() : "9999-12-31",
    wagering: { en: bonus.wageringRequirement ?? "—" },
  };
}

export function parseValueAmount(amount: string | null): number {
  if (!amount) return 0;

  const dollars = [...amount.matchAll(/\$([\d,]+(?:\.\d+)?)/g)].map((match) =>
    Number(match[1].replace(/,/g, "")),
  );
  if (dollars.some((value) => Number.isFinite(value))) {
    return Math.max(...dollars.filter((value) => Number.isFinite(value)));
  }

  const numbers = [...amount.matchAll(/(\d+(?:\.\d+)?)/g)].map((match) =>
    Number(match[1]),
  );
  const valid = numbers.filter((value) => Number.isFinite(value));
  return valid.length > 0 ? Math.max(...valid) : 0;
}

const bonusTypeInclude = {
  bonusType: { include: { translations: true } },
} as const;

export const bonusListOrder = [
  { sortOrder: "asc" as const },
  { createdAt: "desc" as const },
];

const bonusDirectoryInflight: {
  current: Promise<BonusWithRelations[]> | null;
} = { current: null };

async function loadBonusDirectoryRows(): Promise<BonusWithRelations[]> {
  return dedupeInflight(bonusDirectoryInflight, async () => {
    return prisma.bonus.findMany({
      where: {
        ...publishedContentWhere,
        casino: publishedContentWhere,
      },
      include: {
        translations: true,
        casino: { include: { translations: true } },
        ...bonusTypeInclude,
      },
      orderBy: bonusListOrder,
    });
  });
}

const getCachedBonusDirectoryRows = cache(async () => {
  return unstable_cache(loadBonusDirectoryRows, ["bonus-directory-rows"], {
    revalidate: false,
    tags: [BONUS_DIRECTORY_TAG],
  })();
});

function mapDirectoryBonuses(
  rows: BonusWithRelations[],
  locale: string,
): MockBonus[] {
  return rows.flatMap((bonus) => {
    const translation = pickTranslation(bonus.translations, locale);
    const casinoTranslation = pickTranslation(
      bonus.casino.translations,
      locale,
    );

    if (!translation || !casinoTranslation) return [];

    return [toDirectoryBonus(bonus, translation, casinoTranslation, locale)];
  });
}

export async function getBonuses(locale: string): Promise<MockBonus[]> {
  const rows = await getCachedBonusDirectoryRows();
  return mapDirectoryBonuses(rows, locale);
}

/**
 * Homepage featured bonuses. Ranking uses parsed dollar amounts (not a DB
 * column), so we sort the cached directory in memory, then take.
 */
export async function getFeaturedBonuses(
  locale: string,
  limit = 6,
): Promise<MockBonus[]> {
  const rows = await getCachedBonusDirectoryRows();
  return mapDirectoryBonuses(rows, locale)
    .sort((a, b) => b.valueAmount - a.valueAmount)
    .slice(0, limit);
}

export type CasinoBonusTermsView = {
  id: string;
  title: string;
  amount: string;
  wageringRequirement: string | null;
  minDeposit: string | null;
  code: string | null;
  expiryDate: string | null;
};

function formatMinDeposit(value: number | null): string | null {
  if (value == null) return null;
  return `$${value}`;
}

function formatExpiryDate(value: Date | null, locale: string): string | null {
  if (!value) return null;
  const tag = locale === "zh" ? "zh-CN" : locale === "th" ? "th-TH" : "en-GB";
  return value.toLocaleDateString(tag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function getBonusesForCasino(
  casinoSlug: string,
  locale: string,
): Promise<CasinoBonusTermsView[]> {
  const rows = await prisma.bonus.findMany({
    where: {
      ...publishedContentWhere,
      casino: { slug: casinoSlug, ...publishedContentWhere },
    },
    include: { translations: true },
    orderBy: bonusListOrder,
  });

  return rows.flatMap((bonus) => {
    const translation = pickTranslation(bonus.translations, locale);
    if (!translation) return [];

    return [
      {
        id: bonus.id,
        title: translation.title,
        amount: bonus.amount ?? "—",
        wageringRequirement: bonus.wageringRequirement,
        minDeposit: formatMinDeposit(bonus.minDeposit),
        code: bonus.code,
        expiryDate: formatExpiryDate(bonus.expiryDate, locale),
      },
    ];
  });
}
