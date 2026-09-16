export const CATALOG_NAV = [
  { href: "/admin/catalogs/payout", kind: "payout", label: "Payout speed" },
  { href: "/admin/catalogs/licenses", kind: "license", label: "Licenses" },
  { href: "/admin/catalogs/payments", kind: "payment", label: "Payments" },
  { href: "/admin/catalogs/providers", kind: "provider", label: "Providers" },
  { href: "/admin/catalogs/bonus-types", kind: "bonusType", label: "Bonus types" },
  { href: "/admin/catalogs/markets", kind: "markets", label: "Markets" },
] as const;

export type CatalogKind = "payout" | "license" | "payment" | "provider" | "bonusType";

export const CATALOG_KIND_META: Record<
  CatalogKind,
  { title: string; nameLabel: string }
> = {
  payout: { title: "Payout speed", nameLabel: "Label" },
  license: { title: "Licenses", nameLabel: "Name" },
  payment: { title: "Payments", nameLabel: "Name" },
  provider: { title: "Providers", nameLabel: "Name" },
  bonusType: { title: "Bonus types", nameLabel: "Name" },
};

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
