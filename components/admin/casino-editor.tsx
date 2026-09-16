"use client";

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
import { adminInputClass, adminSelectClass, adminTextareaClass } from "@/lib/admin/fields";
import { type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const errorCopy: Record<string, string> = {
  invalidSlug: "Slug must be lowercase letters, numbers, and hyphens.",
  duplicateSlug: "That slug is already used by another casino.",
  englishRequired: "English name and review body are required to publish.",
  invalidScore: "Scores must be between 0 and 5.",
  invalidYear: "Established year looks wrong.",
  invalidDeposit: "Minimum deposit must be a positive number.",
  invalidCatalog: "Pick licenses, payments, and providers from the catalog.",
  missing: "That casino is no longer in Desk.",
  invalidStatus: "That status is not allowed.",
};

const localeLabel: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  th: "ไทย",
};

const scoreFields = [
  ["overallRating", "Overall"],
  ["ratingBonuses", "Bonuses"],
  ["ratingGames", "Games"],
  ["ratingSupport", "Support"],
  ["ratingPayout", "Payout"],
  ["ratingTrust", "Trust"],
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
          setError(errorCopy[result.error] ?? result.error);
          return;
        }
        router.push(`/admin/casinos/${result.id}`);
        router.refresh();
        return;
      }

      if (kind === "publish") {
        const result = await saveAndPublishCasino(casino.id, form);
        if (!result.ok) {
          setError(errorCopy[result.error] ?? result.error);
          return;
        }
        setNotice("Published.");
        setConfirmSlug(false);
        router.refresh();
        return;
      }

      const result = await updateCasino(casino.id, form);
      if (!result.ok) {
        setError(errorCopy[result.error] ?? result.error);
        return;
      }
      setNotice("Saved.");
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
            Ledger
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">
            {isNew
              ? "New casino"
              : form.translations.en.name.trim() || form.slug || "Casino"}
          </h1>
          {!isNew ? (
            <p className="text-text/45 mt-2 text-xs tracking-[0.16em] uppercase">
              {casino.status}
            </p>
          ) : (
            <p className="text-text/45 mt-2 text-sm">Starts as draft.</p>
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
            {isPending ? "Saving…" : "Save"}
          </button>
          {!isNew && casino.status !== "published" ? (
            <button
              type="button"
              disabled={isPending || !canPublish}
              onClick={() => runSave("publish")}
              className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
            >
              Publish
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
      {!canPublish ? (
        <p className="text-text/45 mt-6 max-w-2xl text-sm">
          Publishing needs an English name and review body. You can still save a
          draft.
        </p>
      ) : null}
      {slugChanged ? (
        <p className="text-accent/80 mt-4 max-w-2xl text-sm">
          Changing the slug will break existing /casinos/{originalSlug} links.
          Save will refresh both the old and new public URLs.
        </p>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-2xl italic tracking-tight">Facts</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
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
          </label>
          <label className="block sm:col-span-2">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              Logo URL
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
              Established
            </span>
            <input
              value={form.establishedYear}
              onChange={(event) => patch({ establishedYear: event.target.value })}
              className={adminInputClass}
              inputMode="numeric"
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
          <label className="block sm:col-span-2">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              Default affiliate link
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
              Payout speed
            </span>
            <select
              value={form.payoutSpeedId}
              onChange={(event) => patch({ payoutSpeedId: event.target.value })}
              className={adminSelectClass}
            >
              <option value="">None</option>
              {catalogs.payoutSpeeds.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {scoreFields.map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
                {label}
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
              Name
            </span>
            <input
              value={translation.name}
              onChange={(event) => patchTranslation({ name: event.target.value })}
              className={adminInputClass}
            />
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              Review
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
                Pros
              </span>
              <textarea
                value={translation.pros}
                onChange={(event) => patchTranslation({ pros: event.target.value })}
                className={adminTextareaClass}
                placeholder="One per line"
              />
            </label>
            <label className="block">
              <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
                Cons
              </span>
              <textarea
                value={translation.cons}
                onChange={(event) => patchTranslation({ cons: event.target.value })}
                className={adminTextareaClass}
                placeholder="One per line"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              SEO title
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
              SEO description
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
        <h2 className="font-display text-2xl italic tracking-tight">Catalog</h2>
        <div className="mt-6 space-y-8">
          <fieldset>
            <legend className="text-text/45 mb-3 text-[11px] tracking-[0.16em] uppercase">
              Licenses
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
                              ? form.licenses.filter((item) => item.licenseId !== row.id)
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
                                  ? { ...item, licenseNumber: event.target.value }
                                  : item,
                              ),
                            })
                          }
                          className={adminInputClass}
                          placeholder="License number"
                        />
                        <input
                          value={draft.verificationUrl}
                          onChange={(event) =>
                            patch({
                              licenses: form.licenses.map((item) =>
                                item.licenseId === row.id
                                  ? { ...item, verificationUrl: event.target.value }
                                  : item,
                              ),
                            })
                          }
                          className={adminInputClass}
                          placeholder="Verification URL"
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={draft.verified}
                            onChange={(event) =>
                              patch({
                                licenses: form.licenses.map((item) =>
                                  item.licenseId === row.id
                                    ? { ...item, verified: event.target.checked }
                                    : item,
                                ),
                              })
                            }
                          />
                          Verified
                        </label>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <CheckboxSet
            legend="Payments"
            options={catalogs.payments}
            selected={form.paymentMethodIds}
            onChange={(paymentMethodIds) => patch({ paymentMethodIds })}
          />
          <CheckboxSet
            legend="Game providers"
            options={catalogs.providers}
            selected={form.gameProviderIds}
            onChange={(gameProviderIds) => patch({ gameProviderIds })}
          />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl italic tracking-tight">Reach</h2>
        <p className="text-text/45 mt-2 mb-6 max-w-2xl text-sm">
          Available or restricted per market. An affiliate override, if set,
          replaces the default link for that country only.
        </p>
        <CasinoMarketTable
          options={catalogs.markets}
          value={form.markets}
          onChange={(markets) => patch({ markets })}
        />
      </section>

      {!isNew ? (
        <section className="border-text/10 mt-16 border-t pt-8">
          <h2 className="font-display text-2xl italic tracking-tight">Remove</h2>
          <p className="text-text/45 mt-3 max-w-xl text-sm leading-relaxed">
            Deleting this casino also deletes its bonuses, affiliate clicks,
            reviews, and catalog joins. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-accent hover:text-accent-highlight mt-4 text-sm"
          >
            Delete casino
          </button>
        </section>
      ) : null}

      {confirmSlug ? (
        <AdminConfirm
          title="Change the public slug?"
          body={`Old URLs at /casinos/${originalSlug} will 404 unless redirected elsewhere. The new slug will be ${normalizeSlug(form.slug) || "empty"}.`}
          confirmLabel="Save with new slug"
          pending={isPending}
          onCancel={() => setConfirmSlug(false)}
          onConfirm={() => runSave("save")}
        />
      ) : null}

      {confirmDelete && casino ? (
        <AdminConfirm
          title="Delete this casino?"
          body="Bonuses, clicks, and reviews attached to it will be deleted as well."
          confirmLabel="Delete"
          pending={isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            startTransition(async () => {
              const result = await deleteCasino(casino.id);
              if (!result.ok) {
                setError(errorCopy[result.error] ?? result.error);
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
