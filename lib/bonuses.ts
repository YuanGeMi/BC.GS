import type {
  Bonus,
  BonusTranslation,
  Casino,
  CasinoTranslation,
} from "@prisma/client";

import type { MockBonus } from "@/data/mock-bonuses";
import type { BonusTypeId } from "@/data/mock-casinos";
import { LISTING_BONUS_TYPES } from "@/lib/bonus-directory";
import { prisma } from "@/lib/prisma";

type BonusWithRelations = Bonus & {
  translations: BonusTranslation[];
  casino: Casino & { translations: CasinoTranslation[] };
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

function asBonusType(value: string): BonusTypeId | null {
  return LISTING_BONUS_TYPES.includes(value as BonusTypeId)
    ? (value as BonusTypeId)
    : null;
}

export function parseBonusTypeId(value: string): BonusTypeId | null {
  return asBonusType(value);
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

function toDirectoryBonus(
  bonus: BonusWithRelations,
  translation: BonusTranslation,
  casinoTranslation: CasinoTranslation,
): MockBonus {
  const type = asBonusType(bonus.type) ?? "welcome";

  return {
    id: bonus.id,
    slug: bonus.id,
    casinoSlug: bonus.casino.slug,
    casinoName: { en: casinoTranslation.name },
    logoUrl: bonus.casino.logoUrl ?? undefined,
    title: { en: translation.title },
    bonusValue: { en: bonus.amount ?? "—" },
    type,
    valueAmount: parseValueAmount(bonus.amount),
    listedAt: bonus.createdAt.toISOString(),
    expiresAt: bonus.expiryDate
      ? bonus.expiryDate.toISOString()
      : "9999-12-31",
    wagering: { en: bonus.wageringRequirement ?? "—" },
  };
}

export async function getBonuses(locale: string): Promise<MockBonus[]> {
  const rows = await prisma.bonus.findMany({
    where: {
      status: "published",
      casino: { status: "published" },
    },
    include: {
      translations: true,
      casino: { include: { translations: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.flatMap((bonus) => {
    const type = asBonusType(bonus.type);
    const translation = pickTranslation(bonus.translations, locale);
    const casinoTranslation = pickTranslation(bonus.casino.translations, locale);

    if (!type || !translation || !casinoTranslation) return [];

    return [toDirectoryBonus(bonus, translation, casinoTranslation)];
  });
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
      status: "published",
      casino: { slug: casinoSlug, status: "published" },
    },
    include: { translations: true },
    orderBy: { createdAt: "desc" },
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
