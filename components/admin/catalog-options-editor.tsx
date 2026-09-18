"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { AdminConfirm } from "@/components/admin/admin-confirm";
import {
  type CatalogItem,
  type CatalogKind,
  type CatalogNames,
} from "@/lib/admin/catalog-kinds";
import {
  deleteCatalogItem,
  getCatalogItemUsage,
  upsertCatalogItem,
} from "@/lib/admin/catalogs";
import { adminInputClass } from "@/lib/admin/fields";

const emptyNames: CatalogNames = { en: "", zh: "", th: "" };

export function CatalogOptionsEditor({
  kind,
  items,
}: {
  kind: CatalogKind;
  items: CatalogItem[];
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [createSlug, setCreateSlug] = useState("");
  const [createSort, setCreateSort] = useState("0");
  const [createNames, setCreateNames] = useState(emptyNames);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CatalogItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const nameLabel = t(`catalogs.kinds.${kind}.nameLabel`);

  function err(code: string, usageNames?: string[]) {
    const base = t.has(`errors.${code}`) ? t(`errors.${code}`) : code;
    const names = usageNames?.length ? ` ${usageNames.join(", ")}.` : "";
    return `${base}${names}`;
  }

  function usageLine(item: CatalogItem) {
    if (item.usageCount === null) return "";
    if (item.usageCount === 0) return t("catalogs.unused");
    if (item.usageNames.length === 0) {
      return t("catalogs.inUse", { count: item.usageCount });
    }
    const names =
      item.usageNames.join(", ") +
      (item.usageCount > item.usageNames.length ? "…" : "");
    return t("catalogs.inUseWithNames", {
      count: item.usageCount,
      names,
    });
  }

  function deleteBody(item: CatalogItem) {
    if (item.usageCount === null) return t("catalogs.deleteChecking");
    if (item.usageCount === 0) return t("catalogs.deleteUnused");
    const sample = item.usageNames.length
      ? ` (${item.usageNames.join(", ")}${item.usageCount > item.usageNames.length ? "…" : ""})`
      : "";
    if (kind === "payout") {
      return t("catalogs.deletePayout", {
        count: item.usageCount,
        sample,
      });
    }
    return t("catalogs.deleteInUse", {
      count: item.usageCount,
      sample,
    });
  }

  function create() {
    startTransition(async () => {
      const result = await upsertCatalogItem(kind, {
        slug: createSlug,
        sortOrder: createSort,
        names: createNames,
      });
      if (!result.ok) {
        setError(err(result.error));
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
        setError(err(result.error));
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
        setError(err("missing"));
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
        setError(err(result.error, result.usageNames));
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
          {t("catalogs.new")}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-6">
          <label className="block text-xs">
            {t("catalogs.slug")}
            <input
              value={createSlug}
              onChange={(event) => setCreateSlug(event.target.value)}
              className={`${adminInputClass} mt-1`}
            />
          </label>
          <label className="block text-xs">
            {t("catalogs.sort")}
            <input
              value={createSort}
              onChange={(event) => setCreateSort(event.target.value)}
              className={`${adminInputClass} mt-1`}
              inputMode="numeric"
            />
          </label>
          <label className="block text-xs">
            {t("catalogs.englishNameLabel", {
              label: nameLabel.toLowerCase(),
            })}
            <input
              value={createNames.en}
              onChange={(event) =>
                setCreateNames((current) => ({
                  ...current,
                  en: event.target.value,
                }))
              }
              className={`${adminInputClass} mt-1`}
            />
          </label>
          <label className="block text-xs">
            {t("catalogs.chinese")}
            <input
              value={createNames.zh}
              onChange={(event) =>
                setCreateNames((current) => ({
                  ...current,
                  zh: event.target.value,
                }))
              }
              className={`${adminInputClass} mt-1`}
            />
          </label>
          <label className="block text-xs">
            {t("catalogs.thai")}
            <input
              value={createNames.th}
              onChange={(event) =>
                setCreateNames((current) => ({
                  ...current,
                  th: event.target.value,
                }))
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
              {t("actions.add")}
            </button>
          </div>
        </div>
      </div>

      <ul className="mt-12 space-y-8">
        {items.map((item) => (
          <CatalogOptionRow
            key={item.id}
            item={item}
            pending={isPending}
            nameLabel={nameLabel}
            usage={usageLine(item)}
            onSave={save}
            onDelete={() => openDelete(item)}
          />
        ))}
      </ul>

      {pendingDelete ? (
        <AdminConfirm
          title={t("catalogs.deleteTitle", {
            name: pendingDelete.names.en || pendingDelete.slug,
          })}
          body={deleteBody(pendingDelete)}
          confirmLabel={
            pendingDelete.usageCount === null
              ? t("actions.delete")
              : pendingDelete.usageCount > 0 && kind !== "payout"
                ? t("actions.close")
                : t("actions.delete")
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
  item,
  pending,
  nameLabel,
  usage,
  onSave,
  onDelete,
}: {
  item: CatalogItem;
  pending: boolean;
  nameLabel: string;
  usage: string;
  onSave: (item: CatalogItem, sortOrder: string, names: CatalogNames) => void;
  onDelete: () => void;
}) {
  const t = useTranslations("Admin");
  const [sortOrder, setSortOrder] = useState(String(item.sortOrder));
  const [names, setNames] = useState(item.names);

  return (
    <li className="border-text/10 border-t pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-mono text-sm">{item.slug}</p>
        <p className="text-text/45 text-xs">{usage}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <label className="block text-xs">
          {t("catalogs.sort")}
          <input
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className={`${adminInputClass} mt-1`}
            inputMode="numeric"
          />
        </label>
        <label className="block text-xs">
          {t("catalogs.englishNameLabel", {
            label: nameLabel.toLowerCase(),
          })}
          <input
            value={names.en}
            onChange={(event) =>
              setNames((current) => ({ ...current, en: event.target.value }))
            }
            className={`${adminInputClass} mt-1`}
          />
        </label>
        <label className="block text-xs">
          {t("catalogs.chinese")}
          <input
            value={names.zh}
            onChange={(event) =>
              setNames((current) => ({ ...current, zh: event.target.value }))
            }
            className={`${adminInputClass} mt-1`}
          />
        </label>
        <label className="block text-xs">
          {t("catalogs.thai")}
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
            {t("actions.save")}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            className="text-text/45 hover:text-text h-11 text-sm"
          >
            {t("actions.delete")}
          </button>
        </div>
      </div>
    </li>
  );
}
