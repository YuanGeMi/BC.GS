import { unstable_cache } from "next/cache";
import { cache } from "react";

import { CATALOG_OPTIONS_TAG } from "@/lib/cache-tags";
import { dedupeInflight } from "@/lib/dedupe-inflight";
import { prisma } from "@/lib/prisma";

export type CatalogOption = {
  slug: string;
  name: string;
};

function pickName(
  translations: { locale: string; name: string }[],
  locale: string,
  fallback: string,
): string {
  return (
    translations.find((item) => item.locale === locale)?.name ??
    translations.find((item) => item.locale === "en")?.name ??
    fallback
  );
}

function toOptions(
  rows: {
    slug: string;
    translations: { locale: string; name: string }[];
  }[],
  locale: string,
): CatalogOption[] {
  return rows.map((row) => ({
    slug: row.slug,
    name: pickName(row.translations, locale, row.slug),
  }));
}

type CatalogRows = {
  licenses: { slug: string; translations: { locale: string; name: string }[] }[];
  payments: { slug: string; translations: { locale: string; name: string }[] }[];
  providers: { slug: string; translations: { locale: string; name: string }[] }[];
  bonusTypes: {
    slug: string;
    translations: { locale: string; name: string }[];
  }[];
};

const catalogRowsInflight: { current: Promise<CatalogRows> | null } = {
  current: null,
};

async function loadCatalogRows(): Promise<CatalogRows> {
  return dedupeInflight(catalogRowsInflight, async () => {
    const [licenses, payments, providers, bonusTypes] = await Promise.all([
      prisma.license.findMany({
        orderBy: { sortOrder: "asc" },
        include: { translations: true },
      }),
      prisma.paymentMethod.findMany({
        orderBy: { sortOrder: "asc" },
        include: { translations: true },
      }),
      prisma.gameProvider.findMany({
        orderBy: { sortOrder: "asc" },
        include: { translations: true },
      }),
      prisma.bonusType.findMany({
        orderBy: { sortOrder: "asc" },
        include: { translations: true },
      }),
    ]);
    return { licenses, payments, providers, bonusTypes };
  });
}

const getCachedCatalogRows = cache(async () => {
  return unstable_cache(loadCatalogRows, ["catalog-option-rows"], {
    revalidate: false,
    tags: [CATALOG_OPTIONS_TAG],
  })();
});

export const getPaymentMethodOptions = cache(
  async (locale: string): Promise<CatalogOption[]> => {
    const { payments } = await getCachedCatalogRows();
    return toOptions(payments, locale);
  },
);

export const getGameProviderOptions = cache(
  async (locale: string): Promise<CatalogOption[]> => {
    const { providers } = await getCachedCatalogRows();
    return toOptions(providers, locale);
  },
);

export const getBonusTypeOptions = cache(
  async (locale: string): Promise<CatalogOption[]> => {
    const { bonusTypes } = await getCachedCatalogRows();
    return toOptions(bonusTypes, locale);
  },
);

export const getLicenseOptions = cache(
  async (locale: string): Promise<CatalogOption[]> => {
    const { licenses } = await getCachedCatalogRows();
    return toOptions(licenses, locale);
  },
);

export const getDirectoryCatalogs = cache(async (locale: string) => {
  const rows = await getCachedCatalogRows();
  return {
    licenses: toOptions(rows.licenses, locale),
    payments: toOptions(rows.payments, locale),
    providers: toOptions(rows.providers, locale),
    bonusTypes: toOptions(rows.bonusTypes, locale),
  };
});

export const casinoCatalogInclude = {
  paymentMethods: {
    include: {
      paymentMethod: { include: { translations: true } },
    },
  },
  gameProviders: {
    include: {
      gameProvider: { include: { translations: true } },
    },
  },
} as const;

export function catalogSlugs(
  rows: { slug: string }[],
): string[] {
  return rows.map((row) => row.slug);
}

export function catalogLabels(
  rows: {
    slug: string;
    translations: { locale: string; name: string }[];
  }[],
  locale: string,
): string[] {
  return rows.map((row) => pickName(row.translations, locale, row.slug));
}
