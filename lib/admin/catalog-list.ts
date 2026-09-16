import {
  type CatalogItem,
  type CatalogKind,
  type CatalogNames,
} from "@/lib/admin/catalog-kinds";
import { type Locale } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";

function pickNames(
  translations: { locale: string; name?: string; label?: string }[],
): CatalogNames {
  const read = (locale: Locale) => {
    const row = translations.find((item) => item.locale === locale);
    return row?.name ?? row?.label ?? "";
  };
  return { en: read("en"), zh: read("zh"), th: read("th") };
}

/**
 * Lean catalog list for admin screens. Usage counts/names are filled on delete
 * via getCatalogItemUsage — loading them here doubles remote DB latency.
 */
export async function listCatalogItems(kind: CatalogKind): Promise<CatalogItem[]> {
  if (kind === "payout") {
    const rows = await prisma.payoutSpeedOption.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        sortOrder: true,
        translations: { select: { locale: true, label: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      sortOrder: row.sortOrder,
      usageCount: null,
      usageNames: [],
      names: pickNames(row.translations),
    }));
  }

  if (kind === "license") {
    const rows = await prisma.license.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        sortOrder: true,
        translations: { select: { locale: true, name: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      sortOrder: row.sortOrder,
      usageCount: null,
      usageNames: [],
      names: pickNames(row.translations),
    }));
  }

  if (kind === "payment") {
    const rows = await prisma.paymentMethod.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        sortOrder: true,
        translations: { select: { locale: true, name: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      sortOrder: row.sortOrder,
      usageCount: null,
      usageNames: [],
      names: pickNames(row.translations),
    }));
  }

  if (kind === "provider") {
    const rows = await prisma.gameProvider.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        sortOrder: true,
        translations: { select: { locale: true, name: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      sortOrder: row.sortOrder,
      usageCount: null,
      usageNames: [],
      names: pickNames(row.translations),
    }));
  }

  const rows = await prisma.bonusType.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      sortOrder: true,
      translations: { select: { locale: true, name: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    sortOrder: row.sortOrder,
    usageCount: null,
    usageNames: [],
    names: pickNames(row.translations),
  }));
}
