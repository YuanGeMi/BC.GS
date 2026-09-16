import { ContentStatus, MarketAvailability } from "@/lib/db-enums";
import { routing, type Locale } from "@/i18n/routing";

export const CONTENT_LOCALES = routing.locales;

export type CasinoTranslationDraft = {
  name: string;
  reviewBody: string;
  pros: string;
  cons: string;
  seoTitle: string;
  seoDescription: string;
};

export type CasinoLicenseDraft = {
  licenseId: string;
  licenseNumber: string;
  verified: boolean;
  verificationUrl: string;
};

export type CasinoMarketDraft = {
  marketId: string;
  status: MarketAvailability;
  affiliateLink: string;
};

export type CasinoSaveInput = {
  slug: string;
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
  translations: Record<Locale, CasinoTranslationDraft>;
  licenses: CasinoLicenseDraft[];
  paymentMethodIds: string[];
  gameProviderIds: string[];
  markets: CasinoMarketDraft[];
};

export type ParsedCasinoSave = {
  slug: string;
  logoUrl: string | null;
  establishedYear: number | null;
  minDeposit: number | null;
  payoutSpeedId: string | null;
  overallRating: number | null;
  ratingBonuses: number | null;
  ratingGames: number | null;
  ratingSupport: number | null;
  ratingPayout: number | null;
  ratingTrust: number | null;
  affiliateLink: string | null;
  translations: Array<{
    locale: Locale;
    name: string;
    reviewBody: string;
    pros: string[];
    cons: string[];
    seoTitle: string | null;
    seoDescription: string | null;
  }>;
  licenses: Array<{
    licenseId: string;
    licenseNumber: string | null;
    verified: boolean;
    verificationUrl: string | null;
  }>;
  paymentMethodIds: string[];
  gameProviderIds: string[];
  markets: Array<{
    marketId: string;
    status: MarketAvailability;
    affiliateLink: string | null;
  }>;
};

export type CasinoInputError =
  | "invalidSlug"
  | "duplicateSlug"
  | "englishRequired"
  | "invalidScore"
  | "invalidYear"
  | "invalidDeposit"
  | "invalidCatalog"
  | "missing"
  | "invalidStatus";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function emptyTranslation(): CasinoTranslationDraft {
  return {
    name: "",
    reviewBody: "",
    pros: "",
    cons: "",
    seoTitle: "",
    seoDescription: "",
  };
}

export function emptyCasinoSaveInput(): CasinoSaveInput {
  return {
    slug: "",
    logoUrl: "",
    establishedYear: "",
    minDeposit: "",
    payoutSpeedId: "",
    overallRating: "",
    ratingBonuses: "",
    ratingGames: "",
    ratingSupport: "",
    ratingPayout: "",
    ratingTrust: "",
    affiliateLink: "",
    translations: {
      en: emptyTranslation(),
      zh: emptyTranslation(),
      th: emptyTranslation(),
    },
    licenses: [],
    paymentMethodIds: [],
    gameProviderIds: [],
    markets: [],
  };
}

export function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

function parseScore(
  value: string,
): { ok: true; value: number | null } | { ok: false } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0 || n > 5) return { ok: false };
  return { ok: true, value: Math.round(n * 10) / 10 };
}

function parseYear(
  value: string,
): { ok: true; value: number | null } | { ok: false } {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  if (!/^\d{4}$/.test(trimmed)) return { ok: false };
  const n = Number(trimmed);
  const max = new Date().getFullYear() + 1;
  if (n < 1900 || n > max) return { ok: false };
  return { ok: true, value: n };
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

export function englishReady(input: CasinoSaveInput | ParsedCasinoSave) {
  if ("translations" in input && Array.isArray(input.translations)) {
    const en = input.translations.find((row) => row.locale === "en");
    return Boolean(en?.name.trim() && en.reviewBody.trim());
  }
  const en = (input as CasinoSaveInput).translations.en;
  return Boolean(en.name.trim() && en.reviewBody.trim());
}

export function parseCasinoSaveInput(
  input: CasinoSaveInput,
): { ok: true; value: ParsedCasinoSave } | { ok: false; error: CasinoInputError } {
  const slug = normalizeSlug(input.slug);
  if (!SLUG_RE.test(slug)) return { ok: false, error: "invalidSlug" };

  const overallRating = parseScore(input.overallRating);
  const ratingBonuses = parseScore(input.ratingBonuses);
  const ratingGames = parseScore(input.ratingGames);
  const ratingSupport = parseScore(input.ratingSupport);
  const ratingPayout = parseScore(input.ratingPayout);
  const ratingTrust = parseScore(input.ratingTrust);
  if (
    !overallRating.ok ||
    !ratingBonuses.ok ||
    !ratingGames.ok ||
    !ratingSupport.ok ||
    !ratingPayout.ok ||
    !ratingTrust.ok
  ) {
    return { ok: false, error: "invalidScore" };
  }

  const establishedYear = parseYear(input.establishedYear);
  if (!establishedYear.ok) return { ok: false, error: "invalidYear" };

  const minDeposit = parseDeposit(input.minDeposit);
  if (!minDeposit.ok) return { ok: false, error: "invalidDeposit" };

  const translations = CONTENT_LOCALES.flatMap((locale) => {
    const row = input.translations[locale];
    const name = row.name.trim();
    const reviewBody = row.reviewBody.trim();
    const seoTitle = optionalText(row.seoTitle);
    const seoDescription = optionalText(row.seoDescription);
    const pros = lines(row.pros);
    const cons = lines(row.cons);
    if (locale !== "en" && !name && !reviewBody && !seoTitle && !seoDescription && !pros.length && !cons.length) {
      return [];
    }
    return [
      {
        locale,
        name,
        reviewBody,
        pros,
        cons,
        seoTitle,
        seoDescription,
      },
    ];
  });

  const licenses = input.licenses.map((row) => ({
    licenseId: row.licenseId.trim(),
    licenseNumber: optionalText(row.licenseNumber),
    verified: Boolean(row.verified),
    verificationUrl: optionalText(row.verificationUrl),
  }));

  const markets = input.markets.map((row) => ({
    marketId: row.marketId.trim(),
    status:
      row.status === MarketAvailability.restricted
        ? MarketAvailability.restricted
        : MarketAvailability.available,
    affiliateLink: optionalText(row.affiliateLink),
  }));

  if (licenses.some((row) => !row.licenseId) || markets.some((row) => !row.marketId)) {
    return { ok: false, error: "invalidCatalog" };
  }

  return {
    ok: true,
    value: {
      slug,
      logoUrl: optionalText(input.logoUrl),
      establishedYear: establishedYear.value,
      minDeposit: minDeposit.value,
      payoutSpeedId: optionalText(input.payoutSpeedId),
      overallRating: overallRating.value,
      ratingBonuses: ratingBonuses.value,
      ratingGames: ratingGames.value,
      ratingSupport: ratingSupport.value,
      ratingPayout: ratingPayout.value,
      ratingTrust: ratingTrust.value,
      affiliateLink: optionalText(input.affiliateLink),
      translations,
      licenses,
      paymentMethodIds: uniqueIds(input.paymentMethodIds),
      gameProviderIds: uniqueIds(input.gameProviderIds),
      markets,
    },
  };
}

export function isContentStatus(value: string): value is ContentStatus {
  return value === ContentStatus.draft || value === ContentStatus.published;
}
