import type { MockCasino } from "@/data/mock-casinos";

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
  casinos: MockCasino[],
  selected: ReadonlySet<string>,
  count = COMPARE_MAX,
): MockCasino[] {
  return [...casinos]
    .filter((casino) => !selected.has(casino.slug))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}
