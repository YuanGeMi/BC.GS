export const CATALOG_NAV = [
  { href: "/admin/catalogs/payout", kind: "payout", labelKey: "payout" },
  { href: "/admin/catalogs/licenses", kind: "license", labelKey: "license" },
  { href: "/admin/catalogs/payments", kind: "payment", labelKey: "payment" },
  { href: "/admin/catalogs/providers", kind: "provider", labelKey: "provider" },
  { href: "/admin/catalogs/bonus-types", kind: "bonusType", labelKey: "bonusType" },
  { href: "/admin/catalogs/markets", kind: "markets", labelKey: "markets" },
] as const;

export type CatalogKind = "payout" | "license" | "payment" | "provider" | "bonusType";

export const CATALOG_KINDS: CatalogKind[] = [
  "payout",
  "license",
  "payment",
  "provider",
  "bonusType",
];

export type CatalogNames = {
  en: string;
  zh: string;
  th: string;
};

export type CatalogItem = {
  id: string;
  slug: string;
  sortOrder: number;
  /** null until delete confirm loads usage via getCatalogItemUsage */
  usageCount: number | null;
  usageNames: string[];
  names: CatalogNames;
};
