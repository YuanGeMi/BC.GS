"use client";

import { useTranslations } from "next-intl";

import { useCardStyle, type CardStyle } from "@/components/card-style-provider";
import { cn } from "@/lib/utils";

const OPTIONS: CardStyle[] = ["row", "card"];

export function CardStyleToggle() {
  const t = useTranslations("SettingsPage.cards");
  const { style, setStyle } = useCardStyle();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="bg-card ring-text/10 inline-flex rounded-lg p-1 ring-1"
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
