import type {
  Bonus,
  Casino,
  CasinoLicense,
  CasinoTranslation,
  License,
  LicenseTranslation,
  PayoutSpeedOption,
  PayoutSpeedOptionTranslation,
} from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { cache } from "react";

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

function pickLocaleTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
): T | undefined {
  return (
    translations.find((item) => item.locale === locale) ??
    translations.find((item) => item.locale === "en")
  );
}

type PayoutSpeedOptionWithTranslations = PayoutSpeedOption & {
  translations: PayoutSpeedOptionTranslation[];
};

type LicenseWithTranslations = License & {
  translations: LicenseTranslation[];
};

type CasinoLicenseWithLicense = CasinoLicense & {
  license: LicenseWithTranslations;
};

export function getPayoutSpeedLabel(
  option: PayoutSpeedOptionWithTranslations | null,
  locale: string,
): string {
  if (!option) return "—";
  return pickLocaleTranslation(option.translations, locale)?.label ?? "—";
}

function asIds<T extends string>(values: string[], allowed: readonly T[]): T[] {
  const allowedSet = new Set<string>(allowed);
  return values.filter((value): value is T => allowedSet.has(value));
}

function licenseIdsFromRelations(
  licenses: CasinoLicenseWithLicense[],
): LicenseId[] {
  return asIds(
    licenses.map((row) => row.license.slug),
    LICENSE_OPTIONS,
  );
}

function formatLicenseNames(
  licenses: CasinoLicenseWithLicense[],
  locale: string,
): string {
  const names = licenses
    .map(
      (row) =>
        pickLocaleTranslation(row.license.translations, locale)?.name ??
        row.license.slug,
    )
    .filter(Boolean);

  return names.length > 0 ? names.join(" · ") : "—";
}

type CasinoHighlightLabels = {
  minDeposit: string;
  payoutSpeed: string;
  license: string;
};

function toHighlights(
  casino: {
    minDeposit: number | null;
    payoutSpeed: PayoutSpeedOptionWithTranslations | null;
    licenses: CasinoLicenseWithLicense[];
  },
  locale: string,
  labels: CasinoHighlightLabels,
): MockCasinoHighlight[] {
  const deposit =
    casino.minDeposit == null ? "—" : `$${casino.minDeposit}`;

  return [
    { label: { en: labels.minDeposit }, value: { en: deposit } },
    {
      label: { en: labels.payoutSpeed },
      value: { en: getPayoutSpeedLabel(casino.payoutSpeed, locale) },
    },
    {
      label: { en: labels.license },
      value: { en: formatLicenseNames(casino.licenses, locale) },
    },
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

type CasinoWithRelations = Casino & {
  payoutSpeed: PayoutSpeedOptionWithTranslations | null;
  licenses: CasinoLicenseWithLicense[];
};

function toDirectoryCasino(
  casino: CasinoWithRelations,
  translation: CasinoTranslation,
  bonuses: Bonus[],
  locale: string,
  labels: CasinoHighlightLabels,
): MockCasino {
  const { bonusTypes, bonusValue } = deriveBonusFields(bonuses);

  return {
    id: casino.id,
    slug: casino.slug,
    rating: casino.overallRating ?? 0,
    logoUrl: casino.logoUrl ?? undefined,
    name: { en: translation.name },
    badges: [],
    highlights: toHighlights(casino, locale, labels),
    licenses: licenseIdsFromRelations(casino.licenses),
    payments: asIds(casino.paymentMethods, PAYMENT_OPTIONS),
    providers: asIds(casino.gameProviders, PROVIDER_OPTIONS),
    bonusTypes,
    listedAt: casino.createdAt.toISOString(),
    bonusValue,
  };
}

const casinoLicenseInclude = {
  license: { include: { translations: true } },
} as const;

export async function getCasinos(locale: string): Promise<MockCasino[]> {
  const [rows, t] = await Promise.all([
    prisma.casino.findMany({
      where: { status: "published" },
      include: {
        translations: true,
        payoutSpeed: { include: { translations: true } },
        bonuses: { where: { status: "published" } },
        licenses: { include: casinoLicenseInclude },
      },
      orderBy: { overallRating: "desc" },
    }),
    getTranslations({ locale, namespace: "CasinoDetail" }),
  ]);

  const labels = {
    minDeposit: t("facts.minDeposit"),
    payoutSpeed: t("scores.payoutSpeed"),
    license: t("facts.license"),
  };

  return rows.flatMap((casino) => {
    const translation = pickTranslation(casino.translations, locale);
    if (!translation) return [];
    return [toDirectoryCasino(casino, translation, casino.bonuses, locale, labels)];
  });
}

/** Lean list for the compare picker — name/logo/rating only. */
export type CasinoPickerItem = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  rating: number;
};

export type CasinoCompareBonus = {
  title: string;
  value: string;
  wagering: string;
  minDeposit: string;
};

/** Full row for the compare table — Prisma fields, no review body. */
export type CasinoCompareDetail = {
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
  bonus: CasinoCompareBonus | null;
};

export async function getCasinoPickerList(
  locale: string,
): Promise<CasinoPickerItem[]> {
  const rows = await prisma.casino.findMany({
    where: { status: "published" },
    orderBy: [{ overallRating: "desc" }, { slug: "asc" }],
    select: {
      id: true,
      slug: true,
      logoUrl: true,
      overallRating: true,
      translations: {
        select: { locale: true, name: true },
      },
    },
  });

  return rows.flatMap((row) => {
    const translation = pickLocaleTranslation(row.translations, locale);
    if (!translation) return [];
    return [
      {
        id: row.id,
        slug: row.slug,
        name: translation.name,
        logoUrl: row.logoUrl ?? undefined,
        rating: row.overallRating ?? 0,
      },
    ];
  });
}

export async function getCasinoCompareDetail(
  slug: string,
  locale: string,
): Promise<CasinoCompareDetail | null> {
  const [row, bonusRows] = await Promise.all([
    prisma.casino.findUnique({
      where: { slug },
      include: {
        translations: {
          select: {
            locale: true,
            name: true,
            pros: true,
            cons: true,
          },
        },
        payoutSpeed: { include: { translations: true } },
        licenses: { include: casinoLicenseInclude },
      },
    }),
    prisma.bonus.findMany({
      where: {
        status: "published",
        casino: { slug, status: "published" },
      },
      include: { translations: true },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
  ]);

  if (!row || row.status !== "published") return null;

  const translation = pickLocaleTranslation(row.translations, locale);
  if (!translation) return null;

  const primaryBonus = bonusRows[0];
  const bonusTranslation = primaryBonus
    ? pickLocaleTranslation(primaryBonus.translations, locale)
    : undefined;

  return {
    id: row.id,
    slug: row.slug,
    name: translation.name,
    logoUrl: row.logoUrl ?? undefined,
    rating: row.overallRating ?? 0,
    badges: [],
    licenses: licenseIdsFromRelations(row.licenses),
    payments: asIds(row.paymentMethods, PAYMENT_OPTIONS),
    providers: asIds(row.gameProviders, PROVIDER_OPTIONS),
    establishedYear: row.establishedYear,
    minDeposit: row.minDeposit == null ? "—" : `$${row.minDeposit}`,
    withdrawalTime: getPayoutSpeedLabel(row.payoutSpeed, locale),
    affiliateUrl: row.affiliateLink ?? "#",
    scores: {
      bonuses: row.ratingBonuses ?? 0,
      gameVariety: row.ratingGames ?? 0,
      support: row.ratingSupport ?? 0,
      payoutSpeed: row.ratingPayout ?? 0,
      trust: row.ratingTrust ?? 0,
    },
    pros: translation.pros,
    cons: translation.cons,
    bonus:
      primaryBonus && bonusTranslation
        ? {
            title: bonusTranslation.title,
            value: primaryBonus.amount ?? "—",
            wagering: primaryBonus.wageringRequirement ?? "—",
            minDeposit:
              primaryBonus.minDeposit == null
                ? "—"
                : `$${primaryBonus.minDeposit}`,
          }
        : null,
  };
}

/**
 * Homepage top-rated strip + hero. Caps at `limit` in SQL and skips the
 * directory-only bonus payload while keeping card highlight fields
 * (min deposit, payout speed, license names).
 */
export async function getTopCasinos(
  locale: string,
  limit = 8,
): Promise<MockCasino[]> {
  const [rows, t] = await Promise.all([
    prisma.casino.findMany({
      where: { status: "published" },
      orderBy: [{ overallRating: "desc" }, { slug: "asc" }],
      take: limit,
      include: {
        translations: true,
        payoutSpeed: { include: { translations: true } },
        licenses: { include: casinoLicenseInclude },
      },
    }),
    getTranslations({ locale, namespace: "CasinoDetail" }),
  ]);

  const labels = {
    minDeposit: t("facts.minDeposit"),
    payoutSpeed: t("scores.payoutSpeed"),
    license: t("facts.license"),
  };

  return rows.flatMap((casino) => {
    const translation = pickTranslation(casino.translations, locale);
    if (!translation) return [];
    // Homepage cards do not use bonusTypes / bonusValue — pass empty bonuses.
    return [toDirectoryCasino(casino, translation, [], locale, labels)];
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
  casino: CasinoWithRelations,
  translation: CasinoTranslation,
  locale: string,
): CasinoDetailView {
  return {
    id: casino.id,
    slug: casino.slug,
    name: translation.name,
    logoUrl: casino.logoUrl ?? undefined,
    rating: casino.overallRating ?? 0,
    badges: [],
    licenses: licenseIdsFromRelations(casino.licenses),
    payments: asIds(casino.paymentMethods, PAYMENT_OPTIONS),
    providers: asIds(casino.gameProviders, PROVIDER_OPTIONS),
    establishedYear: casino.establishedYear,
    minDeposit:
      casino.minDeposit == null ? "—" : `$${casino.minDeposit}`,
    withdrawalTime: getPayoutSpeedLabel(casino.payoutSpeed, locale),
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

function mapRelatedCasinoRow(
  row: RelatedCasinoRow,
  locale: string,
): RelatedCasinoCard | null {
  const translation = pickLocaleTranslation(row.translations, locale);
  if (!translation) return null;

  return {
    id: row.id,
    slug: row.slug,
    name: translation.name,
    logoUrl: row.logoUrl ?? undefined,
    rating: row.overallRating ?? 0,
    badges: [],
    highlights: [],
  };
}

type RelatedCasinoRow = {
  id: string;
  slug: string;
  logoUrl: string | null;
  overallRating: number | null;
  translations: Array<{ locale: string; name: string }>;
};

const relatedCasinoSelect = {
  id: true,
  slug: true,
  logoUrl: true,
  overallRating: true,
  translations: {
    select: { locale: true, name: true },
  },
} as const;

function sortByRatingProximity<T extends { overallRating: number | null }>(
  rows: T[],
  targetRating: number,
): T[] {
  return [...rows].sort(
    (a, b) =>
      Math.abs((a.overallRating ?? 0) - targetRating) -
      Math.abs((b.overallRating ?? 0) - targetRating),
  );
}

/**
 * Shared casino row for detail + SEO metadata. React cache() dedupes within a
 * single request so generateMetadata and the page share one Prisma round-trip.
 */
const getPublishedCasinoDetailRow = cache(async (slug: string) => {
  return prisma.casino.findUnique({
    where: { slug },
    include: {
      translations: true,
      payoutSpeed: { include: { translations: true } },
      licenses: { include: casinoLicenseInclude },
    },
  });
});

export const getCasinoBySlug = cache(
  async (
    slug: string,
    locale: string,
  ): Promise<CasinoDetailView | null> => {
    const row = await getPublishedCasinoDetailRow(slug);

    if (!row || row.status !== "published") return null;

    const translation = pickTranslation(row.translations, locale);
    if (!translation) return null;

    return toDetailView(row, translation, locale);
  },
);

/**
 * Related = other published casinos that share at least one license,
 * ordered by closest editorial rating. Falls back to any other published
 * casino if fewer than `count` share a license.
 */
export async function getRelatedCasinos(
  slug: string,
  locale: string,
  count = 4,
): Promise<RelatedCasinoCard[]> {
  const current = await prisma.casino.findUnique({
    where: { slug },
    select: {
      overallRating: true,
      status: true,
      licenses: {
        select: { license: { select: { slug: true } } },
      },
    },
  });

  if (!current || current.status !== "published") {
    return [];
  }

  const targetRating = current.overallRating ?? 0;
  const licenseSlugs = current.licenses.map((row) => row.license.slug);
  const selected: RelatedCasinoCard[] = [];
  const selectedIds = new Set<string>();

  const pushRows = (rows: RelatedCasinoRow[]) => {
    for (const row of sortByRatingProximity(rows, targetRating)) {
      if (selected.length >= count || selectedIds.has(row.id)) continue;
      const card = mapRelatedCasinoRow(row, locale);
      if (!card) continue;
      selected.push(card);
      selectedIds.add(row.id);
    }
  };

  if (licenseSlugs.length > 0) {
    // Lean same-license candidates only (no bonuses / nested license trees).
    const sameLicense = await prisma.casino.findMany({
      where: {
        status: "published",
        slug: { not: slug },
        licenses: {
          some: { license: { slug: { in: licenseSlugs } } },
        },
      },
      select: relatedCasinoSelect,
    });
    pushRows(sameLicense);
  }

  if (selected.length < count) {
    const fillers = await prisma.casino.findMany({
      where: {
        status: "published",
        slug: { not: slug },
        ...(selectedIds.size > 0
          ? { id: { notIn: [...selectedIds] } }
          : {}),
      },
      select: relatedCasinoSelect,
    });
    pushRows(fillers);
  }

  return selected;
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

export const getCasinoSeoMetadata = cache(
  async (
    slug: string,
    locale: string,
  ): Promise<CasinoSeoMetadata | null> => {
    const row = await getPublishedCasinoDetailRow(slug);

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
  },
);
