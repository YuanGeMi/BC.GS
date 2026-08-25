import type { BonusTypeId } from "@/data/mock-casinos";
import type { MockBonus } from "@/data/mock-bonuses";

export type BonusFilters = {
  types: BonusTypeId[];
  casinoSlug: string;
};

export type BonusSort = "value" | "newest" | "expiring";

export const EMPTY_BONUS_FILTERS: BonusFilters = {
  types: [],
  casinoSlug: "",
};

export const BONUS_PAGE_SIZE = 9;

export const LISTING_BONUS_TYPES: BonusTypeId[] = [
  "welcome",
  "no-deposit",
  "free-spins",
  "reload",
  "cashback",
];

export function filterBonuses(
  bonuses: MockBonus[],
  filters: BonusFilters,
): MockBonus[] {
  return bonuses.filter((bonus) => {
    const typeOk =
      filters.types.length === 0 || filters.types.includes(bonus.type);
    const casinoOk =
      filters.casinoSlug === "" || bonus.casinoSlug === filters.casinoSlug;
    return typeOk && casinoOk;
  });
}

export function sortBonuses(bonuses: MockBonus[], sort: BonusSort): MockBonus[] {
  const next = [...bonuses];

  if (sort === "newest") {
    next.sort(
      (a, b) =>
        new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime(),
    );
    return next;
  }

  if (sort === "expiring") {
    next.sort(
      (a, b) =>
        new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    );
    return next;
  }

  next.sort((a, b) => b.valueAmount - a.valueAmount);
  return next;
}

export function countBonusFilters(filters: BonusFilters): number {
  return filters.types.length + (filters.casinoSlug ? 1 : 0);
}

export function toggleBonusType(
  filters: BonusFilters,
  type: BonusTypeId,
): BonusFilters {
  const types = filters.types.includes(type)
    ? filters.types.filter((item) => item !== type)
    : [...filters.types, type];

  return { ...filters, types };
}

export function uniqueBonusCasinos(bonuses: MockBonus[]): {
  slug: string;
  name: MockBonus["casinoName"];
}[] {
  const seen = new Map<string, MockBonus["casinoName"]>();

  for (const bonus of bonuses) {
    if (!seen.has(bonus.casinoSlug)) {
      seen.set(bonus.casinoSlug, bonus.casinoName);
    }
  }

  return [...seen.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.en.localeCompare(b.name.en));
}
