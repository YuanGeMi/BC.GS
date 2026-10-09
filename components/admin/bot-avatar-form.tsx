"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";

import {
  applyBotAvatar,
  prepareBotAvatarUpload,
  type BotAvatarError,
} from "@/lib/admin/bot-avatar";
import { createClient } from "@/lib/supabase/client";
import { TELEGRAM_MEDIA_BUCKET } from "@/lib/supabase/storage";
import {
  BOT_AVATAR_MAX_BYTES,
  botAvatarDimensionsOk,
  sniffImageType,
} from "@/lib/telegram-bot-avatar";

type Picked = { blob: Blob; previewUrl: string };

const labelClass =
  "text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase";

/** Telegram takes JPG only, so a PNG is drawn onto a white canvas and re-encoded. */
async function toJpeg(file: File): Promise<Blob | "invalidType"> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const type = sniffImageType(head);
  if (type === "jpeg") return file.slice(0, file.size, "image/jpeg");
  if (type !== "png") return "invalidType";

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) return "invalidType";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );
  return blob ?? "invalidType";
}

export function BotAvatarForm({
  currentUrl: initialUrl,
  tokenConfigured,
}: {
  currentUrl: string | null;
  tokenConfigured: boolean;
}) {
  const t = useTranslations("Admin.botAvatar");
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(
    () => () => {
      if (picked) URL.revokeObjectURL(picked.previewUrl);
    },
    [picked],
  );

  function errorMessage(code: BotAvatarError, retryAfter?: number) {
    if (code === "rateLimited" && retryAfter) {
      return t("errors.rateLimitedWait", { seconds: retryAfter });
    }
    return t(`errors.${code}`);
  }

  function pick(file: File) {
    setError(null);
    setNotice(null);
    setPicked(null);
    startTransition(async () => {
      try {
        const jpeg = await toJpeg(file);
        if (jpeg === "invalidType") {
          setError(t("errors.invalidType"));
          return;
        }
        if (jpeg.size > BOT_AVATAR_MAX_BYTES) {
          setError(t("errors.tooLarge"));
          return;
        }
        const bitmap = await createImageBitmap(jpeg);
        const ok = botAvatarDimensionsOk(bitmap.width, bitmap.height);
        bitmap.close();
        if (!ok) {
          setError(t("errors.invalidDimensions"));
          return;
        }
        setPicked({ blob: jpeg, previewUrl: URL.createObjectURL(jpeg) });
      } catch {
        setError(t("errors.readFailed"));
      }
    });
  }

  function apply() {
    if (!picked) return;
    const { blob } = picked;
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const prepared = await prepareBotAvatarUpload({ size: blob.size });
      if (!prepared.ok) {
        setError(errorMessage(prepared.error));
        return;
      }
      const { error: storageError } = await createClient()
        .storage.from(TELEGRAM_MEDIA_BUCKET)
        .uploadToSignedUrl(prepared.path, prepared.token, blob, {
          contentType: "image/jpeg",
          cacheControl: "3600",
        });
      if (storageError) {
        setError(t("errors.uploadFailed"));
        return;
      }
      const result = await applyBotAvatar({ path: prepared.path });
      if (!result.ok) {
        setError(errorMessage(result.error, result.retryAfter));
        return;
      }
      setCurrentUrl(result.url);
      setPicked(null);
      setNotice(t("applied"));
    });
  }

  return (
    <section className="border-text/10 mt-12 max-w-xl border-t pt-8">
      <h2 className="font-display text-2xl tracking-tight">{t("title")}</h2>
      <p className="text-text/55 mt-2 text-sm">{t("help")}</p>

      {!tokenConfigured ? (
        <p className="text-accent mt-5 text-sm">{t("errors.notConfigured")}</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap gap-6">
            <div>
              <span className={labelClass}>{t("current")}</span>
              {currentUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUrl}
                  alt=""
                  className="border-text/10 bg-text/5 size-28 rounded-full border object-cover"
                />
              ) : (
                <div className="border-text/10 bg-text/5 text-text/35 flex size-28 items-center justify-center rounded-full border text-center text-[10px] tracking-wide uppercase">
                  {t("none")}
                </div>
              )}
            </div>
            {picked ? (
              <div>
                <span className={labelClass}>{t("preview")}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={picked.previewUrl}
                  alt=""
                  className="border-accent/40 bg-text/5 size-28 rounded-full border object-cover"
                />
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-text/55 hover:text-accent inline-flex cursor-pointer items-center gap-2 text-xs tracking-wide uppercase">
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                disabled={isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) pick(file);
                }}
              />
              <span className="border-text/15 hover:border-accent/40 border px-3 py-1.5">
                {t("choose")}
              </span>
            </label>
            <button
              type="button"
              disabled={!picked || isPending}
              onClick={apply}
              className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
            >
              {isPending && picked ? t("applying") : t("apply")}
            </button>
          </div>
          <p className="text-text/40 text-xs">{t("fileHelp")}</p>
          <p className="text-text/40 text-xs">{t("refreshNote")}</p>

          {error ? <p className="text-accent text-sm">{error}</p> : null}
          {notice ? <p className="text-text/55 text-sm">{notice}</p> : null}
        </div>
      )}
    </section>
  );
}
