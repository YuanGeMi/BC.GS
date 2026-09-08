import { revalidatePath, revalidateTag } from "next/cache";

import { routing } from "@/i18n/routing";

/** Tag for unstable_cache entries from getCasinoCompareDetail(slug, locale). */
export function casinoCompareDetailTag(slug: string) {
  return `casino-compare-detail:${slug}`;
}

/**
 * Bust the cached compare-slot detail for one casino (all locales share the tag).
 *
 * Prefer calling revalidateCasinoPage(slug), which also invalidates the detail
 * page HTML. Use this alone only when you intentionally skip path revalidation.
 *
 * Not wired to any action yet — import from admin flows when those exist.
 */
export function revalidateCasinoCompareDetail(slug: string) {
  revalidateTag(casinoCompareDetailTag(slug), "max");
}

/**
 * Bust the cached casino detail HTML for every locale, and the compare-slot
 * detail cache for that casino.
 *
 * Call this after:
 * - editorial casino content changes (review body, scores, facts, bonuses, etc.), or
 * - a user review's status changes to "published" (or is unpublished) for that casino.
 *
 * Not wired to any action yet — import from admin / review-approval flows when those exist.
 */
export function revalidateCasinoPage(slug: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/casinos/${slug}`);
  }
  revalidateCasinoCompareDetail(slug);
}

/**
 * Bust the cached compare page (picker list) for every locale.
 *
 * Call this whenever a casino's core listing info changes — same triggers as
 * revalidateCasinoPage: new casino published, rating/name/logo updated, or a
 * casino unpublished/removed. That keeps the compare picker in sync without a
 * time-based revalidate export.
 *
 * Not wired to any action yet — import from admin flows when those exist.
 */
export function revalidateCompareList() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/compare`);
  }
}
