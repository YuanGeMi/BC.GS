import type { CasinoPickerItem } from "@/lib/casinos";

export const COMPARE_PARAM = "casinos";
export const COMPARE_MAX = 3;

export type CompareSlot = string | null;
export type CompareSlots = [CompareSlot, CompareSlot, CompareSlot];

const EMPTY_SLOTS: CompareSlots = [null, null, null];

export function parseCompareSlugs(
  raw: string | string[] | null | undefined,
  validSlugs: ReadonlySet<string>,
): string[] {
  const source = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  const seen = new Set<string>();
  const slugs: string[] = [];

  for (const part of source.split(",")) {
    const slug = part.trim();
    if (!slug || seen.has(slug) || !validSlugs.has(slug)) continue;
    seen.add(slug);
    slugs.push(slug);
    if (slugs.length >= COMPARE_MAX) break;
  }

  return slugs;
}

export function toCompareSlots(slugs: string[]): CompareSlots {
  return [slugs[0] ?? null, slugs[1] ?? null, slugs[2] ?? null];
}

export function serializeCompareSlots(slots: CompareSlots): string {
  return slots.filter((slug): slug is string => Boolean(slug)).join(",");
}

/**
 * Mirror the selection in the address bar without involving the Next.js
 * router — so the RSC tree / Prisma fetch for /compare do not re-run.
 */
export function syncCompareQueryToUrl(query: string): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set(COMPARE_PARAM, query);
  } else {
    url.searchParams.delete(COMPARE_PARAM);
  }

  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) return;

  window.history.replaceState(window.history.state, "", next);
}

export function emptyCompareSlots(): CompareSlots {
  return [...EMPTY_SLOTS];
}

export function setCompareSlot(
  slots: CompareSlots,
  index: number,
  slug: string | null,
): CompareSlots {
  const next: CompareSlots = [...slots];
  next[index] = slug;

  if (slug) {
    for (let i = 0; i < next.length; i += 1) {
      if (i !== index && next[i] === slug) next[i] = null;
    }
  }

  return toCompareSlots(next.filter((item): item is string => Boolean(item)));
}

export function suggestedCompareCasinos(
  casinos: CasinoPickerItem[],
  selected: ReadonlySet<string>,
  count = COMPARE_MAX,
): CasinoPickerItem[] {
  return [...casinos]
    .filter((casino) => !selected.has(casino.slug))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}
