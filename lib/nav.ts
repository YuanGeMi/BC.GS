export type NavItem = {
  href: string;
  labelKey: "casinos" | "bonuses" | "compare" | "bestOf";
};

export const MAIN_NAV: NavItem[] = [
  { href: "/casinos", labelKey: "casinos" },
  { href: "/bonuses", labelKey: "bonuses" },
  { href: "/compare", labelKey: "compare" },
  { href: "/best-of", labelKey: "bestOf" },
];
