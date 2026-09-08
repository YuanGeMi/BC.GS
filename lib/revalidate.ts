import { revalidatePath } from "next/cache";

import { routing } from "@/i18n/routing";

/**
 * Bust the cached casino detail HTML for every locale.
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
}
