import type {
  BonusTypeId,
  LicenseId,
  MockCasino,
  PaymentId,
  ProviderId,
} from "@/data/mock-casinos";

export type FilterFacet = "licenses" | "payments" | "providers" | "bonusTypes";

export type CasinoFilters = {
  licenses: LicenseId[];
  payments: PaymentId[];
  providers: ProviderId[];
  bonusTypes: BonusTypeId[];
};

export type CasinoSort = "rating" | "newest" | "bonus";

export const EMPTY_FILTERS: CasinoFilters = {
  licenses: [],
  payments: [],
  providers: [],
  bonusTypes: [],
};

export const PAGE_SIZE = 9;

export const LICENSE_OPTIONS: LicenseId[] = [
  "mga",
  "curacao",
  "gibraltar",
  "ukgc",
  "kahnawake",
];

export const PAYMENT_OPTIONS: PaymentId[] = [
  "crypto",
  "visa",
  "paypal",
  "bank",
];

export const PROVIDER_OPTIONS: ProviderId[] = [
  "evolution",
  "pragmatic",
  "netent",
  "playngo",
  "hacksaw",
];

export const BONUS_TYPE_OPTIONS: BonusTypeId[] = [
  "welcome",
  "no-deposit",
  "free-spins",
  "reload",
  "cashback",
];

function matchesFacet<T extends string>(selected: T[], values: T[]): boolean {
  if (selected.length === 0) return true;
  return selected.some((id) => values.includes(id));
}

export function filterCasinos(
  casinos: MockCasino[],
  filters: CasinoFilters,
): MockCasino[] {
  return casinos.filter(
    (casino) =>
      matchesFacet(filters.licenses, casino.licenses) &&
      matchesFacet(filters.payments, casino.payments) &&
      matchesFacet(filters.providers, casino.providers) &&
      matchesFacet(filters.bonusTypes, casino.bonusTypes),
  );
}

export function sortCasinos(
  casinos: MockCasino[],
  sort: CasinoSort,
): MockCasino[] {
  const next = [...casinos];

  if (sort === "newest") {
    next.sort(
      (a, b) =>
        new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime(),
    );
    return next;
  }

  if (sort === "bonus") {
    next.sort((a, b) => b.bonusValue - a.bonusValue);
    return next;
  }

  next.sort((a, b) => b.rating - a.rating);
  return next;
}

export function countActiveFilters(filters: CasinoFilters): number {
  return (
    filters.licenses.length +
    filters.payments.length +
    filters.providers.length +
    filters.bonusTypes.length
  );
}

export function toggleFilterValue<K extends FilterFacet>(
  filters: CasinoFilters,
  facet: K,
  value: CasinoFilters[K][number],
): CasinoFilters {
  const current = filters[facet] as string[];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  return { ...filters, [facet]: next };
}
