/** Cache tags shared by unstable_cache writers and revalidateTag callers.
 * Keep this free of next/cache imports so client components can import
 * modules that only need the tag string constants (or related labels).
 */
export const SITE_SETTINGS_TAG = "site-settings";
export const LEGAL_PAGE_SLUGS_TAG = "legal-page-slugs";
/** Published casino directory / picker / home strips (all locales). */
export const CASINO_DIRECTORY_TAG = "casino-directory";
/** Published bonus directory + home featured strip. */
export const BONUS_DIRECTORY_TAG = "bonus-directory";
/** License / payment / provider / bonus-type option lists. */
export const CATALOG_OPTIONS_TAG = "catalog-options";
/** Published category index + ranked lists. */
export const CATEGORY_DIRECTORY_TAG = "category-directory";

/** Tag for unstable_cache entries from getCasinoCompareDetail(slug, locale). */
export function casinoCompareDetailTag(slug: string) {
  return `casino-compare-detail:${slug}`;
}
