import { cache } from "react";

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

export const getPaymentMethodOptions = cache(
  async (locale: string): Promise<CatalogOption[]> => {
    const rows = await prisma.paymentMethod.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: true },
    });
    return toOptions(rows, locale);
  },
);

export const getGameProviderOptions = cache(
  async (locale: string): Promise<CatalogOption[]> => {
    const rows = await prisma.gameProvider.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: true },
    });
    return toOptions(rows, locale);
  },
);

export const getBonusTypeOptions = cache(
  async (locale: string): Promise<CatalogOption[]> => {
    const rows = await prisma.bonusType.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: true },
    });
    return toOptions(rows, locale);
  },
);

export const getLicenseOptions = cache(
  async (locale: string): Promise<CatalogOption[]> => {
    const rows = await prisma.license.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: true },
    });
    return toOptions(rows, locale);
  },
);

export const getDirectoryCatalogs = cache(async (locale: string) => {
  const [licenses, payments, providers, bonusTypes] = await Promise.all([
    getLicenseOptions(locale),
    getPaymentMethodOptions(locale),
    getGameProviderOptions(locale),
    getBonusTypeOptions(locale),
  ]);

  return { licenses, payments, providers, bonusTypes };
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
  rows: { slug: string; translations: { locale: string; name: string }[] }[],
  locale: string,
): string[] {
  return rows.map((row) => pickName(row.translations, locale, row.slug));
}
