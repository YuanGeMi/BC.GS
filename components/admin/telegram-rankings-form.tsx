"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { toast } from "@/components/admin/admin-toast";
import { routing, type Locale } from "@/i18n/routing";
import { adminTextareaClass } from "@/lib/admin/fields";
import {
  finalizeTelegramRankingsMediaUpload,
  prepareTelegramRankingsMediaUpload,
  updateTelegramRankings,
  type TelegramRankingsUploadError,
} from "@/lib/admin/telegram-rankings";
import { createClient } from "@/lib/supabase/client";
import { TELEGRAM_MEDIA_BUCKET } from "@/lib/supabase/storage";
import {
  TELEGRAM_RANKINGS_INTRO_MAX,
  type TelegramRankingsBanner,
  type TelegramRankingsByLocale,
} from "@/lib/telegram-rankings";
import {
  TELEGRAM_WELCOME_MEDIA_MIME,
  isTelegramWelcomeMediaMime,
} from "@/lib/telegram-welcome";

const MEDIA_ACCEPT = Object.keys(TELEGRAM_WELCOME_MEDIA_MIME).join(",");

const labelClass =
  "text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase";
const linkClass =
  "text-text/55 hover:text-accent text-xs tracking-wide uppercase disabled:opacity-40";

export function TelegramRankingsForm({
  initial,
}: {
  initial: TelegramRankingsByLocale;
}) {
  const t = useTranslations("Admin");
  const [drafts, setDrafts] = useState<Record<Locale, TelegramRankingsBanner>>(
    () => ({ en: initial.en, zh: initial.zh, th: initial.th }),
  );
  const [active, setActive] = useState<Locale>("en");
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const draft = drafts[active];
  const language = t(`pages.footerTaglineLocale.${active}`);
  const busy = isPending || uploading;

  function update(locale: Locale, patch: Partial<TelegramRankingsBanner>) {
    setDrafts((current) => ({
      ...current,
      [locale]: { ...current[locale], ...patch },
    }));
  }

  function uploadErrorMessage(error: TelegramRankingsUploadError, mime: string) {
    if (error === "tooLarge") {
      return TELEGRAM_WELCOME_MEDIA_MIME[
        mime as keyof typeof TELEGRAM_WELCOME_MEDIA_MIME
      ]?.type === "photo"
        ? t("telegramRankings.errors.imageTooLarge")
        : t("telegramRankings.errors.mediaTooLarge");
    }
    return t(`telegramRankings.errors.${error}`);
  }

  function uploadMedia(locale: Locale, file: File) {
    if (!isTelegramWelcomeMediaMime(file.type)) {
      toast.error(t("telegramRankings.errors.invalidType"));
      return;
    }
    if (file.size > TELEGRAM_WELCOME_MEDIA_MIME[file.type].maxBytes) {
      toast.error(uploadErrorMessage("tooLarge", file.type));
      return;
    }

    setUploading(true);
    startTransition(async () => {
      try {
        const prepared = await prepareTelegramRankingsMediaUpload({
          locale,
          mime: file.type,
          size: file.size,
        });
        if (!prepared.ok) {
          toast.error(uploadErrorMessage(prepared.error, file.type));
          return;
        }

        const { error: storageError } = await createClient()
          .storage.from(TELEGRAM_MEDIA_BUCKET)
          .uploadToSignedUrl(prepared.path, prepared.token, file, {
            contentType: file.type,
            cacheControl: "3600",
          });
        if (storageError) {
          toast.error(t("telegramRankings.errors.uploadFailed"));
          return;
        }

        const finalized = await finalizeTelegramRankingsMediaUpload({
          locale,
          path: prepared.path,
        });
        if (!finalized.ok) {
          toast.error(uploadErrorMessage(finalized.error, file.type));
          return;
        }
        update(locale, {
          mediaUrl: finalized.url,
          mediaType: finalized.mediaType,
        });
        toast.success(t("telegramRankings.mediaUploaded"));
      } catch {
        toast.error(t("telegramRankings.errors.uploadFailed"));
      } finally {
        setUploading(false);
      }
    });
  }

  function save(locale: Locale) {
    const current = drafts[locale];
    startTransition(async () => {
      const result = await updateTelegramRankings(locale, {
        introText: current.introText,
        mediaUrl: current.mediaUrl,
      });
      const name = t(`pages.footerTaglineLocale.${locale}`);
      if (!result.ok) {
        toast.error(t(`telegramRankings.errors.${result.error}`));
        return;
      }
      update(locale, result.value);
      toast.success(
        !result.value.introText && !result.value.mediaUrl
          ? t("telegramRankings.cleared", { language: name })
          : t("telegramRankings.saved", { language: name }),
      );
    });
  }

  return (
    <section className="border-text/10 mt-12 max-w-xl border-t pt-8">
      <h2 className="font-display text-2xl tracking-tight">
        {t("telegramRankings.title")}
      </h2>
      <p className="text-text/55 mt-2 text-sm">{t("telegramRankings.help")}</p>

      <div
        role="tablist"
        aria-label={t("telegramRankings.title")}
        className="border-text/10 mt-5 flex gap-1 border-b"
      >
        {routing.locales.map((locale) => (
          <button
            key={locale}
            type="button"
            role="tab"
            aria-selected={active === locale}
            disabled={busy}
            onClick={() => setActive(locale)}
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
        <div className="space-y-2">
          <span className={labelClass}>{t("telegramRankings.media")}</span>
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
                      ? t("telegramRankings.mediaUploading")
                      : t("telegramRankings.mediaUpload")}
                  </span>
                </label>
                {draft.mediaUrl ? (
                  <button
                    type="button"
                    disabled={busy}
                    className={linkClass}
                    onClick={() => {
                      update(active, { mediaUrl: null, mediaType: null });
                      toast.success(t("telegramRankings.mediaRemoved"));
                    }}
                  >
                    {t("telegramRankings.mediaRemove")}
                  </button>
                ) : null}
              </div>
              <p className="text-text/40 text-xs">
                {t("telegramRankings.mediaHelp")}
              </p>
            </div>
          </div>
        </div>

        <label className="block">
          <span className={labelClass}>{t("telegramRankings.intro")}</span>
          <textarea
            value={draft.introText}
            onChange={(event) => update(active, { introText: event.target.value })}
            className={`${adminTextareaClass} min-h-24`}
            maxLength={TELEGRAM_RANKINGS_INTRO_MAX}
            rows={3}
          />
        </label>
        <p className="text-text/40 text-xs">
          {t("telegramRankings.introHelp")}{" "}
          {t("telegramRankings.count", {
            count: draft.introText.length,
            max: TELEGRAM_RANKINGS_INTRO_MAX,
          })}
        </p>

        <button
          type="submit"
          disabled={busy}
          className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
        >
          {isPending && !uploading
            ? t("actions.saving")
            : t("telegramRankings.save", { language })}
        </button>
      </form>
    </section>
  );
}
