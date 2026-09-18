"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, useTransition } from "react";

import { searchAdminMarkets } from "@/lib/admin/catalogs";
import type { AdminMarketOption } from "@/lib/admin/casinos";
import type { CasinoMarketDraft } from "@/lib/admin/casino-input";
import { adminInputClass, adminSelectClass } from "@/lib/admin/fields";

export function CasinoMarketTable({
  initialOptions = [],
  value,
  onChange,
}: {
  initialOptions?: AdminMarketOption[];
  value: CasinoMarketDraft[];
  onChange: (next: CasinoMarketDraft[]) => void;
}) {
  const t = useTranslations("Admin.casinos.editor");
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<AdminMarketOption[]>([]);
  const [known, setKnown] = useState(() => new Map(initialOptions.map((row) => [row.id, row])));
  const [isPending, startTransition] = useTransition();

  const selected = useMemo(
    () => new Set(value.map((row) => row.marketId)),
    [value],
  );

  useEffect(() => {
    setKnown((current) => {
      const next = new Map(current);
      for (const row of initialOptions) next.set(row.id, row);
      return next;
    });
  }, [initialOptions]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setMatches([]);
      return;
    }
    const handle = window.setTimeout(() => {
      startTransition(async () => {
        const rows = await searchAdminMarkets(q);
        const options = rows.map((row) => ({
          id: row.id,
          code: row.code,
          name: row.names.en || row.code,
        }));
        setKnown((current) => {
          const next = new Map(current);
          for (const row of options) next.set(row.id, row);
          return next;
        });
        setMatches(options.filter((row) => !selected.has(row.id)).slice(0, 8));
      });
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query, selected]);

  function add(marketId: string) {
    if (selected.has(marketId)) return;
    onChange([
      ...value,
      {
        marketId,
        status: "available",
        affiliateLink: "",
      },
    ]);
    setQuery("");
    setMatches([]);
  }

  function patch(marketId: string, next: Partial<CasinoMarketDraft>) {
    onChange(
      value.map((row) =>
        row.marketId === marketId ? { ...row, ...next } : row,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("marketSearch")}
        className={adminInputClass}
        aria-label={t("marketSearchAria")}
      />
      {query.trim().length > 0 && query.trim().length < 2 ? (
        <p className="text-text/40 text-xs">{t("marketHint")}</p>
      ) : null}
      {query.trim().length >= 2 ? (
        <ul className="border-text/10 divide-text/8 divide-y border">
          {matches.length === 0 && !isPending ? (
            <li className="text-text/45 px-3 py-2 text-sm">
              {t("marketNoMatch")}
            </li>
          ) : (
            matches.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => add(row.id)}
                  className="hover:bg-text/5 flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                >
                  <span>{row.name}</span>
                  <span className="text-text/40 text-xs tracking-wide uppercase">
                    {row.code}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : query.trim().length === 0 ? (
        <p className="text-text/40 text-xs">{t("marketHint")}</p>
      ) : null}

      {value.length > 0 ? (
        <div className="border-text/10 overflow-x-auto border-t">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
                <th className="py-3 pr-3 font-medium">{t("marketColumn")}</th>
                <th className="py-3 pr-3 font-medium">{t("accessColumn")}</th>
                <th className="py-3 pr-3 font-medium">{t("overrideColumn")}</th>
                <th className="py-3 font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {value.map((row) => {
                const meta = known.get(row.marketId);
                return (
                  <tr key={row.marketId} className="border-text/8 border-t">
                    <td className="py-3 pr-3">
                      {meta?.name ?? row.marketId}
                      <span className="text-text/35 ml-2 text-[11px] tracking-wide uppercase">
                        {meta?.code}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <select
                        value={row.status}
                        onChange={(event) =>
                          patch(row.marketId, {
                            status: event.target
                              .value as CasinoMarketDraft["status"],
                          })
                        }
                        className={adminSelectClass}
                      >
                        <option value="available">{t("available")}</option>
                        <option value="restricted">{t("restricted")}</option>
                      </select>
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        value={row.affiliateLink}
                        onChange={(event) =>
                          patch(row.marketId, {
                            affiliateLink: event.target.value,
                          })
                        }
                        className={adminInputClass}
                        placeholder={t("overridePlaceholder")}
                      />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onChange(
                            value.filter(
                              (item) => item.marketId !== row.marketId,
                            ),
                          )
                        }
                        className="text-text/45 hover:text-accent text-xs"
                      >
                        {t("remove")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
