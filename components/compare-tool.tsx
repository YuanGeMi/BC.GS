"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { RatingStars } from "@/components/rating-stars";
import {
  toCasinoProfile,
  type CasinoProfile,
  type CasinoScores,
} from "@/data/casino-details";
import { localize, type MockCasino } from "@/data/mock-casinos";
import { useRouter } from "@/i18n/navigation";
import {
  COMPARE_MAX,
  COMPARE_PARAM,
  parseCompareSlugs,
  serializeCompareSlots,
  setCompareSlot,
  suggestedCompareCasinos,
  toCompareSlots,
  type CompareSlots,
} from "@/lib/compare";
import { cn } from "@/lib/utils";

const SCORE_KEYS = [
  "bonuses",
  "gameVariety",
  "support",
  "payoutSpeed",
  "trust",
] as const satisfies ReadonlyArray<keyof CasinoScores>;

type Props = {
  locale: string;
  casinos: MockCasino[];
  initialQuery?: string;
};

export function CompareTool({ locale, casinos, initialQuery }: Props) {
  const tFilters = useTranslations("CasinosPage");
  const router = useRouter();
  const searchParams = useSearchParams();

  const validSlugs = useMemo(
    () => new Set(casinos.map((casino) => casino.slug)),
    [casinos],
  );

  const urlKey = searchParams.get(COMPARE_PARAM) ?? initialQuery ?? "";

  const [slots, setSlots] = useState<CompareSlots>(() =>
    toCompareSlots(parseCompareSlugs(urlKey, validSlugs)),
  );

  useEffect(() => {
    const next = toCompareSlots(parseCompareSlugs(urlKey, validSlugs));
    setSlots((current) =>
      serializeCompareSlots(current) === serializeCompareSlots(next)
        ? current
        : next,
    );
  }, [urlKey, validSlugs]);

  const selected = useMemo(
    () =>
      slots
        .filter((slug): slug is string => Boolean(slug))
        .map((slug) => {
          const casino = casinos.find((item) => item.slug === slug);
          return casino ? toCasinoProfile(casino) : undefined;
        })
        .filter((item): item is CasinoProfile => Boolean(item)),
    [casinos, slots],
  );

  const selectedSet = useMemo(
    () => new Set(selected.map((casino) => casino.slug)),
    [selected],
  );

  const suggestions = useMemo(
    () => suggestedCompareCasinos(casinos, selectedSet, COMPARE_MAX),
    [casinos, selectedSet],
  );

  function commit(next: CompareSlots) {
    setSlots(next);
    const query = serializeCompareSlots(next);
    if (query === (searchParams.get(COMPARE_PARAM) ?? "")) return;

    router.replace(
      query
        ? { pathname: "/compare", query: { [COMPARE_PARAM]: query } }
        : "/compare",
      { scroll: false },
    );
  }

  function selectAt(index: number, slug: string) {
    commit(setCompareSlot(slots, index, slug));
  }

  function clearAt(index: number) {
    commit(setCompareSlot(slots, index, null));
  }

  function addSuggested(slug: string) {
    const emptyIndex = slots.findIndex((item) => !item);
    if (emptyIndex === -1) return;
    commit(setCompareSlot(slots, emptyIndex, slug));
  }

  return (
    <div>
      <div className="flex flex-col gap-2 md:grid md:grid-cols-3 md:gap-3">
        {slots.map((slug, index) => {
          const casino = selected.find((item) => item.slug === slug);

          return (
            <CasinoSlot
              key={index}
              index={index}
              locale={locale}
              casino={casino}
              options={casinos.filter((item) => !selectedSet.has(item.slug))}
              onSelect={(next) => selectAt(index, next)}
              onClear={() => clearAt(index)}
            />
          );
        })}
      </div>

      {selected.length >= 2 ? (
        <ComparisonTable
          locale={locale}
          casinos={selected}
          licenseLabel={(id) => tFilters(`licenses.${id}`)}
          paymentLabel={(id) => tFilters(`payments.${id}`)}
          providerLabel={(id) => tFilters(`providers.${id}`)}
        />
      ) : (
        <EmptyCompare
          selectedCount={selected.length}
          suggestions={suggestions}
          locale={locale}
          canAdd={selected.length < COMPARE_MAX}
          onAdd={addSuggested}
        />
      )}
    </div>
  );
}

function CasinoSlot({
  index,
  locale,
  casino,
  options,
  onSelect,
  onClear,
}: {
  index: number;
  locale: string;
  casino?: CasinoProfile;
  options: MockCasino[];
  onSelect: (slug: string) => void;
  onClear: () => void;
}) {
  const t = useTranslations("ComparePage");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((item) =>
      localize(item.name, locale).toLowerCase().includes(needle),
    );
  }, [locale, options, query]);

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      inputRef.current?.focus();
    }
  }, [open]);

  const name = casino ? localize(casino.name, locale) : "";

  return (
    <div
      ref={rootRef}
      className={cn(
        "bg-card/50 relative rounded-xl p-3 ring-1 transition-colors duration-200 md:p-4",
        casino ? "ring-text/10" : "ring-text/8",
        open && "ring-accent/35",
      )}
    >
      <div className="flex items-center gap-3 md:block">
        <p className="text-text/40 w-16 shrink-0 text-[11px] font-medium tracking-[0.16em] uppercase md:mb-3 md:w-auto">
          {t("slots.label", { n: index + 1 })}
        </p>

        <div className="min-w-0 flex-1">
          {casino && !open ? (
            <div className="flex items-center gap-3 md:items-start">
              <LogoMark name={name} logoUrl={casino.logoUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-text truncate text-sm font-semibold tracking-tight">
                  {name}
                </p>
                <RatingStars
                  rating={casino.rating}
                  showValue
                  size="sm"
                  className="mt-1 hidden md:inline-flex"
                />
                <div className="mt-0 flex flex-wrap gap-3 md:mt-3 md:gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="text-text/50 hover:text-accent text-xs transition-colors"
                  >
                    {t("slots.change")}
                  </button>
                  <button
                    type="button"
                    onClick={onClear}
                    className="text-text/50 hover:text-text text-xs transition-colors"
                  >
                    {t("slots.clear")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="border-text/15 text-text/45 hover:border-accent/40 hover:text-text/70 flex h-11 w-full items-center justify-center rounded-lg border border-dashed px-3 text-sm transition-colors md:h-16"
            >
              {casino ? name : t("slots.empty")}
            </button>
          )}
        </div>
      </div>

      {open ? (
        <div className="bg-card ring-text/12 fixed inset-x-4 bottom-4 z-40 overflow-hidden rounded-lg shadow-[0_16px_40px_-20px_rgba(0,0,0,0.65)] ring-1 md:absolute md:inset-x-3 md:top-full md:bottom-auto md:z-30 md:mt-2">
          <label className="sr-only" htmlFor={`compare-search-${index}`}>
            {t("slots.placeholder")}
          </label>
          <input
            id={`compare-search-${index}`}
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("slots.placeholder")}
            className="text-text placeholder:text-text/35 w-full border-b border-text/8 bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <ul className="max-h-[50vh] overflow-y-auto py-1 md:max-h-56" role="listbox">
            {filtered.length === 0 ? (
              <li className="text-text/45 px-3 py-3 text-sm">
                {t("slots.noResults")}
              </li>
            ) : (
              filtered.map((item) => {
                const itemName = localize(item.name, locale);

                return (
                  <li key={item.slug}>
                    <button
                      type="button"
                      role="option"
                      onClick={() => {
                        onSelect(item.slug);
                        setOpen(false);
                      }}
                      className="hover:bg-text/5 flex w-full items-center gap-3 px-3 py-2 text-left transition-colors"
                    >
                      <LogoMark name={itemName} logoUrl={item.logoUrl} size="xs" />
                      <span className="min-w-0 flex-1">
                        <span className="text-text block truncate text-sm font-medium">
                          {itemName}
                        </span>
                        <span className="text-text/40 text-xs tabular-nums">
                          {item.rating.toFixed(1)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function EmptyCompare({
  selectedCount,
  suggestions,
  locale,
  canAdd,
  onAdd,
}: {
  selectedCount: number;
  suggestions: MockCasino[];
  locale: string;
  canAdd: boolean;
  onAdd: (slug: string) => void;
}) {
  const t = useTranslations("ComparePage");

  return (
    <div className="bg-card/40 ring-text/8 mt-8 rounded-xl px-4 py-8 text-center ring-1 md:mt-10 md:px-10 md:py-10">
      <p className="text-text text-lg font-semibold tracking-tight md:text-xl">
        {selectedCount === 1 ? t("empty.needOneMore") : t("empty.title")}
      </p>
      <p className="text-text/55 mx-auto mt-2 max-w-md text-sm leading-relaxed">
        {t("empty.body")}
      </p>

      {canAdd && suggestions.length > 0 ? (
        <div className="mt-8">
          <p className="text-text/40 mb-3 text-[11px] font-medium tracking-[0.16em] uppercase">
            {t("empty.suggested")}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((casino) => (
              <Button
                key={casino.slug}
                variant="secondary"
                size="sm"
                onClick={() => onAdd(casino.slug)}
              >
                {localize(casino.name, locale)}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ComparisonTable({
  locale,
  casinos,
  licenseLabel,
  paymentLabel,
  providerLabel,
}: {
  locale: string;
  casinos: CasinoProfile[];
  licenseLabel: (id: CasinoProfile["licenses"][number]) => string;
  paymentLabel: (id: CasinoProfile["payments"][number]) => string;
  providerLabel: (id: CasinoProfile["providers"][number]) => string;
}) {
  const t = useTranslations("ComparePage");
  const bestRating = Math.max(...casinos.map((casino) => casino.rating));
  const names = casinos.map((casino) => localize(casino.name, locale));

  const lines: Array<{
    id: string;
    label: string;
    muted?: boolean;
    values: ReactNode[];
  }> = [
    {
      id: "rating",
      label: t("table.rating"),
      values: casinos.map((casino) => (
        <span
          key={casino.slug}
          className={casino.rating === bestRating ? "text-accent" : undefined}
        >
          <RatingStars rating={casino.rating} showValue size="sm" />
        </span>
      )),
    },
    {
      id: "license",
      label: t("table.license"),
      muted: true,
      values: casinos.map((casino) => casino.licenses.map(licenseLabel).join(" · ")),
    },
    {
      id: "established",
      label: t("table.established"),
      values: casinos.map((casino) => casino.establishedYear),
    },
    {
      id: "minDeposit",
      label: t("table.minDeposit"),
      muted: true,
      values: casinos.map((casino) => localize(casino.minDeposit, locale)),
    },
    {
      id: "withdrawal",
      label: t("table.withdrawal"),
      values: casinos.map((casino) => localize(casino.withdrawalTime, locale)),
    },
    {
      id: "payments",
      label: t("table.payments"),
      muted: true,
      values: casinos.map((casino) => (
        <div key={casino.slug} className="flex flex-wrap justify-start gap-1.5">
          {casino.payments.map((id) => (
            <Badge key={id}>{paymentLabel(id)}</Badge>
          ))}
        </div>
      )),
    },
    {
      id: "providers",
      label: t("table.providers"),
      values: casinos.map((casino) => casino.providers.map(providerLabel).join(" · ")),
    },
    {
      id: "bonus",
      label: t("table.bonus"),
      muted: true,
      values: casinos.map((casino) => (
        <div key={casino.slug} className="text-right md:text-left">
          <p className="text-accent font-medium">
            {localize(casino.bonusTerms.value, locale)}
          </p>
          <p className="text-text/45 mt-1 text-xs">
            {t("table.wagering")}: {localize(casino.bonusTerms.wagering, locale)}
          </p>
        </div>
      )),
    },
    ...SCORE_KEYS.map((key) => {
      const best = Math.max(...casinos.map((casino) => casino.scores[key]));

      return {
        id: key,
        label: t(`table.${key}`),
        muted: key === "gameVariety" || key === "payoutSpeed",
        values: casinos.map((casino) => (
          <div
            key={casino.slug}
            className={cn(
              "w-full",
              casino.scores[key] === best && "text-accent",
            )}
          >
            <ScoreBar value={casino.scores[key]} />
          </div>
        )),
      };
    }),
    {
      id: "pros",
      label: t("table.pros"),
      muted: true,
      values: casinos.map((casino) => (
        <ul key={casino.slug} className="space-y-2">
          {casino.pros.slice(0, 2).map((item) => (
            <li
              key={localize(item, locale)}
              className="flex gap-2 text-sm leading-relaxed"
            >
              <span className="text-accent mt-0.5 shrink-0" aria-hidden>
                ✓
              </span>
              <span className="text-text/70">{localize(item, locale)}</span>
            </li>
          ))}
        </ul>
      )),
    },
    {
      id: "cons",
      label: t("table.cons"),
      values: casinos.map((casino) => (
        <ul key={casino.slug} className="space-y-2">
          {casino.cons.slice(0, 2).map((item) => (
            <li
              key={localize(item, locale)}
              className="flex gap-2 text-sm leading-relaxed"
            >
              <span className="text-text/35 mt-0.5 shrink-0" aria-hidden>
                ×
              </span>
              <span className="text-text/70">{localize(item, locale)}</span>
            </li>
          ))}
        </ul>
      )),
    },
  ];

  return (
    <div className="mt-8 md:mt-10">
      <div className="md:hidden">
        <div className="flex flex-col gap-2">
          {casinos.map((casino, index) => (
            <div
              key={casino.slug}
              className="bg-card/50 ring-text/8 flex items-center gap-2 rounded-lg px-2.5 py-2 ring-1"
            >
              <LogoMark name={names[index]} logoUrl={casino.logoUrl} size="xs" />
              <p className="text-text text-xs font-semibold">{names[index]}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-5">
          {lines.map((line) =>
            line.id === "bonus" ? (
              <MobileBonusCompare
                key={line.id}
                label={line.label}
                casinos={casinos}
                names={names}
                locale={locale}
                wageringLabel={t("table.wagering")}
                minDepositLabel={t("table.minDeposit")}
              />
            ) : isScoreLine(line.id) ? (
              <MobileScoreCompare
                key={line.id}
                label={line.label}
                muted={line.muted}
                casinos={casinos}
                names={names}
                scoreKey={line.id}
              />
            ) : line.id === "pros" || line.id === "cons" ? (
              <MobileVerdictCompare
                key={line.id}
                label={line.label}
                muted={line.muted}
                casinos={casinos}
                names={names}
                locale={locale}
                kind={line.id}
              />
            ) : isWrapLine(line.id) ? (
              <MobileWrapCompare
                key={line.id}
                id={line.id}
                label={line.label}
                muted={line.muted}
                casinos={casinos}
                names={names}
                licenseLabel={licenseLabel}
                paymentLabel={paymentLabel}
                providerLabel={providerLabel}
              />
            ) : (
              <div
                key={line.id}
                className={line.muted ? "bg-text/[0.02] -mx-4 px-4 py-3" : undefined}
              >
                <p className="text-text/40 text-[11px] font-medium tracking-[0.14em] uppercase">
                  {line.label}
                </p>
                <ul className="mt-2 divide-text/8 divide-y">
                  {casinos.map((casino, index) => (
                    <li
                      key={casino.slug}
                      className="flex items-start justify-between gap-4 py-2.5"
                    >
                      <span className="text-text/50 w-[6.5rem] shrink-0 truncate text-sm">
                        {names[index]}
                      </span>
                      <div className="text-text min-w-0 flex-1 text-right text-sm">
                        {line.values[index]}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>

        <div className="mt-6 space-y-3">
          {casinos.map((casino, index) => (
            <div key={casino.slug} className="grid grid-cols-2 gap-2">
              <p className="text-text col-span-2 text-sm font-semibold">
                {names[index]}
              </p>
              <Button
                href={casino.affiliateUrl}
                size="sm"
                className="w-full"
                trackClick={{ casinoId: casino.id, locale }}
              >
                {t("table.visit")}
              </Button>
              <Button
                href={`/casinos/${casino.slug}`}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                {t("table.review")}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden overflow-x-auto overscroll-x-contain md:block">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <colgroup>
            <col className="w-36 min-w-36" />
            {casinos.map((casino) => (
              <col key={casino.slug} className="min-w-52" />
            ))}
          </colgroup>

          <thead>
            <tr>
              <Th sticky corner>
                <span className="sr-only">{t("table.attribute")}</span>
              </Th>
              {casinos.map((casino, index) => (
                <th
                  key={casino.slug}
                  scope="col"
                  className="border-text/8 border-b px-3 py-4 text-left align-top"
                >
                  <div className="flex items-center gap-3">
                    <LogoMark name={names[index]} logoUrl={casino.logoUrl} size="sm" />
                    <div className="min-w-0">
                      <p className="text-text truncate text-sm font-semibold tracking-tight normal-case">
                        {names[index]}
                      </p>
                      {casino.badges[0] ? (
                        <div className="mt-1">
                          <Badge>{localize(casino.badges[0], locale)}</Badge>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {lines.map((line) => (
              <CompareRow key={line.id} label={line.label} muted={line.muted}>
                {casinos.map((casino, index) => (
                  <Td key={casino.slug}>{line.values[index]}</Td>
                ))}
              </CompareRow>
            ))}

            <tr>
              <Th sticky className="align-middle">
                {t("table.visit")}
              </Th>
              {casinos.map((casino) => (
                <Td key={casino.slug}>
                  <div className="flex flex-col gap-2">
                    <Button
                      href={casino.affiliateUrl}
                      size="sm"
                      className="w-full"
                      trackClick={{ casinoId: casino.id, locale }}
                    >
                      {t("table.visit")}
                    </Button>
                    <Button
                      href={`/casinos/${casino.slug}`}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      {t("table.review")}
                    </Button>
                  </div>
                </Td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  muted,
  children,
}: {
  label: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <tr className={muted ? "bg-text/[0.02]" : undefined}>
      <Th sticky>{label}</Th>
      {children}
    </tr>
  );
}

function Th({
  children,
  sticky,
  corner,
  className,
}: {
  children?: React.ReactNode;
  sticky?: boolean;
  corner?: boolean;
  className?: string;
}) {
  return (
    <th
      scope={sticky ? "row" : "col"}
      className={cn(
        "border-text/8 text-text/50 border-b px-3 py-4 text-left text-[11px] font-medium tracking-[0.14em] uppercase align-top",
        sticky &&
          "bg-background sticky left-0 z-10 w-36 min-w-36 shadow-[1px_0_0_0_rgba(232,232,232,0.08)]",
        corner && "z-20",
        className,
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  emphasize,
  className,
}: {
  children: React.ReactNode;
  emphasize?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "border-text/8 text-text border-b px-3 py-4 align-top text-sm",
        emphasize && "text-accent",
        className,
      )}
    >
      {children}
    </td>
  );
}

function isWrapLine(id: string): id is "license" | "payments" | "providers" {
  return id === "license" || id === "payments" || id === "providers";
}

function MobileWrapCompare({
  id,
  label,
  muted,
  casinos,
  names,
  licenseLabel,
  paymentLabel,
  providerLabel,
}: {
  id: "license" | "payments" | "providers";
  label: string;
  muted?: boolean;
  casinos: CasinoProfile[];
  names: string[];
  licenseLabel: (id: CasinoProfile["licenses"][number]) => string;
  paymentLabel: (id: CasinoProfile["payments"][number]) => string;
  providerLabel: (id: CasinoProfile["providers"][number]) => string;
}) {
  return (
    <div className={muted ? "bg-text/[0.02] -mx-4 px-4 py-3" : undefined}>
      <p className="text-text/40 text-[11px] font-medium tracking-[0.14em] uppercase">
        {label}
      </p>
      <ul className="mt-3 space-y-3">
        {casinos.map((casino, index) => (
          <li key={casino.slug} className="min-w-0">
            <p className="text-text text-sm font-semibold">{names[index]}</p>
            <div className="text-text/80 mt-1.5 min-w-0 text-sm break-words">
              {id === "payments" ? (
                <div className="flex flex-wrap gap-1.5">
                  {casino.payments.map((paymentId) => (
                    <Badge key={paymentId} wrap>
                      {paymentLabel(paymentId)}
                    </Badge>
                  ))}
                </div>
              ) : id === "license" ? (
                casino.licenses.map(licenseLabel).join(" · ")
              ) : (
                casino.providers.map(providerLabel).join(" · ")
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function isScoreLine(id: string): id is (typeof SCORE_KEYS)[number] {
  return (SCORE_KEYS as readonly string[]).includes(id);
}

function MobileScoreCompare({
  label,
  muted,
  casinos,
  names,
  scoreKey,
}: {
  label: string;
  muted?: boolean;
  casinos: CasinoProfile[];
  names: string[];
  scoreKey: keyof CasinoScores;
}) {
  const best = Math.max(...casinos.map((casino) => casino.scores[scoreKey]));

  return (
    <div className={muted ? "bg-text/[0.02] -mx-4 px-4 py-3" : undefined}>
      <p className="text-text/40 text-[11px] font-medium tracking-[0.14em] uppercase">
        {label}
      </p>
      <ul className="mt-2 divide-text/8 divide-y">
        {casinos.map((casino, index) => {
          const value = casino.scores[scoreKey];

          return (
            <li key={casino.slug} className="py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-text/50 truncate text-sm">{names[index]}</span>
                <span
                  className={cn(
                    "text-sm tabular-nums",
                    value === best ? "text-accent" : "text-text",
                  )}
                >
                  {value.toFixed(1)}
                </span>
              </div>
              <ScoreBar value={value} showValue={false} className="mt-1.5" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MobileVerdictCompare({
  label,
  muted,
  casinos,
  names,
  locale,
  kind,
}: {
  label: string;
  muted?: boolean;
  casinos: CasinoProfile[];
  names: string[];
  locale: string;
  kind: "pros" | "cons";
}) {
  const positive = kind === "pros";

  return (
    <div className={muted ? "bg-text/[0.02] -mx-4 px-4 py-3" : undefined}>
      <p className="text-text/40 text-[11px] font-medium tracking-[0.14em] uppercase">
        {label}
      </p>
      <ul className="mt-3 space-y-4">
        {casinos.map((casino, index) => (
          <li key={casino.slug}>
            <p className="text-text text-sm font-semibold">{names[index]}</p>
            <ul className="mt-2 space-y-2">
              {casino[kind].slice(0, 2).map((item) => (
                <li
                  key={localize(item, locale)}
                  className="flex gap-2 text-sm leading-relaxed"
                >
                  <span
                    className={cn(
                      "mt-0.5 shrink-0",
                      positive ? "text-accent" : "text-text/35",
                    )}
                    aria-hidden
                  >
                    {positive ? "✓" : "×"}
                  </span>
                  <span className="text-text/70 min-w-0">{localize(item, locale)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileBonusCompare({
  label,
  casinos,
  names,
  locale,
  wageringLabel,
  minDepositLabel,
}: {
  label: string;
  casinos: CasinoProfile[];
  names: string[];
  locale: string;
  wageringLabel: string;
  minDepositLabel: string;
}) {
  return (
    <div className="bg-text/[0.02] -mx-4 w-[calc(100%+2rem)] py-3 sm:-mx-6 sm:w-[calc(100%+3rem)]">
      <p className="text-text/40 px-4 text-[11px] font-medium tracking-[0.14em] uppercase">
        {label}
      </p>
      <ul className="mt-2 w-full space-y-2">
        {casinos.map((casino, index) => (
          <li
            key={casino.slug}
            className="bg-card/70 ring-text/8 w-full px-4 py-2.5 ring-1"
          >
            <p className="text-text/50 truncate text-[11px] font-medium tracking-[0.12em] uppercase">
              {names[index]}
            </p>
            <p className="text-text mt-0.5 truncate text-sm font-semibold tracking-tight">
              {localize(casino.bonusTerms.title, locale)}
            </p>
            <p className="text-accent mt-0.5 text-sm font-semibold tracking-tight">
              {localize(casino.bonusTerms.value, locale)}
            </p>
            <dl className="border-text/8 mt-2 grid grid-cols-2 gap-3 border-t pt-2">
              <div>
                <dt className="text-text/40 text-[10px] tracking-[0.12em] uppercase">
                  {wageringLabel}
                </dt>
                <dd className="text-text mt-0.5 text-xs font-medium">
                  {localize(casino.bonusTerms.wagering, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-text/40 text-[10px] tracking-[0.12em] uppercase">
                  {minDepositLabel}
                </dt>
                <dd className="text-text mt-0.5 text-xs font-medium">
                  {localize(casino.bonusTerms.minDeposit, locale)}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreBar({
  value,
  showValue = true,
  className,
}: {
  value: number;
  showValue?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {showValue ? <p className="tabular-nums">{value.toFixed(1)}</p> : null}
      <div className={cn("bg-text/8 h-1 overflow-hidden rounded-full", showValue && "mt-1.5")}>
        <div
          className="bg-accent h-full rounded-full"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

function LogoMark({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl?: string;
  size?: "xs" | "sm" | "md";
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const box =
    size === "xs" ? "h-8 w-8 text-[10px]" : size === "sm" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm";

  if (logoUrl) {
    const px = size === "xs" ? 32 : size === "sm" ? 40 : 48;
    return (
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={px}
        height={px}
        className={cn(box, "rounded-md object-contain")}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "from-accent/20 to-accent/5 text-accent ring-accent/20 flex items-center justify-center rounded-md bg-gradient-to-br font-semibold tracking-wide ring-1",
        box,
      )}
    >
      {initials || "BC"}
    </div>
  );
}
