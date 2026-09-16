"use client";

import { useMemo, useState } from "react";

import { adminInputClass, adminSelectClass } from "@/lib/admin/fields";
import type { AdminMarketOption } from "@/lib/admin/casinos";
import type { CasinoMarketDraft } from "@/lib/admin/casino-input";

export function CasinoMarketTable({
  options,
  value,
  onChange,
}: {
  options: AdminMarketOption[];
  value: CasinoMarketDraft[];
  onChange: (next: CasinoMarketDraft[]) => void;
}) {
  const [query, setQuery] = useState("");
  const selected = new Set(value.map((row) => row.marketId));
  const byId = useMemo(
    () => new Map(options.map((row) => [row.id, row])),
    [options],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 8);
    return options
      .filter(
        (row) =>
          !selected.has(row.id) &&
          (row.code.toLowerCase().includes(q) ||
            row.name.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [options, query, selected]);

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
  }

  function patch(marketId: string, next: Partial<CasinoMarketDraft>) {
    onChange(
      value.map((row) => (row.marketId === marketId ? { ...row, ...next } : row)),
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search country or ISO code"
        className={adminInputClass}
        aria-label="Search markets"
      />
      {query.trim() ? (
        <ul className="border-text/10 divide-y divide-text/8 border">
          {matches.length === 0 ? (
            <li className="text-text/45 px-3 py-2 text-sm">No matching country</li>
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
      ) : (
        <p className="text-text/40 text-xs">
          Type to add from the ISO list. Attached markets stay until you remove
          them.
        </p>
      )}

      {value.length > 0 ? (
        <div className="border-text/10 overflow-x-auto border-t">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
                <th className="py-3 pr-3 font-medium">Market</th>
                <th className="py-3 pr-3 font-medium">Access</th>
                <th className="py-3 pr-3 font-medium">Affiliate override</th>
                <th className="py-3 font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {value.map((row) => {
                const meta = byId.get(row.marketId);
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
                            status: event.target.value as CasinoMarketDraft["status"],
                          })
                        }
                        className={adminSelectClass}
                      >
                        <option value="available">
                          Available
                        </option>
                        <option value="restricted">
                          Restricted
                        </option>
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
                        placeholder="Optional URL"
                      />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onChange(value.filter((item) => item.marketId !== row.marketId))
                        }
                        className="text-text/45 hover:text-accent text-xs"
                      >
                        Remove
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
