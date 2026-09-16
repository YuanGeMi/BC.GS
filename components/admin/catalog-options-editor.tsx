"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { AdminConfirm } from "@/components/admin/admin-confirm";
import {
  CATALOG_KIND_META,
  type CatalogItem,
  type CatalogKind,
  type CatalogNames,
} from "@/lib/admin/catalog-kinds";
import {
  deleteCatalogItem,
  getCatalogItemUsage,
  upsertCatalogItem,
  type CatalogActionError,
} from "@/lib/admin/catalogs";
import { adminInputClass } from "@/lib/admin/fields";

const emptyNames: CatalogNames = { en: "", zh: "", th: "" };

const errorCopy: Record<CatalogActionError, string> = {
  invalidSlug: "Use a lowercase slug with letters, numbers, and hyphens.",
  duplicateSlug: "That slug is already in this catalog.",
  englishRequired: "English name is required.",
  invalidSort: "Sort order must be a whole number.",
  missing: "That option is no longer in the list.",
  inUse: "Still attached to casinos or bonuses. Detach it first.",
  payoutInUse: "Casinos still use this payout speed. Confirm to clear it on them.",
};

function usageLine(item: CatalogItem) {
  if (item.usageCount === null) return "";
  if (item.usageCount === 0) return "Unused";
  if (item.usageNames.length === 0) {
    return `${item.usageCount} in use`;
  }
  const names = item.usageNames.join(", ");
  const extra = item.usageCount > item.usageNames.length ? "…" : "";
  return `${item.usageCount} in use · ${names}${extra}`;
}

function deleteBody(kind: CatalogKind, item: CatalogItem) {
  if (item.usageCount === null) return "Checking where this option is used…";
  if (item.usageCount === 0) return "This option will leave the catalog.";
  const sample = item.usageNames.length
    ? ` (${item.usageNames.join(", ")}${item.usageCount > item.usageNames.length ? "…" : ""})`
    : "";
  if (kind === "payout") {
    return `This will clear payout speed on ${item.usageCount} casino${item.usageCount === 1 ? "" : "s"}${sample}.`;
  }
  return `Still in use by ${item.usageCount}${sample}. Detach it first.`;
}

export function CatalogOptionsEditor({
  kind,
  items,
}: {
  kind: CatalogKind;
  items: CatalogItem[];
}) {
  const meta = CATALOG_KIND_META[kind];
  const router = useRouter();
  const [createSlug, setCreateSlug] = useState("");
  const [createSort, setCreateSort] = useState("0");
  const [createNames, setCreateNames] = useState(emptyNames);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CatalogItem | null>(null);
  const [isPending, startTransition] = useTransition();

  function create() {
    startTransition(async () => {
      const result = await upsertCatalogItem(kind, {
        slug: createSlug,
        sortOrder: createSort,
        names: createNames,
      });
      if (!result.ok) {
        setError(errorCopy[result.error]);
        return;
      }
      setCreateSlug("");
      setCreateSort("0");
      setCreateNames(emptyNames);
      setError(null);
      router.refresh();
    });
  }

  function save(item: CatalogItem, sortOrder: string, names: CatalogNames) {
    startTransition(async () => {
      const result = await upsertCatalogItem(kind, {
        id: item.id,
        slug: item.slug,
        sortOrder,
        names,
      });
      if (!result.ok) {
        setError(errorCopy[result.error]);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  function openDelete(item: CatalogItem) {
    setPendingDelete(item);
    startTransition(async () => {
      const usage = await getCatalogItemUsage(kind, item.id);
      if (!usage) {
        setPendingDelete(null);
        setError(errorCopy.missing);
        return;
      }
      setPendingDelete((current) =>
        current?.id === usage.id ? usage : current,
      );
    });
  }

  function remove(item: CatalogItem, confirmPayout: boolean) {
    startTransition(async () => {
      const result = await deleteCatalogItem(kind, item.id, confirmPayout);
      if (!result.ok) {
        if (result.error === "payoutInUse" && !confirmPayout) {
          setPendingDelete({
            ...item,
            usageNames: result.usageNames ?? item.usageNames,
          });
          setError(null);
          return;
        }
        const names = result.usageNames?.length
          ? ` ${result.usageNames.join(", ")}.`
          : "";
        setError(`${errorCopy[result.error]}${names}`);
        setPendingDelete(null);
        return;
      }
      setPendingDelete(null);
      setError(null);
      router.refresh();
    });
  }

  return (
    <>
      {error ? <p className="text-accent mb-6 text-sm">{error}</p> : null}

      <div className="border-text/10 border-t pt-8">
        <p className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
          New
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-6">
          <label className="block text-xs">
            Slug
            <input
              value={createSlug}
              onChange={(event) => setCreateSlug(event.target.value)}
              className={`${adminInputClass} mt-1`}
            />
          </label>
          <label className="block text-xs">
            Sort
            <input
              value={createSort}
              onChange={(event) => setCreateSort(event.target.value)}
              className={`${adminInputClass} mt-1`}
              inputMode="numeric"
            />
          </label>
          <label className="block text-xs">
            English {meta.nameLabel.toLowerCase()}
            <input
              value={createNames.en}
              onChange={(event) =>
                setCreateNames((current) => ({ ...current, en: event.target.value }))
              }
              className={`${adminInputClass} mt-1`}
            />
          </label>
          <label className="block text-xs">
            Chinese
            <input
              value={createNames.zh}
              onChange={(event) =>
                setCreateNames((current) => ({ ...current, zh: event.target.value }))
              }
              className={`${adminInputClass} mt-1`}
            />
          </label>
          <label className="block text-xs">
            Thai
            <input
              value={createNames.th}
              onChange={(event) =>
                setCreateNames((current) => ({ ...current, th: event.target.value }))
              }
              className={`${adminInputClass} mt-1`}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              disabled={isPending}
              onClick={create}
              className="bg-accent text-background hover:bg-accent-highlight h-11 px-4 text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <ul className="mt-12 space-y-8">
        {items.map((item) => (
          <CatalogOptionRow
            key={item.id}
            kind={kind}
            item={item}
            pending={isPending}
            onSave={save}
            onDelete={() => openDelete(item)}
          />
        ))}
      </ul>

      {pendingDelete ? (
        <AdminConfirm
          title={`Delete ${pendingDelete.names.en || pendingDelete.slug}?`}
          body={deleteBody(kind, pendingDelete)}
          confirmLabel={
            pendingDelete.usageCount === null
              ? "Delete"
              : pendingDelete.usageCount > 0 && kind !== "payout"
                ? "Close"
                : "Delete"
          }
          pending={isPending || pendingDelete.usageCount === null}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            if (pendingDelete.usageCount === null) return;
            if (pendingDelete.usageCount > 0 && kind !== "payout") {
              setPendingDelete(null);
              return;
            }
            remove(
              pendingDelete,
              kind === "payout" && pendingDelete.usageCount > 0,
            );
          }}
        />
      ) : null}
    </>
  );
}

function CatalogOptionRow({
  kind,
  item,
  pending,
  onSave,
  onDelete,
}: {
  kind: CatalogKind;
  item: CatalogItem;
  pending: boolean;
  onSave: (item: CatalogItem, sortOrder: string, names: CatalogNames) => void;
  onDelete: () => void;
}) {
  const meta = CATALOG_KIND_META[kind];
  const [sortOrder, setSortOrder] = useState(String(item.sortOrder));
  const [names, setNames] = useState(item.names);

  return (
    <li className="border-text/10 border-t pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-mono text-sm">{item.slug}</p>
        <p className="text-text/45 text-xs">{usageLine(item)}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <label className="block text-xs">
          Sort
          <input
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className={`${adminInputClass} mt-1`}
            inputMode="numeric"
          />
        </label>
        <label className="block text-xs">
          English {meta.nameLabel.toLowerCase()}
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
        <div className="flex items-end gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => onSave(item, sortOrder, names)}
            className="text-accent hover:text-accent-highlight h-11 text-sm font-medium"
          >
            Save
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            className="text-text/45 hover:text-text h-11 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
