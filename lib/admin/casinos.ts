"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  englishReady,
  isContentStatus,
  parseCasinoSaveInput,
  type CasinoInputError,
  type CasinoSaveInput,
  type ParsedCasinoSave,
} from "@/lib/admin/casino-input";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ContentStatus } from "@/lib/db-enums";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { revalidateCasinoPublicSurfaces } from "@/lib/revalidate";

export type AdminCasinoListRow = {
  id: string;
  slug: string;
  name: string;
  status: ContentStatus;
  overallRating: number | null;
  updatedAt: string;
};

export type AdminCatalogOption = {
  id: string;
  label: string;
};

export type AdminMarketOption = {
  id: string;
  code: string;
  name: string;
};

export type AdminCasinoEditorData = {
  id: string;
  slug: string;
  status: ContentStatus;
  logoUrl: string;
  establishedYear: string;
  minDeposit: string;
  payoutSpeedId: string;
  overallRating: string;
  ratingBonuses: string;
  ratingGames: string;
  ratingSupport: string;
  ratingPayout: string;
  ratingTrust: string;
  affiliateLink: string;
  translations: CasinoSaveInput["translations"];
  licenses: CasinoSaveInput["licenses"];
  paymentMethodIds: string[];
  gameProviderIds: string[];
  markets: CasinoSaveInput["markets"];
};

export type AdminCasinoCatalogs = {
  licenses: AdminCatalogOption[];
  payments: AdminCatalogOption[];
  providers: AdminCatalogOption[];
  payoutSpeeds: AdminCatalogOption[];
  markets: AdminMarketOption[];
};

export type CasinoActionResult =
  | { ok: true; id: string }
  | { ok: false; error: CasinoInputError };

function enLabel(
  translations: { locale: string; name?: string; label?: string }[],
  fallback: string,
) {
  const row = translations.find((item) => item.locale === "en");
  return row?.name ?? row?.label ?? fallback;
}

function numString(value: number | null | undefined) {
  return value == null ? "" : String(value);
}

function revalidateAdminCasinoPaths(id?: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/casinos`);
    revalidatePath(`/${locale}/admin/casinos/new`);
    if (id) revalidatePath(`/${locale}/admin/casinos/${id}`);
  }
}

function maybeRevalidatePublic(args: {
  wasPublished: boolean;
  isPublished: boolean;
  slugs: string[];
}) {
  if (!args.wasPublished && !args.isPublished) return;
  revalidateCasinoPublicSurfaces(args.slugs);
}

async function assertCatalogs(value: ParsedCasinoSave) {
  const licenseIds = value.licenses.map((row) => row.licenseId);
  const marketIds = value.markets.map((row) => row.marketId);

  const [licenses, payments, providers, payout, markets] = await Promise.all([
    licenseIds.length
      ? prisma.license.count({ where: { id: { in: licenseIds } } })
      : Promise.resolve(0),
    value.paymentMethodIds.length
      ? prisma.paymentMethod.count({ where: { id: { in: value.paymentMethodIds } } })
      : Promise.resolve(0),
    value.gameProviderIds.length
      ? prisma.gameProvider.count({ where: { id: { in: value.gameProviderIds } } })
      : Promise.resolve(0),
    value.payoutSpeedId
      ? prisma.payoutSpeedOption.count({ where: { id: value.payoutSpeedId } })
      : Promise.resolve(1),
    marketIds.length
      ? prisma.market.count({ where: { id: { in: marketIds } } })
      : Promise.resolve(0),
  ]);

  if (
    licenses !== licenseIds.length ||
    payments !== value.paymentMethodIds.length ||
    providers !== value.gameProviderIds.length ||
    payout !== 1 ||
    markets !== marketIds.length
  ) {
    return false;
  }
  return true;
}

function factsData(value: ParsedCasinoSave) {
  return {
    slug: value.slug,
    logoUrl: value.logoUrl,
    establishedYear: value.establishedYear,
    minDeposit: value.minDeposit,
    payoutSpeedId: value.payoutSpeedId,
    overallRating: value.overallRating,
    ratingBonuses: value.ratingBonuses,
    ratingGames: value.ratingGames,
    ratingSupport: value.ratingSupport,
    ratingPayout: value.ratingPayout,
    ratingTrust: value.ratingTrust,
    affiliateLink: value.affiliateLink,
  };
}

export async function listAdminCasinos(filters: {
  q?: string;
  status?: string;
}): Promise<AdminCasinoListRow[]> {
  await requireAdmin();

  const q = filters.q?.trim() ?? "";
  const status =
    filters.status && isContentStatus(filters.status) ? filters.status : undefined;

  const rows = await prisma.casino.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { slug: { contains: q, mode: "insensitive" } },
              {
                translations: {
                  some: {
                    locale: "en",
                    name: { contains: q, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      status: true,
      overallRating: true,
      updatedAt: true,
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
    name: row.translations[0]?.name || row.slug,
    status: row.status,
    overallRating: row.overallRating,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getAdminCasinoCatalogs(): Promise<AdminCasinoCatalogs> {
  await requireAdmin();

  const [licenses, payments, providers, payoutSpeeds, markets] = await Promise.all([
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
    prisma.payoutSpeedOption.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: true },
    }),
    prisma.market.findMany({
      orderBy: { code: "asc" },
      include: { translations: { where: { locale: "en" } } },
    }),
  ]);

  return {
    licenses: licenses.map((row) => ({
      id: row.id,
      label: enLabel(row.translations, row.slug),
    })),
    payments: payments.map((row) => ({
      id: row.id,
      label: enLabel(row.translations, row.slug),
    })),
    providers: providers.map((row) => ({
      id: row.id,
      label: enLabel(row.translations, row.slug),
    })),
    payoutSpeeds: payoutSpeeds.map((row) => ({
      id: row.id,
      label: enLabel(row.translations, row.slug),
    })),
    markets: markets.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.translations[0]?.name || row.code,
    })),
  };
}

export async function getAdminCasino(
  id: string,
): Promise<AdminCasinoEditorData | null> {
  await requireAdmin();

  const row = await prisma.casino.findUnique({
    where: { id },
    include: {
      translations: true,
      licenses: true,
      paymentMethods: true,
      gameProviders: true,
      markets: true,
    },
  });

  if (!row) return null;

  const translations = {
    en: {
      name: "",
      reviewBody: "",
      pros: "",
      cons: "",
      seoTitle: "",
      seoDescription: "",
    },
    zh: {
      name: "",
      reviewBody: "",
      pros: "",
      cons: "",
      seoTitle: "",
      seoDescription: "",
    },
    th: {
      name: "",
      reviewBody: "",
      pros: "",
      cons: "",
      seoTitle: "",
      seoDescription: "",
    },
  } satisfies CasinoSaveInput["translations"];

  for (const item of row.translations) {
    if (item.locale !== "en" && item.locale !== "zh" && item.locale !== "th") {
      continue;
    }
    translations[item.locale] = {
      name: item.name,
      reviewBody: item.reviewBody,
      pros: item.pros.join("\n"),
      cons: item.cons.join("\n"),
      seoTitle: item.seoTitle ?? "",
      seoDescription: item.seoDescription ?? "",
    };
  }

  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    logoUrl: row.logoUrl ?? "",
    establishedYear: numString(row.establishedYear),
    minDeposit: numString(row.minDeposit),
    payoutSpeedId: row.payoutSpeedId ?? "",
    overallRating: numString(row.overallRating),
    ratingBonuses: numString(row.ratingBonuses),
    ratingGames: numString(row.ratingGames),
    ratingSupport: numString(row.ratingSupport),
    ratingPayout: numString(row.ratingPayout),
    ratingTrust: numString(row.ratingTrust),
    affiliateLink: row.affiliateLink ?? "",
    translations,
    licenses: row.licenses.map((item) => ({
      licenseId: item.licenseId,
      licenseNumber: item.licenseNumber ?? "",
      verified: item.verified,
      verificationUrl: item.verificationUrl ?? "",
    })),
    paymentMethodIds: row.paymentMethods.map((item) => item.paymentMethodId),
    gameProviderIds: row.gameProviders.map((item) => item.gameProviderId),
    markets: row.markets.map((item) => ({
      marketId: item.marketId,
      status: item.status,
      affiliateLink: item.affiliateLink ?? "",
    })),
  };
}

export async function createCasino(
  input: CasinoSaveInput,
): Promise<CasinoActionResult> {
  const admin = await requireAdmin();
  const parsed = parseCasinoSaveInput(input);
  if (!parsed.ok) return parsed;

  if (!(await assertCatalogs(parsed.value))) {
    return { ok: false, error: "invalidCatalog" };
  }

  const value = parsed.value;

  try {
    const created = await prisma.casino.create({
      data: {
        ...factsData(value),
        status: ContentStatus.draft,
        createdById: admin.id,
        updatedById: admin.id,
        translations: {
          create: value.translations.map((row) => ({
            locale: row.locale,
            name: row.name,
            reviewBody: row.reviewBody,
            pros: row.pros,
            cons: row.cons,
            seoTitle: row.seoTitle,
            seoDescription: row.seoDescription,
          })),
        },
        licenses: {
          create: value.licenses.map((row) => ({
            licenseId: row.licenseId,
            licenseNumber: row.licenseNumber,
            verified: row.verified,
            verificationUrl: row.verificationUrl,
          })),
        },
        paymentMethods: {
          create: value.paymentMethodIds.map((paymentMethodId) => ({
            paymentMethodId,
          })),
        },
        gameProviders: {
          create: value.gameProviderIds.map((gameProviderId) => ({
            gameProviderId,
          })),
        },
        markets: {
          create: value.markets.map((row) => ({
            marketId: row.marketId,
            status: row.status,
            affiliateLink: row.affiliateLink,
          })),
        },
      },
      select: { id: true },
    });

    revalidateAdminCasinoPaths(created.id);
    return { ok: true, id: created.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "duplicateSlug" };
    }
    throw error;
  }
}

export async function updateCasino(
  id: string,
  input: CasinoSaveInput,
): Promise<CasinoActionResult> {
  const admin = await requireAdmin();
  const parsed = parseCasinoSaveInput(input);
  if (!parsed.ok) return parsed;

  if (!(await assertCatalogs(parsed.value))) {
    return { ok: false, error: "invalidCatalog" };
  }

  const existing = await prisma.casino.findUnique({
    where: { id },
    select: { id: true, slug: true, status: true },
  });
  if (!existing) return { ok: false, error: "missing" };

  const value = parsed.value;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.casino.update({
        where: { id },
        data: {
          ...factsData(value),
          updatedById: admin.id,
        },
      });

      await tx.casinoTranslation.deleteMany({ where: { casinoId: id } });
      if (value.translations.length) {
        await tx.casinoTranslation.createMany({
          data: value.translations.map((row) => ({
            casinoId: id,
            locale: row.locale,
            name: row.name,
            reviewBody: row.reviewBody,
            pros: row.pros,
            cons: row.cons,
            seoTitle: row.seoTitle,
            seoDescription: row.seoDescription,
          })),
        });
      }

      await tx.casinoLicense.deleteMany({ where: { casinoId: id } });
      if (value.licenses.length) {
        await tx.casinoLicense.createMany({
          data: value.licenses.map((row) => ({
            casinoId: id,
            licenseId: row.licenseId,
            licenseNumber: row.licenseNumber,
            verified: row.verified,
            verificationUrl: row.verificationUrl,
          })),
        });
      }

      await tx.casinoPaymentMethod.deleteMany({ where: { casinoId: id } });
      if (value.paymentMethodIds.length) {
        await tx.casinoPaymentMethod.createMany({
          data: value.paymentMethodIds.map((paymentMethodId) => ({
            casinoId: id,
            paymentMethodId,
          })),
        });
      }

      await tx.casinoGameProvider.deleteMany({ where: { casinoId: id } });
      if (value.gameProviderIds.length) {
        await tx.casinoGameProvider.createMany({
          data: value.gameProviderIds.map((gameProviderId) => ({
            casinoId: id,
            gameProviderId,
          })),
        });
      }

      await tx.casinoMarket.deleteMany({ where: { casinoId: id } });
      if (value.markets.length) {
        await tx.casinoMarket.createMany({
          data: value.markets.map((row) => ({
            casinoId: id,
            marketId: row.marketId,
            status: row.status,
            affiliateLink: row.affiliateLink,
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

  revalidateAdminCasinoPaths(id);
  maybeRevalidatePublic({
    wasPublished: existing.status === ContentStatus.published,
    isPublished: existing.status === ContentStatus.published,
    slugs: [existing.slug, value.slug],
  });

  return { ok: true, id };
}

export async function setCasinoStatus(
  id: string,
  status: ContentStatus,
): Promise<CasinoActionResult> {
  const admin = await requireAdmin();
  if (!isContentStatus(status)) return { ok: false, error: "invalidStatus" };

  const existing = await prisma.casino.findUnique({
    where: { id },
    include: { translations: { where: { locale: "en" } } },
  });
  if (!existing) return { ok: false, error: "missing" };

  if (status === ContentStatus.published) {
    const en = existing.translations[0];
    if (!en?.name.trim() || !en.reviewBody.trim()) {
      return { ok: false, error: "englishRequired" };
    }
  }

  await prisma.casino.update({
    where: { id },
    data: { status, updatedById: admin.id },
  });

  revalidateAdminCasinoPaths(id);
  maybeRevalidatePublic({
    wasPublished: existing.status === ContentStatus.published,
    isPublished: status === ContentStatus.published,
    slugs: [existing.slug],
  });

  return { ok: true, id };
}

export async function deleteCasino(id: string): Promise<CasinoActionResult> {
  await requireAdmin();

  const existing = await prisma.casino.findUnique({
    where: { id },
    select: { id: true, slug: true, status: true },
  });
  if (!existing) return { ok: false, error: "missing" };

  await prisma.casino.delete({ where: { id } });

  revalidateAdminCasinoPaths();
  maybeRevalidatePublic({
    wasPublished: existing.status === ContentStatus.published,
    isPublished: false,
    slugs: [existing.slug],
  });

  return { ok: true, id };
}

export async function saveAndPublishCasino(
  id: string,
  input: CasinoSaveInput,
): Promise<CasinoActionResult> {
  if (!englishReady(input)) return { ok: false, error: "englishRequired" };
  const saved = await updateCasino(id, input);
  if (!saved.ok) return saved;
  return setCasinoStatus(id, ContentStatus.published);
}
