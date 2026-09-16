import { type Locale } from "@/i18n/routing";

import { CONTENT_LOCALES, normalizeSlug } from "@/lib/admin/casino-input";

export type CategoryTranslationDraft = {
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  methodology: string;
};

export type CategoryCasinoDraft = {
  casinoId: string;
  rank: string;
  notes: Record<Locale, string>;
};

export type CategorySaveInput = {
  slug: string;
  translations: Record<Locale, CategoryTranslationDraft>;
  casinos: CategoryCasinoDraft[];
};

export type ParsedCategorySave = {
  slug: string;
  translations: Array<{
    locale: Locale;
    name: string;
    description: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    methodology: string | null;
  }>;
  casinos: Array<{
    casinoId: string;
    rank: number | null;
    notes: Array<{ locale: Locale; editorialNote: string }>;
  }>;
};

export type CategoryInputError =
  | "invalidSlug"
  | "duplicateSlug"
  | "englishRequired"
  | "invalidRank"
  | "invalidCasino"
  | "missing"
  | "invalidStatus";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function emptyCategoryTranslation(): CategoryTranslationDraft {
  return {
    name: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    methodology: "",
  };
}

export function emptyCategorySaveInput(): CategorySaveInput {
  return {
    slug: "",
    translations: {
      en: emptyCategoryTranslation(),
      zh: emptyCategoryTranslation(),
      th: emptyCategoryTranslation(),
    },
    casinos: [],
  };
}

export function englishNameReady(input: CategorySaveInput) {
  return Boolean(input.translations.en.name.trim());
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseRank(
  value: string,
): { ok: true; value: number | null } | { ok: false } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  if (!/^\d+$/.test(trimmed)) return { ok: false };
  const n = Number(trimmed);
  if (n < 1) return { ok: false };
  return { ok: true, value: n };
}

export function parseCategorySaveInput(
  input: CategorySaveInput,
):
  | { ok: true; value: ParsedCategorySave }
  | { ok: false; error: CategoryInputError } {
  const slug = normalizeSlug(input.slug);
  if (!SLUG_RE.test(slug)) return { ok: false, error: "invalidSlug" };

  const seen = new Set<string>();
  const casinos: ParsedCategorySave["casinos"] = [];

  for (const row of input.casinos) {
    const casinoId = row.casinoId.trim();
    if (!casinoId) return { ok: false, error: "invalidCasino" };
    if (seen.has(casinoId)) continue;
    seen.add(casinoId);

    const rank = parseRank(row.rank);
    if (!rank.ok) return { ok: false, error: "invalidRank" };

    const notes = CONTENT_LOCALES.flatMap((locale) => {
      const editorialNote = row.notes[locale]?.trim() ?? "";
      if (!editorialNote) return [];
      return [{ locale, editorialNote }];
    });

    casinos.push({ casinoId, rank: rank.value, notes });
  }

  const translations = CONTENT_LOCALES.flatMap((locale) => {
    const row = input.translations[locale];
    const name = row.name.trim();
    const description = optionalText(row.description);
    const seoTitle = optionalText(row.seoTitle);
    const seoDescription = optionalText(row.seoDescription);
    const methodology = optionalText(row.methodology);
    if (
      locale !== "en" &&
      !name &&
      !description &&
      !seoTitle &&
      !seoDescription &&
      !methodology
    ) {
      return [];
    }
    return [
      {
        locale,
        name,
        description,
        seoTitle,
        seoDescription,
        methodology,
      },
    ];
  });

  return {
    ok: true,
    value: { slug, translations, casinos },
  };
}

export { CONTENT_LOCALES };
export type { Locale };
