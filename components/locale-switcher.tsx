"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  zh: "中文",
  th: "ไทย",
};

type Props = {
  className?: string;
  /** Compact header style with pipe separators. */
  variant?: "default" | "compact";
};

export function LocaleSwitcher({
  className,
  variant = "compact",
}: Props) {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("LocaleSwitcher");
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());

  return (
    <nav
      aria-label={t("label")}
      className={cn(
        "flex items-center",
        variant === "compact" ? "gap-0 text-xs tracking-wide" : "flex-wrap gap-3",
        className,
      )}
    >
      {routing.locales.map((locale, index) => {
        const isActive = locale === currentLocale;

        return (
          <span key={locale} className="flex items-center">
            {variant === "compact" && index > 0 ? (
              <span aria-hidden className="text-text/25 mx-1.5 select-none">
                |
              </span>
            ) : null}
            <Link
              href={{ pathname, query }}
              locale={locale}
              className={cn(
                "transition-colors duration-200",
                variant === "compact" ? "text-xs font-medium" : "text-sm",
                isActive
                  ? "text-accent-highlight"
                  : "text-text/55 hover:text-accent",
              )}
              aria-current={isActive ? "true" : undefined}
            >
              {localeLabels[locale]}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
