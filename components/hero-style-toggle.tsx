"use client";

import { useTranslations } from "next-intl";

import { useHeroStyle, type HeroStyle } from "@/components/hero-style-provider";
import { cn } from "@/lib/utils";

const OPTIONS: HeroStyle[] = ["masthead", "finder", "index"];

export function HeroStyleToggle() {
  const t = useTranslations("SettingsPage.hero");
  const { style, setStyle } = useHeroStyle();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="bg-card ring-text/10 inline-flex flex-wrap rounded-lg p-1 ring-1"
    >
      {OPTIONS.map((option) => {
        const active = style === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => setStyle(option)}
            className={cn(
              "rounded-md px-4 py-2 text-sm transition-colors duration-200",
              active
                ? "bg-accent text-background"
                : "text-text/60 hover:text-text",
            )}
          >
            {t(option)}
          </button>
        );
      })}
    </div>
  );
}
