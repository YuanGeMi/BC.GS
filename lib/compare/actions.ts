"use server";

import {
  getCasinoCompareDetail,
  type CasinoCompareDetail,
} from "@/lib/casinos";

export async function fetchCasinoCompareDetail(
  slug: string,
  locale: string,
): Promise<CasinoCompareDetail | null> {
  return getCasinoCompareDetail(slug, locale);
}
