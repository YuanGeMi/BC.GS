"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { AdminConfirm } from "@/components/admin/admin-confirm";
import { CasinoMarketTable } from "@/components/admin/casino-market-table";
import {
  CONTENT_LOCALES,
  emptyCasinoSaveInput,
  englishReady,
  normalizeSlug,
  type CasinoLicenseDraft,
  type CasinoSaveInput,
  type CasinoTranslationDraft,
} from "@/lib/admin/casino-input";
import {
  createCasino,
  deleteCasino,
  saveAndPublishCasino,
  setCasinoStatus,
  updateCasino,
  type AdminCasinoCatalogs,
  type AdminCasinoEditorData,
} from "@/lib/admin/casinos";
import {
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/lib/admin/fields";
import { type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const scoreFields = [
  ["overallRating", "overall"],
  ["ratingBonuses", "bonuses"],
  ["ratingGames", "games"],
  ["ratingSupport", "support"],
  ["ratingPayout", "payout"],
  ["ratingTrust", "trust"],
] as const;

function toInput(casino?: AdminCasinoEditorData | null): CasinoSaveInput {
  if (!casino) return emptyCasinoSaveInput();
  return {
    slug: casino.slug,
    logoUrl: casino.logoUrl,
    establishedYear: casino.establishedYear,
    minDeposit: casino.minDeposit,
    payoutSpeedId: casino.payoutSpeedId,
    overallRating: casino.overallRating,
    ratingBonuses: casino.ratingBonuses,
    ratingGames: casino.ratingGames,
    ratingSupport: casino.ratingSupport,
    ratingPayout: casino.ratingPayout,
    ratingTrust: casino.ratingTrust,
    affiliateLink: casino.affiliateLink,
    translations: casino.translations,
    licenses: casino.licenses,
    paymentMethodIds: casino.paymentMethodIds,
    gameProviderIds: casino.gameProviderIds,
    markets: casino.markets,
  };
}

export function CasinoEditor({
  casino,
  catalogs,
}: {
  casino?: AdminCasinoEditorData | null;
  catalogs: AdminCasinoCatalogs;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [form, setForm] = useState<CasinoSaveInput>(() => toInput(casino));
  const [locale, setLocale] = useState<Locale>("en");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState(false);
  const [isPending, startTransition] = useTransition();
  const originalSlug = casino?.slug ?? "";
  const isNew = !casino;

  useEffect(() => {
    setForm(toInput(casino));
  }, [casino]);

  const slugChanged =
    Boolean(originalSlug) && normalizeSlug(form.slug) !== originalSlug;

  const canPublish = englishReady(form);

  function err(code: string) {
    return t.has(`errors.${code}`) ? t(`errors.${code}`) : code;
  }

  function patch(next: Partial<CasinoSaveInput>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function patchTranslation(next: Partial<CasinoTranslationDraft>) {
    setForm((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [locale]: { ...current.translations[locale], ...next },
      },
    }));
  }

  function licenseDraft(id: string): CasinoLicenseDraft {
    return (
      form.licenses.find((row) => row.licenseId === id) ?? {
        licenseId: id,
        licenseNumber: "",
        verified: false,
        verificationUrl: "",
      }
    );
  }

  function runSave(kind: "save" | "publish") {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      if (isNew) {
        const result = await createCasino(form);
        if (!result.ok) {
          setError(err(result.error));
          return;
        }
        router.push(`/admin/casinos/${result.id}`);
        router.refresh();
        return;
      }

      if (kind === "publish") {
        const result = await saveAndPublishCasino(casino.id, form);
        if (!result.ok) {
          setError(err(result.error));
          return;
        }
        setNotice(t("casinos.editor.published"));
        setConfirmSlug(false);
        router.refresh();
        return;
      }

      const result = await updateCasino(casino.id, form);
      if (!result.ok) {
        setError(err(result.error));
        return;
      }
      setNotice(t("casinos.editor.saved"));
      setConfirmSlug(false);
      router.refresh();
    });
  }

  const translation = form.translations[locale];
  const selectedLicenses = useMemo(
    () => new Set(form.licenses.map((row) => row.licenseId)),
    [form.licenses],
  );

  return (
    <div className="max-w-5xl pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
            {t("casinos.eyebrow")}
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">
            {isNew
              ? t("casinos.editor.newTitle")
              : form.translations.en.name.trim() ||
                form.slug ||
                t("casinos.title")}
          </h1>
          {!isNew ? (
            <p className="text-text/45 mt-2 text-xs tracking-[0.16em] uppercase">
              {t(`status.${casino.status}`)}
            </p>
          ) : (
            <p className="text-text/45 mt-2 text-sm">
              {t("casinos.editor.startsDraft")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (slugChanged) {
                setConfirmSlug(true);
                return;
              }
              runSave("save");
            }}
            className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1"
          >
            {isPending ? t("actions.saving") : t("actions.save")}
          </button>
          {!isNew && casino.status !== "published" ? (
            <button
              type="button"
              disabled={isPending || !canPublish}
              onClick={() => runSave("publish")}
              className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
            >
              {t("actions.publish")}
            </button>
          ) : null}
          {!isNew && casino.status === "published" ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await setCasinoStatus(casino.id, "draft");
                  if (!result.ok) {
                    setError(err(result.error));
                    return;
                  }
                  setNotice(t("casinos.editor.unpublished"));
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
      {!canPublish ? (
        <p className="text-text/45 mt-6 max-w-2xl text-sm">
          {t("casinos.editor.publishNeeds")}
        </p>
      ) : null}
      {slugChanged ? (
        <p className="text-accent/80 mt-4 max-w-2xl text-sm">
          {t("casinos.editor.slugChangeWarn", { slug: originalSlug })}
        </p>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight italic">
          {t("casinos.editor.facts")}
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("casinos.editor.slug")}
            </span>
            <input
              value={form.slug}
              onChange={(event) => patch({ slug: event.target.value })}
              className={adminInputClass}
              autoCapitalize="none"
              spellCheck={false}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("casinos.editor.logoUrl")}
            </span>
            <input
              value={form.logoUrl}
              onChange={(event) => patch({ logoUrl: event.target.value })}
              className={adminInputClass}
              placeholder="https://"
            />
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("casinos.editor.established")}
            </span>
            <input
              value={form.establishedYear}
              onChange={(event) =>
                patch({ establishedYear: event.target.value })
              }
              className={adminInputClass}
              inputMode="numeric"
            />
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("casinos.editor.minDeposit")}
            </span>
            <input
              value={form.minDeposit}
              onChange={(event) => patch({ minDeposit: event.target.value })}
              className={adminInputClass}
              inputMode="decimal"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("casinos.editor.affiliateDefault")}
            </span>
            <input
              value={form.affiliateLink}
              onChange={(event) => patch({ affiliateLink: event.target.value })}
              className={adminInputClass}
              placeholder="https://"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("casinos.editor.payoutSpeed")}
            </span>
            <select
              value={form.payoutSpeedId}
              onChange={(event) => patch({ payoutSpeedId: event.target.value })}
              className={adminSelectClass}
            >
              <option value="">{t("casinos.editor.none")}</option>
              {catalogs.payoutSpeeds.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {scoreFields.map(([key, labelKey]) => (
            <label key={key} className="block">
              <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
                {t(`casinos.editor.${labelKey}`)}
              </span>
              <input
                value={form[key]}
                onChange={(event) => patch({ [key]: event.target.value })}
                className={adminInputClass}
                inputMode="decimal"
                placeholder="0–5"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl tracking-tight italic">
          {t("casinos.editor.voice")}
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
              {t("casinos.editor.name")}
            </span>
            <input
              value={translation.name}
              onChange={(event) =>
                patchTranslation({ name: event.target.value })
              }
              className={adminInputClass}
            />
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("casinos.editor.review")}
            </span>
            <textarea
              value={translation.reviewBody}
              onChange={(event) =>
                patchTranslation({ reviewBody: event.target.value })
              }
              className={adminTextareaClass}
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
                {t("casinos.editor.prosShort")}
              </span>
              <textarea
                value={translation.pros}
                onChange={(event) =>
                  patchTranslation({ pros: event.target.value })
                }
                className={adminTextareaClass}
                placeholder={t("common.onePerLine")}
              />
            </label>
            <label className="block">
              <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
                {t("casinos.editor.consShort")}
              </span>
              <textarea
                value={translation.cons}
                onChange={(event) =>
                  patchTranslation({ cons: event.target.value })
                }
                className={adminTextareaClass}
                placeholder={t("common.onePerLine")}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("casinos.editor.seoTitle")}
            </span>
            <input
              value={translation.seoTitle}
              onChange={(event) =>
                patchTranslation({ seoTitle: event.target.value })
              }
              className={adminInputClass}
            />
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("casinos.editor.seoDescription")}
            </span>
            <textarea
              value={translation.seoDescription}
              onChange={(event) =>
                patchTranslation({ seoDescription: event.target.value })
              }
              className={cn(adminTextareaClass, "min-h-24")}
            />
          </label>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl tracking-tight italic">
          {t("casinos.editor.catalog")}
        </h2>
        <div className="mt-6 space-y-8">
          <fieldset>
            <legend className="text-text/45 mb-3 text-[11px] tracking-[0.16em] uppercase">
              {t("casinos.editor.licenses")}
            </legend>
            <ul className="space-y-3">
              {catalogs.licenses.map((row) => {
                const checked = selectedLicenses.has(row.id);
                const draft = licenseDraft(row.id);
                return (
                  <li key={row.id} className="border-text/8 border-b pb-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          patch({
                            licenses: checked
                              ? form.licenses.filter(
                                  (item) => item.licenseId !== row.id,
                                )
                              : [...form.licenses, licenseDraft(row.id)],
                          })
                        }
                      />
                      {row.label}
                    </label>
                    {checked ? (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <input
                          value={draft.licenseNumber}
                          onChange={(event) =>
                            patch({
                              licenses: form.licenses.map((item) =>
                                item.licenseId === row.id
                                  ? {
                                      ...item,
                                      licenseNumber: event.target.value,
                                    }
                                  : item,
                              ),
                            })
                          }
                          className={adminInputClass}
                          placeholder={t("casinos.editor.licenseNumber")}
                        />
                        <input
                          value={draft.verificationUrl}
                          onChange={(event) =>
                            patch({
                              licenses: form.licenses.map((item) =>
                                item.licenseId === row.id
                                  ? {
                                      ...item,
                                      verificationUrl: event.target.value,
                                    }
                                  : item,
                              ),
                            })
                          }
                          className={adminInputClass}
                          placeholder={t("casinos.editor.verificationUrl")}
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={draft.verified}
                            onChange={(event) =>
                              patch({
                                licenses: form.licenses.map((item) =>
                                  item.licenseId === row.id
                                    ? {
                                        ...item,
                                        verified: event.target.checked,
                                      }
                                    : item,
                                ),
                              })
                            }
                          />
                          {t("casinos.editor.verified")}
                        </label>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <CheckboxSet
            legend={t("casinos.editor.payments")}
            options={catalogs.payments}
            selected={form.paymentMethodIds}
            onChange={(paymentMethodIds) => patch({ paymentMethodIds })}
          />
          <CheckboxSet
            legend={t("casinos.editor.gameProviders")}
            options={catalogs.providers}
            selected={form.gameProviderIds}
            onChange={(gameProviderIds) => patch({ gameProviderIds })}
          />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl tracking-tight italic">
          {t("casinos.editor.reach")}
        </h2>
        <p className="text-text/45 mt-2 mb-6 max-w-2xl text-sm">
          {t("casinos.editor.reachHelp")}
        </p>
        <CasinoMarketTable
          initialOptions={casino?.marketOptions ?? []}
          value={form.markets}
          onChange={(markets) => patch({ markets })}
        />
      </section>

      {!isNew ? (
        <section className="border-text/10 mt-16 border-t pt-8">
          <h2 className="font-display text-2xl tracking-tight italic">
            {t("casinos.editor.remove")}
          </h2>
          <p className="text-text/45 mt-3 max-w-xl text-sm leading-relaxed">
            {t("casinos.editor.removeHelp")}
          </p>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-accent hover:text-accent-highlight mt-4 text-sm"
          >
            {t("actions.deleteCasino")}
          </button>
        </section>
      ) : null}

      {confirmSlug ? (
        <AdminConfirm
          title={t("casinos.editor.slugChangeTitle")}
          body={t("casinos.editor.slugChangeBody", {
            slug: originalSlug,
            next: normalizeSlug(form.slug) || "—",
          })}
          confirmLabel={t("actions.saveWithNewSlug")}
          pending={isPending}
          onCancel={() => setConfirmSlug(false)}
          onConfirm={() => runSave("save")}
        />
      ) : null}

      {confirmDelete && casino ? (
        <AdminConfirm
          title={t("casinos.editor.deleteTitle")}
          body={t("casinos.editor.deleteBody")}
          confirmLabel={t("actions.delete")}
          pending={isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            startTransition(async () => {
              const result = await deleteCasino(casino.id);
              if (!result.ok) {
                setError(err(result.error));
                setConfirmDelete(false);
                return;
              }
              router.push("/admin/casinos");
              router.refresh();
            })
          }
        />
      ) : null}
    </div>
  );
}

function CheckboxSet({
  legend,
  options,
  selected,
  onChange,
}: {
  legend: string;
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="text-text/45 mb-3 text-[11px] tracking-[0.16em] uppercase">
        {legend}
      </legend>
      <ul className="grid gap-2 sm:grid-cols-2">
        {options.map((row) => {
          const checked = selected.includes(row.id);
          return (
            <li key={row.id}>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange(
                      checked
                        ? selected.filter((id) => id !== row.id)
                        : [...selected, row.id],
                    )
                  }
                />
                {row.label}
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
