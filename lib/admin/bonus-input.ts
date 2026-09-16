import { ContentStatus } from "@/lib/db-enums";
import { type Locale } from "@/i18n/routing";

import { CONTENT_LOCALES, normalizeSlug } from "@/lib/admin/casino-input";

export type BonusTranslationDraft = {
  title: string;
  terms: string;
};

export type BonusSaveInput = {
  casinoId: string;
  typeId: string;
  slug: string;
  sortOrder: string;
  amount: string;
  wageringRequirement: string;
  minDeposit: string;
  code: string;
  expiryDate: string;
  translations: Record<Locale, BonusTranslationDraft>;
};

export type ParsedBonusSave = {
  casinoId: string;
  typeId: string;
  slug: string;
  sortOrder: number;
  amount: string | null;
  wageringRequirement: string | null;
  minDeposit: number | null;
  code: string | null;
  expiryDate: Date | null;
  translations: Array<{
    locale: Locale;
    title: string;
    terms: string;
  }>;
};

export type BonusInputError =
  | "invalidSlug"
  | "duplicateSlug"
  | "englishRequired"
  | "casinoRequired"
  | "typeRequired"
  | "casinoDraft"
  | "invalidSort"
  | "invalidDeposit"
  | "invalidExpiry"
  | "missing"
  | "invalidStatus";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function emptyBonusTranslation(): BonusTranslationDraft {
  return { title: "", terms: "" };
}

export function emptyBonusSaveInput(): BonusSaveInput {
  return {
    casinoId: "",
    typeId: "",
    slug: "",
    sortOrder: "0",
    amount: "",
    wageringRequirement: "",
    minDeposit: "",
    code: "",
    expiryDate: "",
    translations: {
      en: emptyBonusTranslation(),
      zh: emptyBonusTranslation(),
      th: emptyBonusTranslation(),
    },
  };
}

export function suggestedBonusSlug(casinoSlug: string, typeSlug: string) {
  return normalizeSlug(`${casinoSlug}-${typeSlug}`);
}

export function englishTitleReady(input: BonusSaveInput) {
  return Boolean(input.translations.en.title.trim());
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseSort(
  value: string,
): { ok: true; value: number } | { ok: false } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: 0 };
  if (!/^-?\d+$/.test(trimmed)) return { ok: false };
  return { ok: true, value: Number(trimmed) };
}

function parseDeposit(
  value: string,
): { ok: true; value: number | null } | { ok: false } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return { ok: false };
  return { ok: true, value: n };
}

function parseExpiry(
  value: string,
): { ok: true; value: Date | null } | { ok: false } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return { ok: false };
  const date = new Date(`${trimmed}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return { ok: false };
  return { ok: true, value: date };
}

export function parseBonusSaveInput(
  input: BonusSaveInput,
): { ok: true; value: ParsedBonusSave } | { ok: false; error: BonusInputError } {
  const casinoId = input.casinoId.trim();
  const typeId = input.typeId.trim();
  if (!casinoId) return { ok: false, error: "casinoRequired" };
  if (!typeId) return { ok: false, error: "typeRequired" };

  const slug = normalizeSlug(input.slug);
  if (!SLUG_RE.test(slug)) return { ok: false, error: "invalidSlug" };

  const sortOrder = parseSort(input.sortOrder);
  if (!sortOrder.ok) return { ok: false, error: "invalidSort" };

  const minDeposit = parseDeposit(input.minDeposit);
  if (!minDeposit.ok) return { ok: false, error: "invalidDeposit" };

  const expiryDate = parseExpiry(input.expiryDate);
  if (!expiryDate.ok) return { ok: false, error: "invalidExpiry" };

  const translations = CONTENT_LOCALES.flatMap((locale) => {
    const row = input.translations[locale];
    const title = row.title.trim();
    const terms = row.terms.trim();
    if (locale !== "en" && !title && !terms) return [];
    return [{ locale, title, terms }];
  });

  return {
    ok: true,
    value: {
      casinoId,
      typeId,
      slug,
      sortOrder: sortOrder.value,
      amount: optionalText(input.amount),
      wageringRequirement: optionalText(input.wageringRequirement),
      minDeposit: minDeposit.value,
      code: optionalText(input.code),
      expiryDate: expiryDate.value,
      translations,
    },
  };
}

export function isContentStatus(value: string): value is ContentStatus {
  return value === ContentStatus.draft || value === ContentStatus.published;
}

export { CONTENT_LOCALES };
export type { Locale };
