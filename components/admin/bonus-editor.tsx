"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { AdminConfirm } from "@/components/admin/admin-confirm";
import {
  CONTENT_LOCALES,
  emptyBonusSaveInput,
  englishTitleReady,
  suggestedBonusSlug,
  type BonusSaveInput,
  type BonusTranslationDraft,
  type Locale,
} from "@/lib/admin/bonus-input";
import {
  createBonus,
  deleteBonus,
  saveAndPublishBonus,
  setBonusStatus,
  updateBonus,
  type AdminBonusCatalogs,
  type AdminBonusEditorData,
} from "@/lib/admin/bonuses";
import { adminInputClass, adminSelectClass, adminTextareaClass } from "@/lib/admin/fields";
import { cn } from "@/lib/utils";

const errorCopy: Record<string, string> = {
  invalidSlug: "Slug must be lowercase letters, numbers, and hyphens.",
  duplicateSlug: "That slug is already used by another bonus.",
  englishRequired: "An English title is required to publish.",
  casinoRequired: "Pick a casino.",
  typeRequired: "Pick a bonus type from the catalog.",
  casinoDraft: "Publish the casino first. A draft operator cannot show bonuses.",
  invalidSort: "Sort order must be a whole number.",
  invalidDeposit: "Minimum deposit must be a positive number.",
  invalidExpiry: "Expiry must be a valid date.",
  missing: "That bonus is no longer in Desk.",
  invalidStatus: "That status is not allowed.",
};

const localeLabel: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  th: "ไทย",
};

function toInput(
  bonus?: AdminBonusEditorData | null,
  presetCasinoId?: string,
): BonusSaveInput {
  const base = emptyBonusSaveInput();
  if (presetCasinoId) base.casinoId = presetCasinoId;
  if (!bonus) return base;
  return {
    casinoId: bonus.casinoId,
    typeId: bonus.typeId,
    slug: bonus.slug,
    sortOrder: bonus.sortOrder,
    amount: bonus.amount,
    wageringRequirement: bonus.wageringRequirement,
    minDeposit: bonus.minDeposit,
    code: bonus.code,
    expiryDate: bonus.expiryDate,
    translations: bonus.translations,
  };
}

export function BonusEditor({
  bonus,
  catalogs,
  presetCasinoId,
}: {
  bonus?: AdminBonusEditorData | null;
  catalogs: AdminBonusCatalogs;
  presetCasinoId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<BonusSaveInput>(() =>
    toInput(bonus, presetCasinoId),
  );
  const [locale, setLocale] = useState<Locale>("en");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isNew = !bonus;
  const lastSuggestion = useRef("");

  const selectedCasino = catalogs.casinos.find((row) => row.id === form.casinoId);
  const selectedType = catalogs.types.find((row) => row.id === form.typeId);
  const suggestion =
    selectedCasino && selectedType
      ? suggestedBonusSlug(selectedCasino.slug, selectedType.slug)
      : "";
  const casinoIsDraft = selectedCasino?.status === "draft";
  const canPublish = englishTitleReady(form) && !casinoIsDraft;

  useEffect(() => {
    setForm(toInput(bonus, presetCasinoId));
  }, [bonus, presetCasinoId]);

  useEffect(() => {
    if (!isNew || !suggestion) return;
    setForm((current) => {
      if (current.slug && current.slug !== lastSuggestion.current) {
        return current;
      }
      lastSuggestion.current = suggestion;
      return { ...current, slug: suggestion };
    });
  }, [isNew, suggestion]);

  function patch(next: Partial<BonusSaveInput>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function patchTranslation(next: Partial<BonusTranslationDraft>) {
    setForm((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [locale]: { ...current.translations[locale], ...next },
      },
    }));
  }

  function runSave(kind: "save" | "publish") {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      if (isNew) {
        const result = await createBonus(form);
        if (!result.ok) {
          setError(errorCopy[result.error] ?? result.error);
          return;
        }
        router.push(`/admin/bonuses/${result.id}`);
        router.refresh();
        return;
      }

      if (kind === "publish") {
        const result = await saveAndPublishBonus(bonus.id, form);
        if (!result.ok) {
          setError(errorCopy[result.error] ?? result.error);
          return;
        }
        setNotice("Published.");
        router.refresh();
        return;
      }

      const result = await updateBonus(bonus.id, form);
      if (!result.ok) {
        setError(errorCopy[result.error] ?? result.error);
        return;
      }
      setNotice("Saved.");
      router.refresh();
    });
  }

  const translation = form.translations[locale];

  return (
    <div className="max-w-3xl pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
            Offer
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">
            {isNew
              ? "New bonus"
              : form.translations.en.title.trim() || form.slug || "Bonus"}
          </h1>
          {!isNew ? (
            <p className="text-text/45 mt-2 text-xs tracking-[0.16em] uppercase">
              {bonus.status}
            </p>
          ) : (
            <p className="text-text/45 mt-2 text-sm">Starts as draft.</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => runSave("save")}
            className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
          {!isNew && bonus.status !== "published" ? (
            <button
              type="button"
              disabled={isPending || !canPublish}
              onClick={() => runSave("publish")}
              className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
            >
              Publish
            </button>
          ) : null}
          {!isNew && bonus.status === "published" ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await setBonusStatus(bonus.id, "draft");
                  if (!result.ok) {
                    setError(errorCopy[result.error] ?? result.error);
                    return;
                  }
                  setNotice("Unpublished.");
                  router.refresh();
                })
              }
              className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1"
            >
              Unpublish
            </button>
          ) : null}
        </div>
      </header>

      {error ? <p className="text-accent mt-6 text-sm">{error}</p> : null}
      {notice ? <p className="text-text/55 mt-6 text-sm">{notice}</p> : null}
      {casinoIsDraft ? (
        <p className="text-text/45 mt-6 max-w-2xl text-sm">
          This casino is still a draft. You can save the bonus, but it cannot
          go live until the operator is published.
        </p>
      ) : null}
      {!englishTitleReady(form) ? (
        <p className="text-text/45 mt-4 max-w-2xl text-sm">
          Publishing needs an English title.
        </p>
      ) : null}

      <section className="mt-12 space-y-5">
        <h2 className="font-display text-2xl italic tracking-tight">Facts</h2>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            Casino
          </span>
          <select
            value={form.casinoId}
            onChange={(event) => patch({ casinoId: event.target.value })}
            className={adminSelectClass}
          >
            <option value="">Select casino</option>
            {catalogs.casinos.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
                {row.status === "draft" ? " (draft)" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            Type
          </span>
          <select
            value={form.typeId}
            onChange={(event) => patch({ typeId: event.target.value })}
            className={adminSelectClass}
          >
            <option value="">Select type</option>
            {catalogs.types.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            Slug
          </span>
          <input
            value={form.slug}
            onChange={(event) => patch({ slug: event.target.value })}
            className={adminInputClass}
            autoCapitalize="none"
            spellCheck={false}
          />
          {isNew && suggestion ? (
            <span className="text-text/40 mt-1.5 block text-xs">
              Suggested from casino and type: {suggestion}
            </span>
          ) : null}
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              Sort order
            </span>
            <input
              value={form.sortOrder}
              onChange={(event) => patch({ sortOrder: event.target.value })}
              className={adminInputClass}
              inputMode="numeric"
            />
            <span className="text-text/40 mt-1.5 block text-xs">
              Lower numbers appear first, then newest.
            </span>
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              Expiry
            </span>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(event) => patch({ expiryDate: event.target.value })}
              className={adminInputClass}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            Amount
          </span>
          <input
            value={form.amount}
            onChange={(event) => patch({ amount: event.target.value })}
            className={adminInputClass}
            placeholder="100% up to $200"
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              Wagering
            </span>
            <input
              value={form.wageringRequirement}
              onChange={(event) =>
                patch({ wageringRequirement: event.target.value })
              }
              className={adminInputClass}
            />
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              Min deposit
            </span>
            <input
              value={form.minDeposit}
              onChange={(event) => patch({ minDeposit: event.target.value })}
              className={adminInputClass}
              inputMode="decimal"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            Code
          </span>
          <input
            value={form.code}
            onChange={(event) => patch({ code: event.target.value })}
            className={adminInputClass}
          />
        </label>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl italic tracking-tight">Voice</h2>
        <div className="mt-5 flex gap-1 border-b border-text/10">
          {CONTENT_LOCALES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setLocale(item)}
              className={cn(
                "-mb-px border-b px-3 py-2 text-sm",
                locale === item
                  ? "border-accent text-accent"
                  : "border-transparent text-text/45 hover:text-text",
              )}
            >
              {localeLabel[item]}
              {item === "en" ? (
                <span className="text-text/35 ml-2 text-[10px] tracking-wide uppercase">
                  required
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              Title
            </span>
            <input
              value={translation.title}
              onChange={(event) => patchTranslation({ title: event.target.value })}
              className={adminInputClass}
            />
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              Terms
            </span>
            <textarea
              value={translation.terms}
              onChange={(event) => patchTranslation({ terms: event.target.value })}
              className={adminTextareaClass}
            />
          </label>
        </div>
      </section>

      {!isNew ? (
        <section className="border-text/10 mt-16 border-t pt-8">
          <h2 className="font-display text-2xl italic tracking-tight">Remove</h2>
          <p className="text-text/45 mt-3 max-w-xl text-sm leading-relaxed">
            Affiliate clicks that used this bonus stay in reporting. Their
            bonus link is cleared.
          </p>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-accent hover:text-accent-highlight mt-4 text-sm"
          >
            Delete bonus
          </button>
        </section>
      ) : null}

      {confirmDelete && bonus ? (
        <AdminConfirm
          title="Delete this bonus?"
          body="Click rows remain. The bonusId on those clicks will be emptied."
          confirmLabel="Delete"
          pending={isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            startTransition(async () => {
              const result = await deleteBonus(bonus.id);
              if (!result.ok) {
                setError(errorCopy[result.error] ?? result.error);
                setConfirmDelete(false);
                return;
              }
              router.push("/admin/bonuses");
              router.refresh();
            })
          }
        />
      ) : null}
    </div>
  );
}
