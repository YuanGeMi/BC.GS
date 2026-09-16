"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  type CatalogItem,
  type CatalogKind,
  type CatalogNames,
} from "@/lib/admin/catalog-kinds";
import { CONTENT_LOCALES, normalizeSlug } from "@/lib/admin/casino-input";
import { requireAdmin } from "@/lib/auth/require-admin";
import { routing, type Locale } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { revalidateCatalogSurfaces } from "@/lib/revalidate";

export type CatalogActionError =
  | "invalidSlug"
  | "duplicateSlug"
  | "englishRequired"
  | "invalidSort"
  | "missing"
  | "inUse"
  | "payoutInUse";

export type CatalogActionResult =
  | { ok: true; id: string }
  | { ok: false; error: CatalogActionError; usageNames?: string[] };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function pickNames(
  translations: { locale: string; name?: string; label?: string }[],
): CatalogNames {
  const read = (locale: Locale) => {
    const row = translations.find((item) => item.locale === locale);
    return row?.name ?? row?.label ?? "";
  };
  return { en: read("en"), zh: read("zh"), th: read("th") };
}

function parseSort(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true as const, value: 0 };
  if (!/^-?\d+$/.test(trimmed)) return { ok: false as const };
  return { ok: true as const, value: Number(trimmed) };
}

function localeTexts(names: CatalogNames) {
  return CONTENT_LOCALES.flatMap((locale) => {
    const text = names[locale].trim();
    if (locale !== "en" && !text) return [];
    return [{ locale, text: text || names.en.trim() }];
  });
}

async function revalidateAdminCatalogs() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/catalogs`);
    revalidatePath(`/${locale}/admin/catalogs/payout`);
    revalidatePath(`/${locale}/admin/catalogs/licenses`);
    revalidatePath(`/${locale}/admin/catalogs/payments`);
    revalidatePath(`/${locale}/admin/catalogs/providers`);
    revalidatePath(`/${locale}/admin/catalogs/bonus-types`);
    revalidatePath(`/${locale}/admin/catalogs/markets`);
    revalidatePath(`/${locale}/admin/casinos`);
    revalidatePath(`/${locale}/admin/bonuses`);
  }
  await revalidateCatalogSurfaces();
}

async function catalogUsage(
  kind: CatalogKind,
  id: string,
): Promise<CatalogItem | null> {
  if (kind === "payout") {
    const row = await prisma.payoutSpeedOption.findUnique({
      where: { id },
      include: {
        translations: true,
        casinos: {
          take: 8,
          select: {
            slug: true,
            translations: { where: { locale: "en" }, select: { name: true } },
          },
        },
        _count: { select: { casinos: true } },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      slug: row.slug,
      sortOrder: row.sortOrder,
      usageCount: row._count.casinos,
      usageNames: row.casinos.map(
        (casino) => casino.translations[0]?.name || casino.slug,
      ),
      names: pickNames(row.translations),
    };
  }

  if (kind === "license") {
    const row = await prisma.license.findUnique({
      where: { id },
      include: {
        translations: true,
        casinos: {
          take: 8,
          include: {
            casino: {
              select: {
                slug: true,
                translations: { where: { locale: "en" }, select: { name: true } },
              },
            },
          },
        },
        _count: { select: { casinos: true } },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      slug: row.slug,
      sortOrder: row.sortOrder,
      usageCount: row._count.casinos,
      usageNames: row.casinos.map(
        (link) => link.casino.translations[0]?.name || link.casino.slug,
      ),
      names: pickNames(row.translations),
    };
  }

  if (kind === "payment") {
    const row = await prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        translations: true,
        casinos: {
          take: 8,
          include: {
            casino: {
              select: {
                slug: true,
                translations: { where: { locale: "en" }, select: { name: true } },
              },
            },
          },
        },
        _count: { select: { casinos: true } },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      slug: row.slug,
      sortOrder: row.sortOrder,
      usageCount: row._count.casinos,
      usageNames: row.casinos.map(
        (link) => link.casino.translations[0]?.name || link.casino.slug,
      ),
      names: pickNames(row.translations),
    };
  }

  if (kind === "provider") {
    const row = await prisma.gameProvider.findUnique({
      where: { id },
      include: {
        translations: true,
        casinos: {
          take: 8,
          include: {
            casino: {
              select: {
                slug: true,
                translations: { where: { locale: "en" }, select: { name: true } },
              },
            },
          },
        },
        _count: { select: { casinos: true } },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      slug: row.slug,
      sortOrder: row.sortOrder,
      usageCount: row._count.casinos,
      usageNames: row.casinos.map(
        (link) => link.casino.translations[0]?.name || link.casino.slug,
      ),
      names: pickNames(row.translations),
    };
  }

  const row = await prisma.bonusType.findUnique({
    where: { id },
    include: {
      translations: true,
      bonuses: {
        take: 8,
        include: {
          translations: { where: { locale: "en" }, select: { title: true } },
          casino: {
            select: {
              slug: true,
              translations: { where: { locale: "en" }, select: { name: true } },
            },
          },
        },
      },
      _count: { select: { bonuses: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    sortOrder: row.sortOrder,
    usageCount: row._count.bonuses,
    usageNames: row.bonuses.map((bonus) => {
      const casino = bonus.casino.translations[0]?.name || bonus.casino.slug;
      const title = bonus.translations[0]?.title;
      return title ? `${title} (${casino})` : casino;
    }),
    names: pickNames(row.translations),
  };
}

/** Load usage sample names for one option (delete confirm only). */
export async function getCatalogItemUsage(
  kind: CatalogKind,
  id: string,
): Promise<CatalogItem | null> {
  await requireAdmin();
  return catalogUsage(kind, id);
}

export async function upsertCatalogItem(
  kind: CatalogKind,
  input: {
    id?: string;
    slug: string;
    sortOrder: string;
    names: CatalogNames;
  },
): Promise<CatalogActionResult> {
  await requireAdmin();

  if (!input.names.en.trim()) return { ok: false, error: "englishRequired" };
  const sort = parseSort(input.sortOrder);
  if (!sort.ok) return { ok: false, error: "invalidSort" };

  const names: CatalogNames = {
    en: input.names.en.trim(),
    zh: input.names.zh.trim(),
    th: input.names.th.trim(),
  };

  try {
    if (input.id) {
      return await updateCatalogItem(kind, input.id, sort.value, names);
    }

    const slug = normalizeSlug(input.slug);
    if (!SLUG_RE.test(slug)) return { ok: false, error: "invalidSlug" };
    return await createCatalogItem(kind, slug, sort.value, names);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "duplicateSlug" };
    }
    throw error;
  }
}

async function createCatalogItem(
  kind: CatalogKind,
  slug: string,
  sortOrder: number,
  names: CatalogNames,
): Promise<CatalogActionResult> {
  if (kind === "payout") {
    const created = await prisma.payoutSpeedOption.create({
      data: { slug, sortOrder },
      select: { id: true },
    });
    await prisma.payoutSpeedOptionTranslation.createMany({
      data: localeTexts(names).map((row) => ({
        optionId: created.id,
        locale: row.locale,
        label: row.text,
      })),
    });
    await revalidateAdminCatalogs();
    return { ok: true, id: created.id };
  }
  if (kind === "license") {
    const created = await prisma.license.create({
      data: { slug, sortOrder },
      select: { id: true },
    });
    await prisma.licenseTranslation.createMany({
      data: localeTexts(names).map((row) => ({
        licenseId: created.id,
        locale: row.locale,
        name: row.text,
      })),
    });
    await revalidateAdminCatalogs();
    return { ok: true, id: created.id };
  }
  if (kind === "payment") {
    const created = await prisma.paymentMethod.create({
      data: { slug, sortOrder },
      select: { id: true },
    });
    await prisma.paymentMethodTranslation.createMany({
      data: localeTexts(names).map((row) => ({
        paymentMethodId: created.id,
        locale: row.locale,
        name: row.text,
      })),
    });
    await revalidateAdminCatalogs();
    return { ok: true, id: created.id };
  }
  if (kind === "provider") {
    const created = await prisma.gameProvider.create({
      data: { slug, sortOrder },
      select: { id: true },
    });
    await prisma.gameProviderTranslation.createMany({
      data: localeTexts(names).map((row) => ({
        gameProviderId: created.id,
        locale: row.locale,
        name: row.text,
      })),
    });
    await revalidateAdminCatalogs();
    return { ok: true, id: created.id };
  }
  const created = await prisma.bonusType.create({
    data: { slug, sortOrder },
    select: { id: true },
  });
  await prisma.bonusTypeTranslation.createMany({
    data: localeTexts(names).map((row) => ({
      bonusTypeId: created.id,
      locale: row.locale,
      name: row.text,
    })),
  });
  await revalidateAdminCatalogs();
  return { ok: true, id: created.id };
}

async function updateCatalogItem(
  kind: CatalogKind,
  id: string,
  sortOrder: number,
  names: CatalogNames,
): Promise<CatalogActionResult> {
  if (kind === "payout") {
    const existing = await prisma.payoutSpeedOption.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "missing" };
    await prisma.payoutSpeedOption.update({ where: { id }, data: { sortOrder } });
    await prisma.payoutSpeedOptionTranslation.deleteMany({ where: { optionId: id } });
    await prisma.payoutSpeedOptionTranslation.createMany({
      data: localeTexts(names).map((row) => ({
        optionId: id,
        locale: row.locale,
        label: row.text,
      })),
    });
    await revalidateAdminCatalogs();
    return { ok: true, id };
  }
  if (kind === "license") {
    const existing = await prisma.license.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "missing" };
    await prisma.license.update({ where: { id }, data: { sortOrder } });
    await prisma.licenseTranslation.deleteMany({ where: { licenseId: id } });
    await prisma.licenseTranslation.createMany({
      data: localeTexts(names).map((row) => ({
        licenseId: id,
        locale: row.locale,
        name: row.text,
      })),
    });
    await revalidateAdminCatalogs();
    return { ok: true, id };
  }
  if (kind === "payment") {
    const existing = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "missing" };
    await prisma.paymentMethod.update({ where: { id }, data: { sortOrder } });
    await prisma.paymentMethodTranslation.deleteMany({ where: { paymentMethodId: id } });
    await prisma.paymentMethodTranslation.createMany({
      data: localeTexts(names).map((row) => ({
        paymentMethodId: id,
        locale: row.locale,
        name: row.text,
      })),
    });
    await revalidateAdminCatalogs();
    return { ok: true, id };
  }
  if (kind === "provider") {
    const existing = await prisma.gameProvider.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "missing" };
    await prisma.gameProvider.update({ where: { id }, data: { sortOrder } });
    await prisma.gameProviderTranslation.deleteMany({
      where: { gameProviderId: id },
    });
    await prisma.gameProviderTranslation.createMany({
      data: localeTexts(names).map((row) => ({
        gameProviderId: id,
        locale: row.locale,
        name: row.text,
      })),
    });
    await revalidateAdminCatalogs();
    return { ok: true, id };
  }
  const existing = await prisma.bonusType.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "missing" };
  await prisma.bonusType.update({ where: { id }, data: { sortOrder } });
  await prisma.bonusTypeTranslation.deleteMany({ where: { bonusTypeId: id } });
  await prisma.bonusTypeTranslation.createMany({
    data: localeTexts(names).map((row) => ({
      bonusTypeId: id,
      locale: row.locale,
      name: row.text,
    })),
  });
  await revalidateAdminCatalogs();
  return { ok: true, id };
}

export async function deleteCatalogItem(
  kind: CatalogKind,
  id: string,
  confirmPayout = false,
): Promise<CatalogActionResult> {
  await requireAdmin();
  const item = await catalogUsage(kind, id);
  if (!item) return { ok: false, error: "missing" };

  if ((item.usageCount ?? 0) > 0) {
    if (kind === "payout" && confirmPayout) {
      await prisma.payoutSpeedOption.delete({ where: { id } });
      await revalidateAdminCatalogs();
      return { ok: true, id };
    }
    return {
      ok: false,
      error: kind === "payout" ? "payoutInUse" : "inUse",
      usageNames: item.usageNames,
    };
  }

  if (kind === "payout") await prisma.payoutSpeedOption.delete({ where: { id } });
  else if (kind === "license") await prisma.license.delete({ where: { id } });
  else if (kind === "payment") await prisma.paymentMethod.delete({ where: { id } });
  else if (kind === "provider") await prisma.gameProvider.delete({ where: { id } });
  else await prisma.bonusType.delete({ where: { id } });

  await revalidateAdminCatalogs();
  return { ok: true, id };
}

export type AdminMarketRow = {
  id: string;
  code: string;
  names: CatalogNames;
};

export async function searchAdminMarkets(query: string): Promise<AdminMarketRow[]> {
  await requireAdmin();
  const q = query.trim();
  if (q.length < 2) return [];

  const isIsoCode = /^[a-zA-Z]{2}$/.test(q);
  const rows = await prisma.market.findMany({
    where: isIsoCode
      ? {
          OR: [
            { code: { equals: q.toUpperCase() } },
            {
              translations: {
                some: { name: { startsWith: q, mode: "insensitive" } },
              },
            },
          ],
        }
      : {
          OR: [
            { code: { contains: q.toUpperCase(), mode: "insensitive" } },
            {
              translations: {
                some: { name: { contains: q, mode: "insensitive" } },
              },
            },
          ],
        },
    take: 20,
    orderBy: { code: "asc" },
    include: { translations: true },
  });

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    names: pickNames(row.translations),
  }));
}

export async function updateMarketNames(
  id: string,
  names: CatalogNames,
): Promise<CatalogActionResult> {
  await requireAdmin();
  if (!names.en.trim()) return { ok: false, error: "englishRequired" };

  const existing = await prisma.market.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "missing" };

  await prisma.marketTranslation.deleteMany({ where: { marketId: id } });
  await prisma.marketTranslation.createMany({
    data: localeTexts(names).map((row) => ({
      marketId: id,
      locale: row.locale,
      name: row.text,
    })),
  });
  await revalidateAdminCatalogs();
  return { ok: true, id };
}
