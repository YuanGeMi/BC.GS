export const ADMIN_NAV = [
  { href: "/admin/casinos", labelKey: "casinos" },
  { href: "/admin/bonuses", labelKey: "bonuses" },
  { href: "/admin/categories", labelKey: "categories" },
  { href: "/admin/pages", labelKey: "pages" },
  { href: "/admin/reviews", labelKey: "reviews" },
  { href: "/admin/catalogs/payout", labelKey: "catalogs" },
  { href: "/admin/clicks", labelKey: "clicks" },
  { href: "/admin/users", labelKey: "users" },
] as const;

export type AdminNavLabelKey = (typeof ADMIN_NAV)[number]["labelKey"];
