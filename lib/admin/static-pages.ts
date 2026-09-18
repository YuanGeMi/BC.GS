"use server";

import { revalidatePath } from "next/cache";

import { isContentStatus } from "@/lib/admin/casino-input";
import {
  englishPageReady,
  parseHttpsUrl,
  parseStaticPageSaveInput,
  type StaticPageInputError,
  type StaticPageSaveInput,
} from "@/lib/admin/static-page-input";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ContentStatus } from "@/lib/db-enums";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { revalidateSiteSettings, revalidateStaticPage } from "@/lib/revalidate";
import { SITE_SETTING_KEYS } from "@/lib/site";
import {
  LEGAL_PAGE_LABELS,
  LEGAL_PAGE_SLUGS,
  isLegalPageSlug,
  type StaticPageSlug,
} from "@/lib/static-pages";

export type AdminStaticPageListRow = {
  slug: StaticPageSlug;
  title: string;
  status: ContentStatus | "missing";
  updatedAt: string | null;
};

export type AdminStaticPageEditorData = {
  slug: StaticPageSlug;
  status: ContentStatus;
  exists: boolean;
  translations: StaticPageSaveInput["translations"];
};

export type StaticPageActionResult =
  | { ok: true; slug: StaticPageSlug }
  | { ok: false; error: StaticPageInputError };

export type SiteSettings = {
  telegramChannelUrl: string;
};

function revalidateAdminPagePaths(slug?: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/pages`);
    if (slug) revalidatePath(`/${locale}/admin/pages/${slug}`);
  }
}

export async function listAdminStaticPages(): Promise<AdminStaticPageListRow[]> {
  await requireAdmin();

  const rows = await prisma.staticPage.findMany({
    where: { slug: { in: [...LEGAL_PAGE_SLUGS] } },
    select: {
      slug: true,
      status: true,
      updatedAt: true,
      translations: {
        where: { locale: "en" },
        select: { title: true },
        take: 1,
      },
    },
  });
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  return LEGAL_PAGE_SLUGS.map((slug) => {
    const row = bySlug.get(slug);
    return {
      slug,
      title: row?.translations[0]?.title || LEGAL_PAGE_LABELS[slug],
      status: row ? row.status : "missing",
      updatedAt: row ? row.updatedAt.toISOString() : null,
    };
  });
}

export async function getAdminStaticPage(
  slug: string,
): Promise<AdminStaticPageEditorData | null> {
  await requireAdmin();
  if (!isLegalPageSlug(slug)) return null;

  const row = await prisma.staticPage.findUnique({
    where: { slug },
    include: { translations: true },
  });

  const translations = {
    en: { title: "", content: "", seoTitle: "", seoDescription: "" },
    zh: { title: "", content: "", seoTitle: "", seoDescription: "" },
    th: { title: "", content: "", seoTitle: "", seoDescription: "" },
  } satisfies StaticPageSaveInput["translations"];

  if (row) {
    for (const item of row.translations) {
      if (item.locale !== "en" && item.locale !== "zh" && item.locale !== "th") {
        continue;
      }
      translations[item.locale] = {
        title: item.title,
        content: item.content,
        seoTitle: item.seoTitle ?? "",
        seoDescription: item.seoDescription ?? "",
      };
    }
  }

  return {
    slug,
    status: row?.status ?? ContentStatus.draft,
    exists: Boolean(row),
    translations,
  };
}

export async function updateStaticPage(
  slug: string,
  input: StaticPageSaveInput,
): Promise<StaticPageActionResult> {
  const admin = await requireAdmin();
  if (!isLegalPageSlug(slug)) return { ok: false, error: "invalidSlug" };

  const parsed = parseStaticPageSaveInput(input);
  if (!parsed.ok) return parsed;

  const existing = await prisma.staticPage.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });

  const page = existing
    ? await prisma.staticPage.update({
        where: { slug },
        data: { updatedById: admin.id },
        select: { id: true, status: true },
      })
    : await prisma.staticPage.create({
        data: {
          slug,
          status: ContentStatus.draft,
          createdById: admin.id,
          updatedById: admin.id,
        },
        select: { id: true, status: true },
      });

  await prisma.staticPageTranslation.deleteMany({ where: { pageId: page.id } });
  if (parsed.value.translations.length) {
    await prisma.staticPageTranslation.createMany({
      data: parsed.value.translations.map((row) => ({
        pageId: page.id,
        locale: row.locale,
        title: row.title,
        content: row.content,
        seoTitle: row.seoTitle,
        seoDescription: row.seoDescription,
      })),
    });
  }

  revalidateAdminPagePaths(slug);
  if (page.status === ContentStatus.published) {
    revalidateStaticPage(slug);
  }

  return { ok: true, slug };
}

export async function setStaticPageStatus(
  slug: string,
  status: ContentStatus,
): Promise<StaticPageActionResult> {
  const admin = await requireAdmin();
  if (!isLegalPageSlug(slug)) return { ok: false, error: "invalidSlug" };
  if (!isContentStatus(status)) return { ok: false, error: "invalidStatus" };

  const existing = await prisma.staticPage.findUnique({
    where: { slug },
    include: { translations: { where: { locale: "en" } } },
  });
  if (!existing) return { ok: false, error: "missing" };

  if (status === ContentStatus.published) {
    const en = existing.translations[0];
    if (!en?.title.trim() || !en.content.trim()) {
      return { ok: false, error: "englishRequired" };
    }
  }

  await prisma.staticPage.update({
    where: { slug },
    data: { status, updatedById: admin.id },
  });

  revalidateAdminPagePaths(slug);
  revalidateStaticPage(slug);
  return { ok: true, slug };
}

export async function saveAndPublishStaticPage(
  slug: string,
  input: StaticPageSaveInput,
): Promise<StaticPageActionResult> {
  if (!englishPageReady(input)) return { ok: false, error: "englishRequired" };
  const saved = await updateStaticPage(slug, input);
  if (!saved.ok) return saved;
  return setStaticPageStatus(slug, ContentStatus.published);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  await requireAdmin();
  const row = await prisma.siteSetting.findUnique({
    where: { key: SITE_SETTING_KEYS.telegramChannelUrl },
  });
  return { telegramChannelUrl: row?.value ?? "" };
}

export async function updateSiteSettings(
  telegramChannelUrl: string,
): Promise<{ ok: true } | { ok: false; error: StaticPageInputError }> {
  await requireAdmin();
  const parsed = parseHttpsUrl(telegramChannelUrl);
  if (!parsed.ok) return parsed;

  await prisma.siteSetting.upsert({
    where: { key: SITE_SETTING_KEYS.telegramChannelUrl },
    create: {
      key: SITE_SETTING_KEYS.telegramChannelUrl,
      value: parsed.value,
    },
    update: { value: parsed.value },
  });

  revalidateAdminPagePaths();
  revalidateSiteSettings();
  return { ok: true };
}
