"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  englishNameReady,
  parseCategorySaveInput,
  type CategoryInputError,
  type CategorySaveInput,
} from "@/lib/admin/category-input";
import { isContentStatus } from "@/lib/admin/casino-input";
import { adminPerfStart } from "@/lib/admin/perf-log";
import { requireAdmin, requireVerifiedAdmin } from "@/lib/auth/require-admin";
import { ContentStatus } from "@/lib/db-enums";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { revalidateBestOfSurfaces } from "@/lib/revalidate";

export type AdminCategoryListRow = {
  id: string;
  name: string;
  slug: string;
  status: ContentStatus;
  casinoCount: number;
};

export type AdminCategoryCasinoOption = {
  id: string;
  slug: string;
  label: string;
  status: ContentStatus;
};

export type AdminCategoryEditorData = {
  id: string;
  slug: string;
  status: ContentStatus;
  translations: CategorySaveInput["translations"];
  casinos: CategorySaveInput["casinos"];
};

export type CategoryActionResult =
  | { ok: true; id: string }
  | { ok: false; error: CategoryInputError };

function enName(
  translations: { name?: string }[],
  fallback: string,
) {
  return translations[0]?.name ?? fallback;
}

function revalidateAdminCategoryPaths(id?: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/categories`);
    revalidatePath(`/${locale}/admin/categories/new`);
    if (id) revalidatePath(`/${locale}/admin/categories/${id}`);
  }
}

async function allCategorySlugs() {
  const rows = await prisma.category.findMany({ select: { slug: true } });
  return rows.map((row) => row.slug);
}

async function maybeRevalidatePublic(args: {
  wasPublished: boolean;
  isPublished: boolean;
  slugs: string[];
}) {
  if (!args.wasPublished && !args.isPublished) return;
  const related = args.isPublished || args.wasPublished ? await allCategorySlugs() : [];
  revalidateBestOfSurfaces([...args.slugs, ...related]);
}

export async function listAdminCategories(): Promise<AdminCategoryListRow[]> {
  const perf = adminPerfStart("listAdminCategories");
  await requireAdmin();
  perf.mark("requireAdmin");

  const rows = await prisma.category.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      status: true,
      translations: {
        where: { locale: "en" },
        select: { name: true },
        take: 1,
      },
      _count: { select: { casinos: true } },
    },
  });
  perf.end(`rows=${rows.length}`);

  return rows.map((row) => ({
    id: row.id,
    name: enName(row.translations, row.slug),
    slug: row.slug,
    status: row.status,
    casinoCount: row._count.casinos,
  }));
}

export async function listAdminCategoryCasinos(): Promise<
  AdminCategoryCasinoOption[]
> {
  await requireAdmin();

  const rows = await prisma.casino.findMany({
    orderBy: { slug: "asc" },
    select: {
      id: true,
      slug: true,
      status: true,
      translations: {
        where: { locale: "en" },
        select: { name: true },
        take: 1,
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    label: enName(row.translations, row.slug),
    status: row.status,
  }));
}

export async function getAdminCategory(
  id: string,
): Promise<AdminCategoryEditorData | null> {
  await requireAdmin();

  const row = await prisma.category.findUnique({
    where: { id },
    include: {
      translations: true,
      casinos: {
        include: { notes: true },
        orderBy: [
          { rank: { sort: "asc", nulls: "last" } },
          { casino: { slug: "asc" } },
        ],
      },
    },
  });
  if (!row) return null;

  const translations = {
    en: {
      name: "",
      description: "",
      seoTitle: "",
      seoDescription: "",
      methodology: "",
    },
    zh: {
      name: "",
      description: "",
      seoTitle: "",
      seoDescription: "",
      methodology: "",
    },
    th: {
      name: "",
      description: "",
      seoTitle: "",
      seoDescription: "",
      methodology: "",
    },
  } satisfies CategorySaveInput["translations"];

  for (const item of row.translations) {
    if (item.locale !== "en" && item.locale !== "zh" && item.locale !== "th") {
      continue;
    }
    translations[item.locale] = {
      name: item.name,
      description: item.description ?? "",
      seoTitle: item.seoTitle ?? "",
      seoDescription: item.seoDescription ?? "",
      methodology: item.methodology ?? "",
    };
  }

  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    translations,
    casinos: row.casinos.map((item) => ({
      casinoId: item.casinoId,
      rank: item.rank == null ? "" : String(item.rank),
      notes: {
        en: item.notes.find((note) => note.locale === "en")?.editorialNote ?? "",
        zh: item.notes.find((note) => note.locale === "zh")?.editorialNote ?? "",
        th: item.notes.find((note) => note.locale === "th")?.editorialNote ?? "",
      },
    })),
  };
}

export async function createCategory(
  input: CategorySaveInput,
): Promise<CategoryActionResult> {
  const admin = await requireAdmin();
  const parsed = parseCategorySaveInput(input);
  if (!parsed.ok) return parsed;

  const casinoIds = parsed.value.casinos.map((row) => row.casinoId);
  if (casinoIds.length) {
    const count = await prisma.casino.count({
      where: { id: { in: casinoIds } },
    });
    if (count !== casinoIds.length) return { ok: false, error: "invalidCasino" };
  }

  try {
    const created = await prisma.category.create({
      data: {
        slug: parsed.value.slug,
        status: ContentStatus.draft,
        createdById: admin.id,
        updatedById: admin.id,
        translations: {
          create: parsed.value.translations.map((row) => ({
            locale: row.locale,
            name: row.name,
            description: row.description,
            seoTitle: row.seoTitle,
            seoDescription: row.seoDescription,
            methodology: row.methodology,
          })),
        },
        casinos: {
          create: parsed.value.casinos.map((row) => ({
            casinoId: row.casinoId,
            rank: row.rank,
            notes: {
              create: row.notes.map((note) => ({
                casinoId: row.casinoId,
                locale: note.locale,
                editorialNote: note.editorialNote,
              })),
            },
          })),
        },
      },
      select: { id: true },
    });

    revalidateAdminCategoryPaths(created.id);
    return { ok: true, id: created.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "duplicateSlug" };
    }
    throw error;
  }
}

export async function updateCategory(
  id: string,
  input: CategorySaveInput,
): Promise<CategoryActionResult> {
  const admin = await requireAdmin();
  const parsed = parseCategorySaveInput(input);
  if (!parsed.ok) return parsed;

  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true, slug: true, status: true },
  });
  if (!existing) return { ok: false, error: "missing" };

  const casinoIds = parsed.value.casinos.map((row) => row.casinoId);
  if (casinoIds.length) {
    const count = await prisma.casino.count({
      where: { id: { in: casinoIds } },
    });
    if (count !== casinoIds.length) return { ok: false, error: "invalidCasino" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.category.update({
        where: { id },
        data: {
          slug: parsed.value.slug,
          updatedById: admin.id,
        },
      });

      await tx.categoryTranslation.deleteMany({ where: { categoryId: id } });
      if (parsed.value.translations.length) {
        await tx.categoryTranslation.createMany({
          data: parsed.value.translations.map((row) => ({
            categoryId: id,
            locale: row.locale,
            name: row.name,
            description: row.description,
            seoTitle: row.seoTitle,
            seoDescription: row.seoDescription,
            methodology: row.methodology,
          })),
        });
      }

      await tx.casinoCategory.deleteMany({ where: { categoryId: id } });
      for (const row of parsed.value.casinos) {
        await tx.casinoCategory.create({
          data: {
            categoryId: id,
            casinoId: row.casinoId,
            rank: row.rank,
            notes: {
              create: row.notes.map((note) => ({
                casinoId: row.casinoId,
                categoryId: id,
                locale: note.locale,
                editorialNote: note.editorialNote,
              })),
            },
          },
        });
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "duplicateSlug" };
    }
    throw error;
  }

  revalidateAdminCategoryPaths(id);
  await maybeRevalidatePublic({
    wasPublished: existing.status === ContentStatus.published,
    isPublished: existing.status === ContentStatus.published,
    slugs: [existing.slug, parsed.value.slug],
  });

  return { ok: true, id };
}

export async function setCategoryStatus(
  id: string,
  status: ContentStatus,
): Promise<CategoryActionResult> {
  const admin = await requireAdmin();
  if (!isContentStatus(status)) return { ok: false, error: "invalidStatus" };

  const existing = await prisma.category.findUnique({
    where: { id },
    include: { translations: { where: { locale: "en" } } },
  });
  if (!existing) return { ok: false, error: "missing" };

  if (status === ContentStatus.published && !existing.translations[0]?.name.trim()) {
    return { ok: false, error: "englishRequired" };
  }

  await prisma.category.update({
    where: { id },
    data: { status, updatedById: admin.id },
  });

  revalidateAdminCategoryPaths(id);
  await maybeRevalidatePublic({
    wasPublished: existing.status === ContentStatus.published,
    isPublished: status === ContentStatus.published,
    slugs: [existing.slug],
  });

  return { ok: true, id };
}

export async function deleteCategory(id: string): Promise<CategoryActionResult> {
  await requireVerifiedAdmin();

  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true, slug: true, status: true },
  });
  if (!existing) return { ok: false, error: "missing" };

  await prisma.category.delete({ where: { id } });

  revalidateAdminCategoryPaths();
  await maybeRevalidatePublic({
    wasPublished: existing.status === ContentStatus.published,
    isPublished: false,
    slugs: [existing.slug],
  });

  return { ok: true, id };
}

export async function saveAndPublishCategory(
  id: string,
  input: CategorySaveInput,
): Promise<CategoryActionResult> {
  if (!englishNameReady(input)) return { ok: false, error: "englishRequired" };
  const saved = await updateCategory(id, input);
  if (!saved.ok) return saved;
  return setCategoryStatus(id, ContentStatus.published);
}
