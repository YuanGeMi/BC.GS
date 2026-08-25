"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { CasinoCard, CasinoCardList } from "@/components/casino-card";
import { localize, type MockCasino } from "@/data/mock-casinos";
import {
  BONUS_TYPE_OPTIONS,
  countActiveFilters,
  EMPTY_FILTERS,
  filterCasinos,
  LICENSE_OPTIONS,
  PAGE_SIZE,
  PAYMENT_OPTIONS,
  PROVIDER_OPTIONS,
  sortCasinos,
  toggleFilterValue,
  type CasinoFilters,
  type CasinoSort,
  type FilterFacet,
} from "@/lib/casino-directory";
import { cn } from "@/lib/utils";

type Props = {
  locale: string;
  casinos: MockCasino[];
};

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="hover:text-text flex cursor-pointer items-center gap-2.5 py-1.5 text-sm transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="border-text/25 text-accent accent-accent h-3.5 w-3.5 rounded-sm"
      />
      <span className={checked ? "text-text" : "text-text/65"}>{label}</span>
    </label>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-text/8 border-b pb-5">
      <legend className="text-text mb-2 text-xs font-medium tracking-[0.16em] uppercase">
        {title}
      </legend>
      <div>{children}</div>
    </fieldset>
  );
}

function FilterPanel({
  filters,
  onToggle,
  onClear,
}: {
  filters: CasinoFilters;
  onToggle: <K extends FilterFacet>(
    facet: K,
    value: CasinoFilters[K][number],
  ) => void;
  onClear: () => void;
}) {
  const t = useTranslations("CasinosPage");
  const active = countActiveFilters(filters);

  return (
    <div className="space-y-5">
      <FilterGroup title={t("filters.license")}>
        {LICENSE_OPTIONS.map((id) => (
          <CheckboxRow
            key={id}
            checked={filters.licenses.includes(id)}
            label={t(`licenses.${id}`)}
            onChange={() => onToggle("licenses", id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={t("filters.payments")}>
        {PAYMENT_OPTIONS.map((id) => (
          <CheckboxRow
            key={id}
            checked={filters.payments.includes(id)}
            label={t(`payments.${id}`)}
            onChange={() => onToggle("payments", id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={t("filters.providers")}>
        {PROVIDER_OPTIONS.map((id) => (
          <CheckboxRow
            key={id}
            checked={filters.providers.includes(id)}
            label={t(`providers.${id}`)}
            onChange={() => onToggle("providers", id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={t("filters.bonusType")}>
        {BONUS_TYPE_OPTIONS.map((id) => (
          <CheckboxRow
            key={id}
            checked={filters.bonusTypes.includes(id)}
            label={t(`bonusTypes.${id}`)}
            onChange={() => onToggle("bonusTypes", id)}
          />
        ))}
      </FilterGroup>

      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={onClear}
        disabled={active === 0}
      >
        {t("filters.clear")}
      </Button>
    </div>
  );
}

export function CasinoDirectory({ locale, casinos }: Props) {
  const t = useTranslations("CasinosPage");
  const [filters, setFilters] = useState<CasinoFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<CasinoSort>("rating");
  const [page, setPage] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  const results = useMemo(
    () => sortCasinos(filterCasinos(casinos, filters), sort),
    [casinos, filters, sort],
  );

  const visible = results.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < results.length;
  const activeCount = countActiveFilters(filters);

  function handleToggle<K extends FilterFacet>(
    facet: K,
    value: CasinoFilters[K][number],
  ) {
    setFilters((current) => toggleFilterValue(current, facet, value));
    setPage(1);
  }

  function handleClear() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  function handleSort(next: CasinoSort) {
    setSort(next);
    setPage(1);
  }

  return (
    <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-10">
      <aside className="border-text/8 bg-card/40 hidden rounded-xl p-5 ring-1 ring-text/8 lg:sticky lg:top-24 lg:block">
        <p className="text-text mb-5 text-sm font-semibold tracking-tight">
          {t("filters.title")}
        </p>
        <FilterPanel
          filters={filters}
          onToggle={handleToggle}
          onClear={handleClear}
        />
      </aside>

      <div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-text/55 text-sm">
            {t("resultsCount", { count: results.length })}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="border-text/15 text-text hover:border-accent/40 inline-flex h-10 items-center rounded-md border px-3 text-sm lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              {t("filters.title")}
              {activeCount > 0 ? (
                <span className="bg-accent text-background ml-2 rounded-full px-1.5 text-[10px] font-semibold">
                  {activeCount}
                </span>
              ) : null}
            </button>

            <label className="text-text/50 flex items-center gap-2 text-sm">
              <span className="hidden sm:inline">{t("sort.label")}</span>
              <select
                value={sort}
                onChange={(event) =>
                  handleSort(event.target.value as CasinoSort)
                }
                className="bg-card text-text ring-text/15 focus:ring-accent/40 h-10 rounded-md px-3 text-sm ring-1 outline-none"
              >
                <option value="rating">{t("sort.rating")}</option>
                <option value="newest">{t("sort.newest")}</option>
                <option value="bonus">{t("sort.bonus")}</option>
              </select>
            </label>
          </div>
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
            <CasinoCardList>
              {visible.map((casino) => (
                <CasinoCard
                  key={casino.id}
                  name={localize(casino.name, locale)}
                  logoUrl={casino.logoUrl}
                  rating={casino.rating}
                  badges={casino.badges.map((badge) => localize(badge, locale))}
                  highlights={casino.highlights.map((item) => ({
                    label: localize(item.label, locale),
                    value: localize(item.value, locale),
                  }))}
                  ctaHref={`/casinos/${casino.slug}`}
                  ctaLabel={t("cta")}
                />
              ))}
            </CasinoCardList>

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

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          aria-label={t("filters.close")}
          className={cn(
            "absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={cn(
            "bg-card absolute top-0 left-0 flex h-full w-[min(20rem,88vw)] flex-col overflow-y-auto p-5 shadow-2xl transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-5 flex items-center justify-between">
            <p className="text-text text-sm font-semibold tracking-tight">
              {t("filters.title")}
            </p>
            <button
              type="button"
              className="text-text/60 hover:text-text text-sm"
              onClick={() => setMobileOpen(false)}
            >
              {t("filters.close")}
            </button>
          </div>
          <FilterPanel
            filters={filters}
            onToggle={handleToggle}
            onClear={handleClear}
          />
        </aside>
      </div>
    </div>
  );
}
