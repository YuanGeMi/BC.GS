"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { BonusCard } from "@/components/bonus-card";
import { Button } from "@/components/button";
import type { MockBonus } from "@/data/mock-bonuses";
import { localize } from "@/data/mock-casinos";
import {
  BONUS_PAGE_SIZE,
  countBonusFilters,
  EMPTY_BONUS_FILTERS,
  filterBonuses,
  LISTING_BONUS_TYPES,
  sortBonuses,
  toggleBonusType,
  uniqueBonusCasinos,
  type BonusSort,
} from "@/lib/bonus-directory";
import { cn } from "@/lib/utils";

type Props = {
  locale: string;
  bonuses: MockBonus[];
};

export function BonusDirectory({ locale, bonuses }: Props) {
  const t = useTranslations("BonusesPage");
  const tTypes = useTranslations("CasinosPage.bonusTypes");
  const [types, setTypes] = useState(EMPTY_BONUS_FILTERS.types);
  const [casinoSlug, setCasinoSlug] = useState("");
  const [sort, setSort] = useState<BonusSort>("value");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({ types, casinoSlug }),
    [types, casinoSlug],
  );

  const casinos = useMemo(() => uniqueBonusCasinos(bonuses), [bonuses]);

  const results = useMemo(
    () => sortBonuses(filterBonuses(bonuses, filters), sort),
    [bonuses, filters, sort],
  );

  const visible = results.slice(0, page * BONUS_PAGE_SIZE);
  const hasMore = visible.length < results.length;
  const activeCount = countBonusFilters(filters);

  function resetPage() {
    setPage(1);
  }

  function handleClear() {
    setTypes([]);
    setCasinoSlug("");
    setPage(1);
  }

  return (
    <div>
      <div className="bg-card/40 ring-text/8 mb-8 rounded-xl p-4 ring-1 sm:p-5">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-text/40 mb-2 text-[11px] font-medium tracking-[0.16em] uppercase">
              {t("filters.type")}
            </p>
            <div className="flex flex-wrap gap-2">
              {LISTING_BONUS_TYPES.map((type) => {
                const active = types.includes(type);

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setTypes((current) => toggleBonusType({ types: current, casinoSlug }, type).types);
                      resetPage();
                    }}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-colors duration-200",
                      active
                        ? "bg-accent-highlight/15 text-accent-highlight"
                        : "bg-text/5 text-text/60 hover:text-text",
                    )}
                  >
                    {tTypes(type)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm sm:max-w-xs">
              <span className="text-text/40 text-[11px] font-medium tracking-[0.16em] uppercase">
                {t("filters.casino")}
              </span>
              <select
                value={casinoSlug}
                onChange={(event) => {
                  setCasinoSlug(event.target.value);
                  resetPage();
                }}
                className="bg-card text-text ring-text/15 focus:ring-accent/40 h-10 rounded-md px-3 text-sm ring-1 outline-none"
              >
                <option value="">{t("filters.allCasinos")}</option>
                {casinos.map((casino) => (
                  <option key={casino.slug} value={casino.slug}>
                    {localize(casino.name, locale)}
                  </option>
                ))}
              </select>
            </label>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleClear}
              disabled={activeCount === 0}
            >
              {t("filters.clear")}
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-text/55 text-sm">
          {t("resultsCount", { count: results.length })}
        </p>

        <label className="text-text/50 flex items-center gap-2 text-sm">
          <span className="hidden sm:inline">{t("sort.label")}</span>
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as BonusSort);
              resetPage();
            }}
            className="bg-card text-text ring-text/15 focus:ring-accent/40 h-10 rounded-md px-3 text-sm ring-1 outline-none"
          >
            <option value="value">{t("sort.value")}</option>
            <option value="newest">{t("sort.newest")}</option>
            <option value="expiring">{t("sort.expiring")}</option>
          </select>
        </label>
      </div>

      {results.length === 0 ? (
        <div className="bg-card ring-text/8 flex flex-col items-start rounded-xl p-8 ring-1">
          <p className="text-text text-base font-semibold tracking-tight">
            {t("empty.title")}
          </p>
          <p className="text-text/55 mt-2 text-sm">{t("empty.body")}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-5"
            onClick={handleClear}
          >
            {t("filters.clear")}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((bonus) => (
              <BonusCard
                key={bonus.id}
                casinoName={localize(bonus.casinoName, locale)}
                logoUrl={bonus.logoUrl}
                title={localize(bonus.title, locale)}
                bonusValue={localize(bonus.bonusValue, locale)}
                badge={tTypes(bonus.type)}
                ctaHref={`/casinos/${bonus.casinoSlug}`}
                ctaLabel={t("cta")}
              />
            ))}
          </div>

          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <Button
                variant="secondary"
                onClick={() => setPage((current) => current + 1)}
              >
                {t("loadMore")}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
