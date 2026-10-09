"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { routing, type Locale } from "@/i18n/routing";
import { adminInputClass } from "@/lib/admin/fields";
import {
  finalizeTelegramMediaUpload,
  prepareTelegramMediaUpload,
  updateTelegramWelcome,
  type TelegramMediaUploadError,
} from "@/lib/admin/telegram-welcome";
import { createClient } from "@/lib/supabase/client";
import { TELEGRAM_MEDIA_BUCKET } from "@/lib/supabase/storage";
import {
  TELEGRAM_WELCOME_BUTTON_LABEL_MAX,
  TELEGRAM_WELCOME_CAPTION_MAX,
  TELEGRAM_WELCOME_MAX_BUTTONS,
  TELEGRAM_WELCOME_MEDIA_MIME,
  TELEGRAM_WELCOME_TEXT_MAX,
  isTelegramWelcomeMediaMime,
  parseTelegramButtonUrl,
  type TelegramWelcome,
  type TelegramWelcomeByLocale,
  type TelegramWelcomeMediaType,
} from "@/lib/telegram-welcome";

type ButtonDraft = { id: number; label: string; url: string };

type Draft = {
  text: string;
  caption: string;
  mediaUrl: string | null;
  mediaType: TelegramWelcomeMediaType | null;
  buttons: ButtonDraft[];
};

type Status = { error: string | null; notice: string | null };

let buttonIdSeq = 0;

function toDraft(value: TelegramWelcome): Draft {
  return {
    text: value.text,
    caption: value.caption,
    mediaUrl: value.mediaUrl,
    mediaType: value.mediaType,
    buttons: value.buttons.map((button) => ({ id: buttonIdSeq++, ...button })),
  };
}

const MEDIA_ACCEPT = Object.keys(TELEGRAM_WELCOME_MEDIA_MIME).join(",");

const labelClass =
  "text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase";
const linkClass =
  "text-text/55 hover:text-accent text-xs tracking-wide uppercase disabled:opacity-40";

export function TelegramWelcomeForm({
  initial,
}: {
  initial: TelegramWelcomeByLocale;
}) {
  const t = useTranslations("Admin");
  const [drafts, setDrafts] = useState<Record<Locale, Draft>>(() => ({
    en: toDraft(initial.en),
    zh: toDraft(initial.zh),
    th: toDraft(initial.th),
  }));
  const [active, setActive] = useState<Locale>("en");
  const [status, setStatus] = useState<Status>({ error: null, notice: null });
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const draft = drafts[active];
  const language = t(`pages.footerTaglineLocale.${active}`);
  const busy = isPending || uploading;

  function update(locale: Locale, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [locale]: { ...current[locale], ...patch },
    }));
  }

  function updateButton(id: number, patch: Partial<ButtonDraft>) {
    update(active, {
      buttons: draft.buttons.map((button) =>
        button.id === id ? { ...button, ...patch } : button,
      ),
    });
  }

  function uploadErrorMessage(error: TelegramMediaUploadError, mime: string) {
    if (error === "tooLarge") {
      return TELEGRAM_WELCOME_MEDIA_MIME[
        mime as keyof typeof TELEGRAM_WELCOME_MEDIA_MIME
      ]?.type === "photo"
        ? t("telegramWelcome.errors.imageTooLarge")
        : t("telegramWelcome.errors.mediaTooLarge");
    }
    return t(`telegramWelcome.errors.${error}`);
  }

  function uploadMedia(locale: Locale, file: File) {
    setStatus({ error: null, notice: null });
    if (!isTelegramWelcomeMediaMime(file.type)) {
      setStatus({
        error: t("telegramWelcome.errors.invalidType"),
        notice: null,
      });
      return;
    }
    if (file.size > TELEGRAM_WELCOME_MEDIA_MIME[file.type].maxBytes) {
      setStatus({
        error: uploadErrorMessage("tooLarge", file.type),
        notice: null,
      });
      return;
    }

    setUploading(true);
    startTransition(async () => {
      try {
        const prepared = await prepareTelegramMediaUpload({
          locale,
          mime: file.type,
          size: file.size,
        });
        if (!prepared.ok) {
          setStatus({
            error: uploadErrorMessage(prepared.error, file.type),
            notice: null,
          });
          return;
        }

        const { error: storageError } = await createClient()
          .storage.from(TELEGRAM_MEDIA_BUCKET)
          .uploadToSignedUrl(prepared.path, prepared.token, file, {
            contentType: file.type,
            cacheControl: "3600",
          });
        if (storageError) {
          setStatus({
            error: t("telegramWelcome.errors.uploadFailed"),
            notice: null,
          });
          return;
        }

        const finalized = await finalizeTelegramMediaUpload({
          locale,
          path: prepared.path,
        });
        if (!finalized.ok) {
          setStatus({
            error: uploadErrorMessage(finalized.error, file.type),
            notice: null,
          });
          return;
        }
        update(locale, {
          mediaUrl: finalized.url,
          mediaType: finalized.mediaType,
        });
        setStatus({ error: null, notice: t("telegramWelcome.mediaUploaded") });
      } finally {
        setUploading(false);
      }
    });
  }

  function save(locale: Locale) {
    const current = drafts[locale];
    setStatus({ error: null, notice: null });

    const filled = current.buttons.filter(
      (button) => button.label.trim() || button.url.trim(),
    );
    for (const [index, button] of current.buttons.entries()) {
      if (!button.label.trim() && !button.url.trim()) continue;
      if (!button.label.trim()) {
        setStatus({
          error: t("telegramWelcome.errors.buttonLabelMissing", {
            index: index + 1,
          }),
          notice: null,
        });
        return;
      }
      if (!parseTelegramButtonUrl(button.url)) {
        setStatus({
          error: t("telegramWelcome.errors.buttonUrlInvalid", {
            index: index + 1,
          }),
          notice: null,
        });
        return;
      }
    }

    startTransition(async () => {
      const result = await updateTelegramWelcome(locale, {
        text: current.text,
        caption: current.caption,
        mediaUrl: current.mediaUrl,
        buttons: filled.map(({ label, url }) => ({ label, url })),
      });
      const name = t(`pages.footerTaglineLocale.${locale}`);
      if (!result.ok) {
        setStatus({
          error: t(`telegramWelcome.errors.${result.error}`, {
            index: (result.buttonIndex ?? 0) + 1,
          }),
          notice: null,
        });
        return;
      }
      update(locale, toDraft(result.value));
      const empty =
        !result.value.text &&
        !result.value.caption &&
        !result.value.mediaUrl &&
        result.value.buttons.length === 0;
      setStatus({
        error: null,
        notice: empty
          ? t("telegramWelcome.cleared", { language: name })
          : t("telegramWelcome.saved", { language: name }),
      });
    });
  }

  const captionFallbackTooLong =
    Boolean(draft.mediaUrl) &&
    !draft.caption.trim() &&
    draft.text.trim().length > TELEGRAM_WELCOME_CAPTION_MAX;

  return (
    <section className="border-text/10 mt-12 max-w-xl border-t pt-8">
      <h2 className="font-display text-2xl tracking-tight">
        {t("telegramWelcome.title")}
      </h2>
      <p className="text-text/55 mt-2 text-sm">{t("telegramWelcome.help")}</p>

      <div
        role="tablist"
        aria-label={t("telegramWelcome.title")}
        className="border-text/10 mt-5 flex gap-1 border-b"
      >
        {routing.locales.map((locale) => (
          <button
            key={locale}
            type="button"
            role="tab"
            aria-selected={active === locale}
            disabled={busy}
            onClick={() => {
              setActive(locale);
              setStatus({ error: null, notice: null });
            }}
            className={`-mb-px border-b-2 px-3 py-2 text-[11px] tracking-[0.16em] uppercase ${
              active === locale
                ? "border-accent text-text"
                : "text-text/45 hover:text-text/70 border-transparent"
            }`}
          >
            {t(`pages.footerTaglineLocale.${locale}`)}
          </button>
        ))}
      </div>

      <form
        role="tabpanel"
        className="mt-5 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          save(active);
        }}
      >
        <label className="block">
          <span className={labelClass}>{t("telegramWelcome.text")}</span>
          <textarea
            value={draft.text}
            onChange={(event) => update(active, { text: event.target.value })}
            className={`${adminInputClass} min-h-40`}
            maxLength={TELEGRAM_WELCOME_TEXT_MAX}
            rows={6}
          />
        </label>
        <p className="text-text/40 text-xs">
          {t("telegramWelcome.count", {
            count: draft.text.length,
            max: TELEGRAM_WELCOME_TEXT_MAX,
          })}
        </p>

        <div className="space-y-2">
          <span className={labelClass}>{t("telegramWelcome.media")}</span>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            {draft.mediaUrl && draft.mediaType === "video" ? (
              <video
                src={draft.mediaUrl}
                controls
                muted
                playsInline
                className="border-text/10 bg-text/5 h-28 w-40 shrink-0 border object-contain"
              />
            ) : draft.mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.mediaUrl}
                alt=""
                className="border-text/10 bg-text/5 h-28 w-40 shrink-0 border object-contain"
              />
            ) : (
              <div className="border-text/10 bg-text/5 text-text/35 flex h-28 w-40 shrink-0 items-center justify-center border text-[10px] tracking-wide uppercase">
                {t("pages.assetEmpty")}
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-text/55 hover:text-accent inline-flex cursor-pointer items-center gap-2 text-xs tracking-wide uppercase">
                  <input
                    type="file"
                    accept={MEDIA_ACCEPT}
                    className="sr-only"
                    disabled={busy}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) uploadMedia(active, file);
                    }}
                  />
                  <span className="border-text/15 hover:border-accent/40 border px-3 py-1.5">
                    {uploading
                      ? t("telegramWelcome.mediaUploading")
                      : t("telegramWelcome.mediaUpload")}
                  </span>
                </label>
                {draft.mediaUrl ? (
                  <button
                    type="button"
                    disabled={busy}
                    className={linkClass}
                    onClick={() => {
                      update(active, { mediaUrl: null, mediaType: null });
                      setStatus({
                        error: null,
                        notice: t("telegramWelcome.mediaRemoved"),
                      });
                    }}
                  >
                    {t("telegramWelcome.mediaRemove")}
                  </button>
                ) : null}
              </div>
              <p className="text-text/40 text-xs">
                {t("telegramWelcome.mediaHelp")}
              </p>
            </div>
          </div>
        </div>

        <label className="block">
          <span className={labelClass}>{t("telegramWelcome.caption")}</span>
          <textarea
            value={draft.caption}
            onChange={(event) =>
              update(active, { caption: event.target.value })
            }
            className={`${adminInputClass} min-h-24`}
            maxLength={TELEGRAM_WELCOME_CAPTION_MAX}
            rows={3}
          />
        </label>
        <p className="text-text/40 text-xs">
          {t("telegramWelcome.captionHelp")}{" "}
          {t("telegramWelcome.count", {
            count: draft.caption.length,
            max: TELEGRAM_WELCOME_CAPTION_MAX,
          })}
        </p>
        {captionFallbackTooLong ? (
          <p className="text-accent text-sm">
            {t("telegramWelcome.captionWarning")}
          </p>
        ) : null}

        <fieldset className="space-y-3">
          <legend className={labelClass}>{t("telegramWelcome.buttons")}</legend>
          {draft.buttons.map((button, index) => (
            <div
              key={button.id}
              className="flex flex-col gap-2 sm:flex-row sm:items-end"
            >
              <label className="block sm:w-40">
                <span className="text-text/35 mb-1 block text-[10px] tracking-[0.16em] uppercase">
                  {t("telegramWelcome.buttonLabel", { index: index + 1 })}
                </span>
                <input
                  value={button.label}
                  onChange={(event) =>
                    updateButton(button.id, { label: event.target.value })
                  }
                  className={adminInputClass}
                  maxLength={TELEGRAM_WELCOME_BUTTON_LABEL_MAX}
                />
              </label>
              <label className="block min-w-0 flex-1">
                <span className="text-text/35 mb-1 block text-[10px] tracking-[0.16em] uppercase">
                  {t("telegramWelcome.buttonUrl")}
                </span>
                <input
                  value={button.url}
                  onChange={(event) =>
                    updateButton(button.id, { url: event.target.value })
                  }
                  className={adminInputClass}
                  placeholder="https://t.me/…"
                  autoCapitalize="none"
                  spellCheck={false}
                  inputMode="url"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                className={`${linkClass} h-10`}
                onClick={() =>
                  update(active, {
                    buttons: draft.buttons.filter(
                      (item) => item.id !== button.id,
                    ),
                  })
                }
              >
                {t("telegramWelcome.removeButton")}
              </button>
            </div>
          ))}
          {draft.buttons.length < TELEGRAM_WELCOME_MAX_BUTTONS ? (
            <button
              type="button"
              disabled={busy}
              className={linkClass}
              onClick={() =>
                update(active, {
                  buttons: [
                    ...draft.buttons,
                    { id: buttonIdSeq++, label: "", url: "" },
                  ],
                })
              }
            >
              {t("telegramWelcome.addButton")}
            </button>
          ) : null}
        </fieldset>
        <p className="text-text/40 text-xs">
          {t("telegramWelcome.buttonsHelp")}
        </p>

        {status.error ? (
          <p className="text-accent text-sm">{status.error}</p>
        ) : null}
        {status.notice ? (
          <p className="text-text/55 text-sm">{status.notice}</p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
        >
          {isPending && !uploading
            ? t("actions.saving")
            : t("telegramWelcome.save", { language })}
        </button>
      </form>
    </section>
  );
}
