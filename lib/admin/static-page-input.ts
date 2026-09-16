import { type Locale } from "@/i18n/routing";

import { CONTENT_LOCALES } from "@/lib/admin/casino-input";
import {
  isLegalPageSlug,
  type StaticPageSlug,
} from "@/lib/static-pages";

export type StaticPageTranslationDraft = {
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
};

export type StaticPageSaveInput = {
  translations: Record<Locale, StaticPageTranslationDraft>;
};

export type ParsedStaticPageSave = {
  translations: Array<{
    locale: Locale;
    title: string;
    content: string;
    seoTitle: string | null;
    seoDescription: string | null;
  }>;
};

export type StaticPageInputError =
  | "invalidSlug"
  | "englishRequired"
  | "missing"
  | "invalidStatus"
  | "invalidUrl";

export function emptyStaticPageTranslation(): StaticPageTranslationDraft {
  return {
    title: "",
    content: "",
    seoTitle: "",
    seoDescription: "",
  };
}

export function emptyStaticPageSaveInput(): StaticPageSaveInput {
  return {
    translations: {
      en: emptyStaticPageTranslation(),
      zh: emptyStaticPageTranslation(),
      th: emptyStaticPageTranslation(),
    },
  };
}

export function englishPageReady(input: StaticPageSaveInput) {
  return Boolean(
    input.translations.en.title.trim() && input.translations.en.content.trim(),
  );
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function parseStaticPageSaveInput(
  input: StaticPageSaveInput,
):
  | { ok: true; value: ParsedStaticPageSave }
  | { ok: false; error: StaticPageInputError } {
  const translations = CONTENT_LOCALES.flatMap((locale) => {
    const row = input.translations[locale];
    const title = row.title.trim();
    const content = row.content.trim();
    const seoTitle = optionalText(row.seoTitle);
    const seoDescription = optionalText(row.seoDescription);
    if (locale !== "en" && !title && !content && !seoTitle && !seoDescription) {
      return [];
    }
    return [{ locale, title, content, seoTitle, seoDescription }];
  });

  return { ok: true, value: { translations } };
}

export function parseHttpsUrl(
  value: string,
): { ok: true; value: string } | { ok: false; error: "invalidUrl" } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: "" };
  if (/^\s*javascript:/i.test(trimmed) || /^\s*data:/i.test(trimmed)) {
    return { ok: false, error: "invalidUrl" };
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return { ok: false, error: "invalidUrl" };
    return { ok: true, value: url.toString() };
  } catch {
    return { ok: false, error: "invalidUrl" };
  }
}

export function assertLegalSlug(slug: string): slug is StaticPageSlug {
  return isLegalPageSlug(slug);
}

export { CONTENT_LOCALES };
export type { Locale, StaticPageSlug };
