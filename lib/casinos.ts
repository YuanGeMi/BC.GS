import type {
  Bonus,
  BonusType,
  Casino,
  CasinoGameProvider,
  CasinoLicense,
  CasinoPaymentMethod,
  CasinoTranslation,
  GameProvider,
  GameProviderTranslation,
  License,
  LicenseTranslation,
  PaymentMethod,
  PaymentMethodTranslation,
  PayoutSpeedOption,
  PayoutSpeedOptionTranslation,
} from "@prisma/client";
import { unstable_cache } from "next/cache";
import { getTranslations } from "next-intl/server";
import { cache } from "react";

import {
  type MockCasino,
  type MockCasinoHighlight,
} from "@/data/mock-casinos";
import { bonusListOrder, parseValueAmount } from "@/lib/bonuses";
import {
  casinoCatalogInclude,
  catalogLabels,
  catalogSlugs,
} from "@/lib/catalogs";
import { publishedContentWhere } from "@/lib/db-enums";
import { prisma } from "@/lib/prisma";
import { casinoCompareDetailTag } from "@/lib/cache-tags";

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

type PaymentMethodWithTranslations = PaymentMethod & {
  translations: PaymentMethodTranslation[];
};

type GameProviderWithTranslations = GameProvider & {
  translations: GameProviderTranslation[];
};

type CasinoPaymentMethodWithMethod = CasinoPaymentMethod & {
  paymentMethod: PaymentMethodWithTranslations;
};

type CasinoGameProviderWithProvider = CasinoGameProvider & {
  gameProvider: GameProviderWithTranslations;
};

type BonusWithType = Bonus & { bonusType: Pick<BonusType, "slug"> };

function licenseSlugsFromRelations(
  licenses: CasinoLicenseWithLicense[],
): string[] {
  return catalogSlugs(licenses.map((row) => row.license));
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
  const deposit = casino.minDeposit == null ? "—" : `$${casino.minDeposit}`;

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

function deriveBonusFields(bonuses: BonusWithType[]): {
  bonusTypes: string[];
  bonusValue: number;
} {
  const types = new Set<string>();
  let bonusValue = 0;

  for (const bonus of bonuses) {
    types.add(bonus.bonusType.slug);
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
  paymentMethods: CasinoPaymentMethodWithMethod[];
  gameProviders: CasinoGameProviderWithProvider[];
};

function toDirectoryCasino(
  casino: CasinoWithRelations,
  translation: CasinoTranslation,
  bonuses: BonusWithType[],
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
    licenses: licenseSlugsFromRelations(casino.licenses),
    payments: catalogSlugs(
      casino.paymentMethods.map((row) => row.paymentMethod),
    ),
    providers: catalogSlugs(
      casino.gameProviders.map((row) => row.gameProvider),
    ),
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
      where: publishedContentWhere,
      include: {
        translations: true,
        payoutSpeed: { include: { translations: true } },
        bonuses: {
          where: publishedContentWhere,
          include: { bonusType: { select: { slug: true } } },
          orderBy: bonusListOrder,
        },
        licenses: { include: casinoLicenseInclude },
        ...casinoCatalogInclude,
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
    return [
      toDirectoryCasino(casino, translation, casino.bonuses, locale, labels),
    ];
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
  licenses: string[];
  payments: string[];
  providers: string[];
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
    where: publishedContentWhere,
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

async function loadCasinoCompareDetail(
  slug: string,
  locale: string,
): Promise<CasinoCompareDetail | null> {
  const [row, bonusRows] = await Promise.all([
    prisma.casino.findFirst({
      where: { slug, ...publishedContentWhere },
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
        ...casinoCatalogInclude,
      },
    }),
    prisma.bonus.findMany({
      where: {
        ...publishedContentWhere,
        casino: { slug, ...publishedContentWhere },
      },
      include: { translations: true },
      orderBy: bonusListOrder,
      take: 1,
    }),
  ]);

  if (!row) return null;

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
    licenses: catalogLabels(
      row.licenses.map((item) => item.license),
      locale,
    ),
    payments: catalogLabels(
      row.paymentMethods.map((item) => item.paymentMethod),
      locale,
    ),
    providers: catalogLabels(
      row.gameProviders.map((item) => item.gameProvider),
      locale,
    ),
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
 * Compare-slot detail. Safe to cache across visitors (no auth / personalization).
 * - React cache(): dedupe within a single request
 * - unstable_cache + tag: reuse across requests until revalidateCasinoPage(slug)
 */
export const getCasinoCompareDetail = cache(
  async (slug: string, locale: string): Promise<CasinoCompareDetail | null> => {
    return unstable_cache(
      () => loadCasinoCompareDetail(slug, locale),
      ["casino-compare-detail", slug, locale],
      {
        // On-demand only — same model as SSG pages + revalidatePath.
        revalidate: false,
        tags: [casinoCompareDetailTag(slug)],
      },
    )();
  },
);

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
      where: publishedContentWhere,
      orderBy: [{ overallRating: "desc" }, { slug: "asc" }],
      take: limit,
      include: {
        translations: true,
        payoutSpeed: { include: { translations: true } },
        licenses: { include: casinoLicenseInclude },
        ...casinoCatalogInclude,
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
  licenses: string[];
  payments: string[];
  providers: string[];
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
    licenses: catalogLabels(
      casino.licenses.map((item) => item.license),
      locale,
    ),
    payments: catalogLabels(
      casino.paymentMethods.map((item) => item.paymentMethod),
      locale,
    ),
    providers: catalogLabels(
      casino.gameProviders.map((item) => item.gameProvider),
      locale,
    ),
    establishedYear: casino.establishedYear,
    minDeposit: casino.minDeposit == null ? "—" : `$${casino.minDeposit}`,
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
  return prisma.casino.findFirst({
    where: { slug, ...publishedContentWhere },
    include: {
      translations: true,
      payoutSpeed: { include: { translations: true } },
      licenses: { include: casinoLicenseInclude },
      ...casinoCatalogInclude,
    },
  });
});

export const getCasinoBySlug = cache(
  async (slug: string, locale: string): Promise<CasinoDetailView | null> => {
    const row = await getPublishedCasinoDetailRow(slug);

    if (!row) return null;

    const translation = pickTranslation(row.translations, locale);
    if (!translation) return null;

    return toDetailView(row, translation, locale);
  },
);

/**
 * Related = other published casinos that share at least one license,
 * ordered by closest editorial rating. Falls back to any other published
 * casino if fewer than `count` share a license.
 *
 * One DB round-trip for candidates; current casino reuses the detail-row
 * React cache from getCasinoBySlug / generateMetadata.
 */
export async function getRelatedCasinos(
  slug: string,
  locale: string,
  count = 4,
): Promise<RelatedCasinoCard[]> {
  const current = await getPublishedCasinoDetailRow(slug);
  if (!current) {
    return [];
  }

  const targetRating = current.overallRating ?? 0;
  const licenseSlugs = new Set(
    current.licenses.map((row) => row.license.slug),
  );

  const rows = await prisma.casino.findMany({
    where: {
      ...publishedContentWhere,
      slug: { not: slug },
    },
    select: {
      ...relatedCasinoSelect,
      licenses: { select: { license: { select: { slug: true } } } },
    },
  });

  const withSharedLicense: typeof rows = [];
  const fillers: typeof rows = [];
  for (const row of rows) {
    const shares = row.licenses.some((link) =>
      licenseSlugs.has(link.license.slug),
    );
    if (shares) withSharedLicense.push(row);
    else fillers.push(row);
  }

  const selected: RelatedCasinoCard[] = [];
  const selectedIds = new Set<string>();

  const pushRows = (candidates: typeof rows) => {
    for (const row of sortByRatingProximity(candidates, targetRating)) {
      if (selected.length >= count || selectedIds.has(row.id)) continue;
      const card = mapRelatedCasinoRow(row, locale);
      if (!card) continue;
      selected.push(card);
      selectedIds.add(row.id);
    }
  };

  pushRows(withSharedLicense);
  if (selected.length < count) pushRows(fillers);

  return selected;
}

export async function getPublishedCasinoSlugs(): Promise<string[]> {
  const rows = await prisma.casino.findMany({
    where: publishedContentWhere,
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
  async (slug: string, locale: string): Promise<CasinoSeoMetadata | null> => {
    const row = await getPublishedCasinoDetailRow(slug);

    if (!row) return null;

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
