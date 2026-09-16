"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  englishTitleReady,
  isContentStatus,
  parseBonusSaveInput,
  type BonusInputError,
  type BonusSaveInput,
} from "@/lib/admin/bonus-input";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ContentStatus } from "@/lib/db-enums";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { revalidateBonusSurfaces } from "@/lib/revalidate";

export type AdminBonusListRow = {
  id: string;
  title: string;
  casinoName: string;
  typeName: string;
  status: ContentStatus;
  expiryDate: string | null;
  sortOrder: number;
};

export type AdminBonusOption = {
  id: string;
  slug: string;
  label: string;
  status?: ContentStatus;
};

export type AdminBonusEditorData = {
  id: string;
  status: ContentStatus;
  casinoId: string;
  casinoStatus: ContentStatus;
  typeId: string;
  slug: string;
  sortOrder: string;
  amount: string;
  wageringRequirement: string;
  minDeposit: string;
  code: string;
  expiryDate: string;
  translations: BonusSaveInput["translations"];
};

export type AdminBonusCatalogs = {
  casinos: AdminBonusOption[];
  types: AdminBonusOption[];
};

export type BonusActionResult =
  | { ok: true; id: string }
  | { ok: false; error: BonusInputError };

function enName(
  translations: { locale: string; name?: string; title?: string }[],
  fallback: string,
) {
  const row = translations.find((item) => item.locale === "en");
  return row?.name ?? row?.title ?? fallback;
}

function dateInputValue(value: Date | null) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

function revalidateAdminBonusPaths(id?: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/bonuses`);
    revalidatePath(`/${locale}/admin/bonuses/new`);
    if (id) revalidatePath(`/${locale}/admin/bonuses/${id}`);
  }
}

function maybeRevalidatePublic(args: {
  wasPublished: boolean;
  isPublished: boolean;
  casinoSlugs: string[];
}) {
  if (!args.wasPublished && !args.isPublished) return;
  revalidateBonusSurfaces(args.casinoSlugs);
}

export async function getAdminBonusCatalogs(): Promise<AdminBonusCatalogs> {
  await requireAdmin();

  const [casinos, types] = await Promise.all([
    prisma.casino.findMany({
      orderBy: { slug: "asc" },
      include: { translations: { where: { locale: "en" } } },
    }),
    prisma.bonusType.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: { where: { locale: "en" } } },
    }),
  ]);

  return {
    casinos: casinos.map((row) => ({
      id: row.id,
      slug: row.slug,
      label: enName(row.translations, row.slug),
      status: row.status,
    })),
    types: types.map((row) => ({
      id: row.id,
      slug: row.slug,
      label: enName(row.translations, row.slug),
    })),
  };
}

export async function listAdminBonuses(filters: {
  casinoId?: string;
  typeId?: string;
  status?: string;
}): Promise<AdminBonusListRow[]> {
  await requireAdmin();

  const status =
    filters.status && isContentStatus(filters.status) ? filters.status : undefined;

  const rows = await prisma.bonus.findMany({
    where: {
      ...(filters.casinoId ? { casinoId: filters.casinoId } : {}),
      ...(filters.typeId ? { typeId: filters.typeId } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      translations: { where: { locale: "en" } },
      casino: { include: { translations: { where: { locale: "en" } } } },
      bonusType: { include: { translations: { where: { locale: "en" } } } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    title: enName(row.translations, row.slug),
    casinoName: enName(row.casino.translations, row.casino.slug),
    typeName: enName(row.bonusType.translations, row.bonusType.slug),
    status: row.status,
    expiryDate: row.expiryDate ? row.expiryDate.toISOString() : null,
    sortOrder: row.sortOrder,
  }));
}

export async function getAdminBonus(
  id: string,
): Promise<AdminBonusEditorData | null> {
  await requireAdmin();

  const row = await prisma.bonus.findUnique({
    where: { id },
    include: {
      translations: true,
      casino: { select: { status: true } },
    },
  });
  if (!row) return null;

  const translations = {
    en: { title: "", terms: "" },
    zh: { title: "", terms: "" },
    th: { title: "", terms: "" },
  } satisfies BonusSaveInput["translations"];

  for (const item of row.translations) {
    if (item.locale !== "en" && item.locale !== "zh" && item.locale !== "th") {
      continue;
    }
    translations[item.locale] = {
      title: item.title,
      terms: item.terms,
    };
  }

  return {
    id: row.id,
    status: row.status,
    casinoId: row.casinoId,
    casinoStatus: row.casino.status,
    typeId: row.typeId,
    slug: row.slug,
    sortOrder: String(row.sortOrder),
    amount: row.amount ?? "",
    wageringRequirement: row.wageringRequirement ?? "",
    minDeposit: row.minDeposit == null ? "" : String(row.minDeposit),
    code: row.code ?? "",
    expiryDate: dateInputValue(row.expiryDate),
    translations,
  };
}

async function loadCasino(casinoId: string) {
  return prisma.casino.findUnique({
    where: { id: casinoId },
    select: { id: true, slug: true, status: true },
  });
}

export async function createBonus(
  input: BonusSaveInput,
): Promise<BonusActionResult> {
  const admin = await requireAdmin();
  const parsed = parseBonusSaveInput(input);
  if (!parsed.ok) return parsed;

  const [casino, type] = await Promise.all([
    loadCasino(parsed.value.casinoId),
    prisma.bonusType.findUnique({
      where: { id: parsed.value.typeId },
      select: { id: true },
    }),
  ]);
  if (!casino) return { ok: false, error: "casinoRequired" };
  if (!type) return { ok: false, error: "typeRequired" };

  try {
    const created = await prisma.bonus.create({
      data: {
        slug: parsed.value.slug,
        sortOrder: parsed.value.sortOrder,
        casinoId: parsed.value.casinoId,
        typeId: parsed.value.typeId,
        amount: parsed.value.amount,
        wageringRequirement: parsed.value.wageringRequirement,
        minDeposit: parsed.value.minDeposit,
        code: parsed.value.code,
        expiryDate: parsed.value.expiryDate,
        status: ContentStatus.draft,
        createdById: admin.id,
        updatedById: admin.id,
        translations: {
          create: parsed.value.translations.map((row) => ({
            locale: row.locale,
            title: row.title,
            terms: row.terms,
          })),
        },
      },
      select: { id: true },
    });

    revalidateAdminBonusPaths(created.id);
    return { ok: true, id: created.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "duplicateSlug" };
    }
    throw error;
  }
}

export async function updateBonus(
  id: string,
  input: BonusSaveInput,
): Promise<BonusActionResult> {
  const admin = await requireAdmin();
  const parsed = parseBonusSaveInput(input);
  if (!parsed.ok) return parsed;

  const existing = await prisma.bonus.findUnique({
    where: { id },
    include: { casino: { select: { slug: true, status: true } } },
  });
  if (!existing) return { ok: false, error: "missing" };

  const [casino, type] = await Promise.all([
    loadCasino(parsed.value.casinoId),
    prisma.bonusType.findUnique({
      where: { id: parsed.value.typeId },
      select: { id: true },
    }),
  ]);
  if (!casino) return { ok: false, error: "casinoRequired" };
  if (!type) return { ok: false, error: "typeRequired" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.bonus.update({
        where: { id },
        data: {
          slug: parsed.value.slug,
          sortOrder: parsed.value.sortOrder,
          casinoId: parsed.value.casinoId,
          typeId: parsed.value.typeId,
          amount: parsed.value.amount,
          wageringRequirement: parsed.value.wageringRequirement,
          minDeposit: parsed.value.minDeposit,
          code: parsed.value.code,
          expiryDate: parsed.value.expiryDate,
          updatedById: admin.id,
        },
      });

      await tx.bonusTranslation.deleteMany({ where: { bonusId: id } });
      if (parsed.value.translations.length) {
        await tx.bonusTranslation.createMany({
          data: parsed.value.translations.map((row) => ({
            bonusId: id,
            locale: row.locale,
            title: row.title,
            terms: row.terms,
          })),
        });
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "duplicateSlug" };
    }
    throw error;
  }

  revalidateAdminBonusPaths(id);
  maybeRevalidatePublic({
    wasPublished: existing.status === ContentStatus.published,
    isPublished: existing.status === ContentStatus.published,
    casinoSlugs: [existing.casino.slug, casino.slug],
  });

  return { ok: true, id };
}

export async function setBonusStatus(
  id: string,
  status: ContentStatus,
): Promise<BonusActionResult> {
  const admin = await requireAdmin();
  if (!isContentStatus(status)) return { ok: false, error: "invalidStatus" };

  const existing = await prisma.bonus.findUnique({
    where: { id },
    include: {
      translations: { where: { locale: "en" } },
      casino: { select: { slug: true, status: true } },
    },
  });
  if (!existing) return { ok: false, error: "missing" };

  if (status === ContentStatus.published) {
    if (existing.casino.status !== ContentStatus.published) {
      return { ok: false, error: "casinoDraft" };
    }
    if (!existing.translations[0]?.title.trim()) {
      return { ok: false, error: "englishRequired" };
    }
  }

  await prisma.bonus.update({
    where: { id },
    data: { status, updatedById: admin.id },
  });

  revalidateAdminBonusPaths(id);
  maybeRevalidatePublic({
    wasPublished: existing.status === ContentStatus.published,
    isPublished: status === ContentStatus.published,
    casinoSlugs: [existing.casino.slug],
  });

  return { ok: true, id };
}

export async function deleteBonus(id: string): Promise<BonusActionResult> {
  await requireAdmin();

  const existing = await prisma.bonus.findUnique({
    where: { id },
    include: { casino: { select: { slug: true } } },
  });
  if (!existing) return { ok: false, error: "missing" };

  await prisma.bonus.delete({ where: { id } });

  revalidateAdminBonusPaths();
  maybeRevalidatePublic({
    wasPublished: existing.status === ContentStatus.published,
    isPublished: false,
    casinoSlugs: [existing.casino.slug],
  });

  return { ok: true, id };
}

export async function saveAndPublishBonus(
  id: string,
  input: BonusSaveInput,
): Promise<BonusActionResult> {
  if (!englishTitleReady(input)) return { ok: false, error: "englishRequired" };
  const saved = await updateBonus(id, input);
  if (!saved.ok) return saved;
  return setBonusStatus(id, ContentStatus.published);
}
