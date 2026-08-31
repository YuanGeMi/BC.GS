import type { Bonus, Casino, CasinoTranslation } from "@prisma/client";

import {
  type BonusTypeId,
  type LicenseId,
  type MockCasino,
  type MockCasinoHighlight,
  type PaymentId,
  type ProviderId,
} from "@/data/mock-casinos";
import { parseBonusTypeId, parseValueAmount } from "@/lib/bonuses";
import {
  LICENSE_OPTIONS,
  PAYMENT_OPTIONS,
  PROVIDER_OPTIONS,
} from "@/lib/casino-directory";
import { prisma } from "@/lib/prisma";

function pickTranslation(
  translations: CasinoTranslation[],
  locale: string,
): CasinoTranslation | undefined {
  return (
    translations.find((item) => item.locale === locale) ??
    translations.find((item) => item.locale === "en")
  );
}

function asIds<T extends string>(values: string[], allowed: readonly T[]): T[] {
  const allowedSet = new Set<string>(allowed);
  return values.filter((value): value is T => allowedSet.has(value));
}

function parseLicenses(license: string | null): LicenseId[] {
  if (!license) return [];
  return asIds(
    license.split(",").map((part) => part.trim()),
    LICENSE_OPTIONS,
  );
}

function toHighlights(casino: Casino): MockCasinoHighlight[] {
  const deposit =
    casino.minDeposit == null ? "—" : `$${casino.minDeposit}`;

  return [
    { label: { en: "Min deposit" }, value: { en: deposit } },
    {
      label: { en: "Payout speed" },
      value: { en: casino.withdrawalTime ?? "—" },
    },
    { label: { en: "License" }, value: { en: casino.license ?? "—" } },
  ];
}

function deriveBonusFields(bonuses: Bonus[]): {
  bonusTypes: BonusTypeId[];
  bonusValue: number;
} {
  const types = new Set<BonusTypeId>();
  let bonusValue = 0;

  for (const bonus of bonuses) {
    const type = parseBonusTypeId(bonus.type);
    if (type) types.add(type);
    bonusValue = Math.max(bonusValue, parseValueAmount(bonus.amount));
  }

  return {
    bonusTypes: [...types],
    bonusValue,
  };
}

function toDirectoryCasino(
  casino: Casino,
  translation: CasinoTranslation,
  bonuses: Bonus[],
): MockCasino {
  const { bonusTypes, bonusValue } = deriveBonusFields(bonuses);

  return {
    id: casino.id,
    slug: casino.slug,
    rating: casino.overallRating ?? 0,
    logoUrl: casino.logoUrl ?? undefined,
    name: { en: translation.name },
    badges: [],
    highlights: toHighlights(casino),
    licenses: parseLicenses(casino.license),
    payments: asIds(casino.paymentMethods, PAYMENT_OPTIONS),
    providers: asIds(casino.gameProviders, PROVIDER_OPTIONS),
    bonusTypes,
    listedAt: casino.createdAt.toISOString(),
    bonusValue,
  };
}

export async function getCasinos(locale: string): Promise<MockCasino[]> {
  const rows = await prisma.casino.findMany({
    where: { status: "published" },
    include: {
      translations: true,
      bonuses: { where: { status: "published" } },
    },
    orderBy: { overallRating: "desc" },
  });

  return rows.flatMap((casino) => {
    const translation = pickTranslation(casino.translations, locale);
    if (!translation) return [];
    return [toDirectoryCasino(casino, translation, casino.bonuses)];
  });
}

export type CasinoDetailScores = {
  bonuses: number;
  gameVariety: number;
  support: number;
  payoutSpeed: number;
  trust: number;
};

export type CasinoDetailView = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  rating: number;
  badges: string[];
  licenses: LicenseId[];
  payments: PaymentId[];
  providers: ProviderId[];
  establishedYear: number | null;
  minDeposit: string;
  withdrawalTime: string;
  affiliateUrl: string;
  scores: CasinoDetailScores;
  pros: string[];
  cons: string[];
  review: string[];
};

export type RelatedCasinoCard = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  rating: number;
  badges: string[];
  highlights: Array<{ label: string; value: string }>;
};

function splitReviewBody(body: string): string[] {
  return body
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function toDetailView(
  casino: Casino,
  translation: CasinoTranslation,
): CasinoDetailView {
  return {
    id: casino.id,
    slug: casino.slug,
    name: translation.name,
    logoUrl: casino.logoUrl ?? undefined,
    rating: casino.overallRating ?? 0,
    badges: [],
    licenses: parseLicenses(casino.license),
    payments: asIds(casino.paymentMethods, PAYMENT_OPTIONS),
    providers: asIds(casino.gameProviders, PROVIDER_OPTIONS),
    establishedYear: casino.establishedYear,
    minDeposit:
      casino.minDeposit == null ? "—" : `$${casino.minDeposit}`,
    withdrawalTime: casino.withdrawalTime ?? "—",
    affiliateUrl: casino.affiliateLink ?? "#",
    scores: {
      bonuses: casino.ratingBonuses ?? 0,
      gameVariety: casino.ratingGames ?? 0,
      support: casino.ratingSupport ?? 0,
      payoutSpeed: casino.ratingPayout ?? 0,
      trust: casino.ratingTrust ?? 0,
    },
    pros: translation.pros,
    cons: translation.cons,
    review: splitReviewBody(translation.reviewBody),
  };
}

function toRelatedCard(casino: MockCasino): RelatedCasinoCard {
  return {
    id: casino.id,
    slug: casino.slug,
    name: casino.name.en,
    logoUrl: casino.logoUrl,
    rating: casino.rating,
    badges: casino.badges.map((badge) => badge.en),
    highlights: casino.highlights.map((row) => ({
      label: row.label.en,
      value: row.value.en,
    })),
  };
}

export async function getCasinoBySlug(
  slug: string,
  locale: string,
): Promise<CasinoDetailView | null> {
  const row = await prisma.casino.findUnique({
    where: { slug },
    include: { translations: true },
  });

  if (!row || row.status !== "published") return null;

  const translation = pickTranslation(row.translations, locale);
  if (!translation) return null;

  return toDetailView(row, translation);
}

export async function getRelatedCasinos(
  slug: string,
  locale: string,
  count = 4,
): Promise<RelatedCasinoCard[]> {
  const casinos = await getCasinos(locale);
  const current = casinos.find((item) => item.slug === slug);

  if (!current) return casinos.slice(0, count).map(toRelatedCard);

  const sameLicense = casinos.filter(
    (item) =>
      item.slug !== slug &&
      item.licenses.some((license) => current.licenses.includes(license)),
  );

  const pool =
    sameLicense.length >= count
      ? sameLicense
      : casinos.filter((item) => item.slug !== slug);

  return [...pool]
    .sort(
      (a, b) =>
        Math.abs(a.rating - current.rating) -
        Math.abs(b.rating - current.rating),
    )
    .slice(0, count)
    .map(toRelatedCard);
}

export async function getPublishedCasinoSlugs(): Promise<string[]> {
  const rows = await prisma.casino.findMany({
    where: { status: "published" },
    select: { slug: true },
  });

  return rows.map((row) => row.slug);
}

export type CasinoSeoMetadata = {
  name: string;
  seoTitle: string | null;
  seoDescription: string | null;
  reviewFirstParagraph: string;
};

export async function getCasinoSeoMetadata(
  slug: string,
  locale: string,
): Promise<CasinoSeoMetadata | null> {
  const row = await prisma.casino.findUnique({
    where: { slug },
    include: { translations: true },
  });

  if (!row || row.status !== "published") return null;

  const translation = pickTranslation(row.translations, locale);
  if (!translation) return null;

  const reviewParagraphs = splitReviewBody(translation.reviewBody);

  return {
    name: translation.name,
    seoTitle: translation.seoTitle,
    seoDescription: translation.seoDescription,
    reviewFirstParagraph: reviewParagraphs[0] ?? "",
  };
}
