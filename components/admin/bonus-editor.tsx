"use client";

import { useTranslations } from "next-intl";
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
import {
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/lib/admin/fields";
import { cn } from "@/lib/utils";

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
  const t = useTranslations("Admin");
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

  const selectedCasino = catalogs.casinos.find(
    (row) => row.id === form.casinoId,
  );
  const selectedType = catalogs.types.find((row) => row.id === form.typeId);
  const suggestion =
    selectedCasino && selectedType
      ? suggestedBonusSlug(selectedCasino.slug, selectedType.slug)
      : "";
  const casinoIsDraft = selectedCasino?.status === "draft";
  const canPublish = englishTitleReady(form) && !casinoIsDraft;

  function err(code: string) {
    return t.has(`errors.${code}`) ? t(`errors.${code}`) : code;
  }

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
          setError(err(result.error));
          return;
        }
        router.push(`/admin/bonuses/${result.id}`);
        router.refresh();
        return;
      }

      if (kind === "publish") {
        const result = await saveAndPublishBonus(bonus.id, form);
        if (!result.ok) {
          setError(err(result.error));
          return;
        }
        setNotice(t("bonuses.editor.published"));
        router.refresh();
        return;
      }

      const result = await updateBonus(bonus.id, form);
      if (!result.ok) {
        setError(err(result.error));
        return;
      }
      setNotice(t("bonuses.editor.saved"));
      router.refresh();
    });
  }

  const translation = form.translations[locale];

  return (
    <div className="max-w-3xl pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
            {t("bonuses.eyebrow")}
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">
            {isNew
              ? t("bonuses.editor.newTitle")
              : form.translations.en.title.trim() ||
                form.slug ||
                t("bonuses.title")}
          </h1>
          {!isNew ? (
            <p className="text-text/45 mt-2 text-xs tracking-[0.16em] uppercase">
              {t(`status.${bonus.status}`)}
            </p>
          ) : (
            <p className="text-text/45 mt-2 text-sm">
              {t("bonuses.editor.startsDraft")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => runSave("save")}
            className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1"
          >
            {isPending ? t("actions.saving") : t("actions.save")}
          </button>
          {!isNew && bonus.status !== "published" ? (
            <button
              type="button"
              disabled={isPending || !canPublish}
              onClick={() => runSave("publish")}
              className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
            >
              {t("actions.publish")}
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
                    setError(err(result.error));
                    return;
                  }
                  setNotice(t("bonuses.editor.unpublished"));
                  router.refresh();
                })
              }
              className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1"
            >
              {t("actions.unpublish")}
            </button>
          ) : null}
        </div>
      </header>

      {error ? <p className="text-accent mt-6 text-sm">{error}</p> : null}
      {notice ? <p className="text-text/55 mt-6 text-sm">{notice}</p> : null}
      {casinoIsDraft ? (
        <p className="text-text/45 mt-6 max-w-2xl text-sm">
          {t("bonuses.editor.casinoDraftWarn")}
        </p>
      ) : null}
      {!englishTitleReady(form) ? (
        <p className="text-text/45 mt-4 max-w-2xl text-sm">
          {t("bonuses.editor.publishNeeds")}
        </p>
      ) : null}

      <section className="mt-12 space-y-5">
        <h2 className="font-display text-2xl tracking-tight italic">
          {t("bonuses.editor.facts")}
        </h2>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            {t("bonuses.editor.casino")}
          </span>
          <select
            value={form.casinoId}
            onChange={(event) => patch({ casinoId: event.target.value })}
            className={adminSelectClass}
          >
            <option value="">{t("bonuses.editor.selectCasino")}</option>
            {catalogs.casinos.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
                {row.status === "draft" ? ` (${t("status.draft")})` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            {t("bonuses.editor.type")}
          </span>
          <select
            value={form.typeId}
            onChange={(event) => patch({ typeId: event.target.value })}
            className={adminSelectClass}
          >
            <option value="">{t("bonuses.editor.selectType")}</option>
            {catalogs.types.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            {t("bonuses.editor.slug")}
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
              {t("bonuses.editor.slugSuggested", { suggestion })}
            </span>
          ) : null}
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("bonuses.editor.sortOrder")}
            </span>
            <input
              value={form.sortOrder}
              onChange={(event) => patch({ sortOrder: event.target.value })}
              className={adminInputClass}
              inputMode="numeric"
            />
            <span className="text-text/40 mt-1.5 block text-xs">
              {t("bonuses.editor.sortHelp")}
            </span>
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("bonuses.editor.expiry")}
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
            {t("bonuses.editor.amount")}
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
              {t("bonuses.editor.wagering")}
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
              {t("bonuses.editor.minDeposit")}
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
            {t("bonuses.editor.code")}
          </span>
          <input
            value={form.code}
            onChange={(event) => patch({ code: event.target.value })}
            className={adminInputClass}
          />
        </label>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl tracking-tight italic">
          {t("bonuses.editor.voice")}
        </h2>
        <div className="border-text/10 mt-5 flex gap-1 border-b">
          {CONTENT_LOCALES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setLocale(item)}
              className={cn(
                "-mb-px border-b px-3 py-2 text-sm",
                locale === item
                  ? "border-accent text-accent"
                  : "text-text/45 hover:text-text border-transparent",
              )}
            >
              {t(`contentLocale.${item}`)}
              {item === "en" ? (
                <span className="text-text/35 ml-2 text-[10px] tracking-wide uppercase">
                  {t("common.required")}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("bonuses.editor.titleField")}
            </span>
            <input
              value={translation.title}
              onChange={(event) =>
                patchTranslation({ title: event.target.value })
              }
              className={adminInputClass}
            />
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("bonuses.editor.terms")}
            </span>
            <textarea
              value={translation.terms}
              onChange={(event) =>
                patchTranslation({ terms: event.target.value })
              }
              className={adminTextareaClass}
            />
          </label>
        </div>
      </section>

      {!isNew ? (
        <section className="border-text/10 mt-16 border-t pt-8">
          <h2 className="font-display text-2xl tracking-tight italic">
            {t("bonuses.editor.remove")}
          </h2>
          <p className="text-text/45 mt-3 max-w-xl text-sm leading-relaxed">
            {t("bonuses.editor.removeHelp")}
          </p>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-accent hover:text-accent-highlight mt-4 text-sm"
          >
            {t("actions.deleteBonus")}
          </button>
        </section>
      ) : null}

      {confirmDelete && bonus ? (
        <AdminConfirm
          title={t("bonuses.editor.deleteTitle")}
          body={t("bonuses.editor.deleteBody")}
          confirmLabel={t("actions.delete")}
          pending={isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            startTransition(async () => {
              const result = await deleteBonus(bonus.id);
              if (!result.ok) {
                setError(err(result.error));
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
