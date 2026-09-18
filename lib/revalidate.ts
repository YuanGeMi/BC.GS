import { revalidatePath, revalidateTag } from "next/cache";

import { routing } from "@/i18n/routing";
import {
  casinoCompareDetailTag,
  LEGAL_PAGE_SLUGS_TAG,
  SITE_SETTINGS_TAG,
} from "@/lib/cache-tags";
import { getPublishedCategorySlugs } from "@/lib/categories";
import { getPublishedCasinoSlugs } from "@/lib/casinos";

export { casinoCompareDetailTag };

/** Bust the tagged compare-slot detail for one casino (all locales share the tag). */
export function revalidateCasinoCompareDetail(slug: string) {
  revalidateTag(casinoCompareDetailTag(slug), "max");
}

/**
 * Bust the cached casino detail HTML for every locale, and the compare-slot
 * detail cache for that casino.
 */
export function revalidateCasinoPage(slug: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/casinos/${slug}`);
  }
  revalidateCasinoCompareDetail(slug);
}

/** Bust the cached compare page (picker list) for every locale. */
export function revalidateCompareList() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/compare`);
  }
}

/** Home, directories, best-of, and sitemap — after publish / unpublish / slug change. */
export function revalidatePublicIndexes() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/casinos`);
    revalidatePath(`/${locale}/bonuses`);
    revalidatePath(`/${locale}/best-of`);
  }
  revalidatePath("/sitemap.xml");
}

/**
 * Published (or previously published) casino writes: detail, compare picker,
 * indexes, and the old slug if it changed.
 */
export function revalidateCasinoPublicSurfaces(
  slugs: Array<string | null | undefined>,
) {
  const unique = [...new Set(slugs.filter((slug): slug is string => Boolean(slug)))];
  for (const slug of unique) {
    revalidateCasinoPage(slug);
  }
  revalidateCompareList();
  revalidatePublicIndexes();
}

/** Locale layouts after SiteSetting changes (e.g. Telegram / Discord URLs). */
export function revalidateSiteSettings() {
  revalidateTag(SITE_SETTINGS_TAG, "max");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`, "layout");
  }
}

/** Casino review, bonus directory, and home featured strip. */
export function revalidateBonusSurfaces(casinoSlugs: Array<string | null | undefined>) {
  const unique = [
    ...new Set(casinoSlugs.filter((slug): slug is string => Boolean(slug))),
  ];
  for (const slug of unique) {
    revalidateCasinoPage(slug);
  }
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/bonuses`);
  }
}

/** Best-of index, ranked list pages, related blocks, sitemap. */
export function revalidateBestOfSurfaces(slugs: Array<string | null | undefined>) {
  const unique = [
    ...new Set(slugs.filter((slug): slug is string => Boolean(slug))),
  ];
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/best-of`);
    for (const slug of unique) {
      revalidatePath(`/${locale}/best/${slug}`);
    }
  }
  revalidatePath("/sitemap.xml");
}

export function revalidateStaticPage(slug: string) {
  revalidateTag(LEGAL_PAGE_SLUGS_TAG, "max");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/${slug}`);
    // Footer legal links depend on publish status.
    revalidatePath(`/${locale}`, "layout");
  }
  revalidatePath("/sitemap.xml");
}

/**
 * After catalog label/order changes (payout, licenses, payments, providers,
 * bonus types, markets): directories, home, compare shell, every published casino
 * detail (+ compare-detail tags), and best-of lists — labels are baked into
 * those pages at render time.
 */
export async function revalidateCatalogSurfaces() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/casinos`);
    revalidatePath(`/${locale}/bonuses`);
    revalidatePath(`/${locale}/compare`);
    revalidatePath(`/${locale}/best-of`);
  }

  const [casinoSlugs, categorySlugs] = await Promise.all([
    getPublishedCasinoSlugs(),
    getPublishedCategorySlugs(),
  ]);

  for (const slug of casinoSlugs) {
    revalidateCasinoPage(slug);
  }

  for (const locale of routing.locales) {
    for (const slug of categorySlugs) {
      revalidatePath(`/${locale}/best/${slug}`);
    }
  }

  revalidatePath("/sitemap.xml");
}
