/** Cache tags shared by unstable_cache writers and revalidateTag callers.
 * Keep this free of next/cache imports so client components can import
 * modules that only need the tag string constants (or related labels).
 */
export const SITE_SETTINGS_TAG = "site-settings";
export const LEGAL_PAGE_SLUGS_TAG = "legal-page-slugs";

/** Tag for unstable_cache entries from getCasinoCompareDetail(slug, locale). */
export function casinoCompareDetailTag(slug: string) {
  return `casino-compare-detail:${slug}`;
}
