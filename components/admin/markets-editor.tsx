"use client";

import { useEffect, useState, useTransition } from "react";

import {
  searchAdminMarkets,
  updateMarketNames,
  type AdminMarketRow,
} from "@/lib/admin/catalogs";
import { adminInputClass } from "@/lib/admin/fields";
import type { CatalogNames } from "@/lib/admin/catalog-kinds";

export function MarketsEditor() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AdminMarketRow[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setRows([]);
      setReady(false);
      return;
    }
    setReady(false);
    const handle = window.setTimeout(() => {
      startTransition(async () => {
        const next = await searchAdminMarkets(q);
        setRows(next);
        setReady(true);
      });
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query]);

  function save(id: string, names: CatalogNames) {
    startTransition(async () => {
      const result = await updateMarketNames(id, names);
      if (!result.ok) {
        setError(
          result.error === "englishRequired"
            ? "English name is required."
            : "That market is no longer in the list.",
        );
        return;
      }
      setError(null);
      const next = await searchAdminMarkets(query);
      setRows(next);
    });
  }

  return (
    <>
      <label className="mt-10 block max-w-md text-xs">
        Search by code or name
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={`${adminInputClass} mt-1`}
          placeholder="TH, Thailand…"
        />
      </label>
      {error ? <p className="text-accent mt-4 text-sm">{error}</p> : null}
      {query.trim().length > 0 && query.trim().length < 2 ? (
        <p className="text-text/45 mt-6 text-sm">Type at least two characters.</p>
      ) : null}
      {query.trim().length >= 2 && ready && !isPending && rows.length === 0 ? (
        <p className="text-text/45 mt-6 text-sm">No markets match.</p>
      ) : null}

      <ul className="mt-8 space-y-8">
        {rows.map((row) => (
          <MarketRow
            key={row.id}
            row={row}
            pending={isPending}
            onSave={save}
          />
        ))}
      </ul>
    </>
  );
}

function MarketRow({
  row,
  pending,
  onSave,
}: {
  row: AdminMarketRow;
  pending: boolean;
  onSave: (id: string, names: CatalogNames) => void;
}) {
  const [names, setNames] = useState(row.names);

  useEffect(() => {
    setNames(row.names);
  }, [row.id, row.names.en, row.names.zh, row.names.th]);

  return (
    <li className="border-text/10 border-t pt-6">
      <p className="font-mono text-sm">{row.code}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <label className="block text-xs">
          English
          <input
            value={names.en}
            onChange={(event) =>
              setNames((current) => ({ ...current, en: event.target.value }))
            }
            className={`${adminInputClass} mt-1`}
          />
        </label>
        <label className="block text-xs">
          Chinese
          <input
            value={names.zh}
            onChange={(event) =>
              setNames((current) => ({ ...current, zh: event.target.value }))
            }
            className={`${adminInputClass} mt-1`}
          />
        </label>
        <label className="block text-xs">
          Thai
          <input
            value={names.th}
            onChange={(event) =>
              setNames((current) => ({ ...current, th: event.target.value }))
            }
            className={`${adminInputClass} mt-1`}
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            disabled={pending}
            onClick={() => onSave(row.id, names)}
            className="text-accent hover:text-accent-highlight h-11 text-sm font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </li>
  );
}
