"use client";

import { CATALOG_NAV } from "@/lib/admin/catalog-kinds";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function CatalogSubnav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Catalogs"
      className="border-text/10 mb-10 flex flex-wrap gap-1 border-b pb-3"
    >
      {CATALOG_NAV.map((item) => {
        const current =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-2 text-[13px] tracking-wide",
              current ? "text-accent" : "text-text/50 hover:text-text",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
