"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";

import { routing, type Locale } from "@/i18n/routing";
import { requireAdmin, requireVerifiedAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { TELEGRAM_WELCOME_KEYS } from "@/lib/site";
import { createServiceClient } from "@/lib/supabase/admin";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import {
  TELEGRAM_MEDIA_BUCKET,
  TELEGRAM_WELCOME_MEDIA_FOLDER,
} from "@/lib/supabase/storage";
import {
  TELEGRAM_WELCOME_MEDIA_MIME,
  isTelegramWelcomeEmpty,
  isTelegramWelcomeMediaMime,
  parseStoredTelegramWelcome,
  parseTelegramWelcomeInput,
  type TelegramWelcome,
  type TelegramWelcomeByLocale,
  type TelegramWelcomeInputError,
  type TelegramWelcomeMediaType,
} from "@/lib/telegram-welcome";

export type TelegramWelcomeSaveResult =
  | { ok: true; value: TelegramWelcome }
  | {
      ok: false;
      error: TelegramWelcomeInputError | "invalidLocale";
      buttonIndex?: number;
    };

export type TelegramMediaUploadError =
  "invalidLocale" | "invalidType" | "tooLarge" | "uploadFailed";

export type PrepareTelegramMediaResult =
  | { ok: true; path: string; token: string }
  | { ok: false; error: TelegramMediaUploadError };

export type FinalizeTelegramMediaResult =
  | { ok: true; url: string; mediaType: TelegramWelcomeMediaType }
  | { ok: false; error: TelegramMediaUploadError };

function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (routing.locales as readonly string[]).includes(value)
  );
}

const MEDIA_EXTENSIONS = Object.values(TELEGRAM_WELCOME_MEDIA_MIME)
  .map((item) => item.ext)
  .join("|");

/** `<locale>-<random>.<ext>` — one locale per file so saves never touch other languages. */
function mediaFileNamePattern(locale?: Locale) {
  const prefix = locale ?? routing.locales.join("|");
  return new RegExp(`^(?:${prefix})-[a-z0-9]{8,40}\\.(?:${MEDIA_EXTENSIONS})$`);
}

function mediaPublicUrlPrefix() {
  const origin = new URL(getSupabasePublicEnv().url).origin;
  return `${origin}/storage/v1/object/public/${TELEGRAM_MEDIA_BUCKET}/${TELEGRAM_WELCOME_MEDIA_FOLDER}/`;
}

function mediaFileNameFromUrl(url: string): string | null {
  const prefix = mediaPublicUrlPrefix();
  if (!url.startsWith(prefix)) return null;
  const name = url.slice(prefix.length);
  return mediaFileNamePattern().test(name) ? name : null;
}

function ownMediaUrlCheck(locale: Locale) {
  return (url: string) => {
    const name = mediaFileNameFromUrl(url);
    return Boolean(name && mediaFileNamePattern(locale).test(name));
  };
}

function revalidateSettingsPage() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/settings`);
  }
}

export async function getTelegramWelcomeSettings(): Promise<TelegramWelcomeByLocale> {
  await requireAdmin();
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: Object.values(TELEGRAM_WELCOME_KEYS) } },
  });
  const byKey = new Map(rows.map((row) => [row.key, row.value]));
  return {
    en: parseStoredTelegramWelcome(
      byKey.get(TELEGRAM_WELCOME_KEYS.en),
      ownMediaUrlCheck("en"),
    ),
    zh: parseStoredTelegramWelcome(
      byKey.get(TELEGRAM_WELCOME_KEYS.zh),
      ownMediaUrlCheck("zh"),
    ),
    th: parseStoredTelegramWelcome(
      byKey.get(TELEGRAM_WELCOME_KEYS.th),
      ownMediaUrlCheck("th"),
    ),
  };
}

/** Delete this locale's media files except the one still in use. */
async function removeUnusedMedia(locale: Locale, keepUrl: string | null) {
  const keep = keepUrl ? mediaFileNameFromUrl(keepUrl) : null;
  const pattern = mediaFileNamePattern(locale);
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(TELEGRAM_MEDIA_BUCKET)
    .list(TELEGRAM_WELCOME_MEDIA_FOLDER, { search: `${locale}-`, limit: 100 });
  if (error) {
    console.error("[telegramWelcome.cleanup]", error.message);
    return;
  }
  const stale = (data ?? [])
    .map((row) => row.name)
    .filter((name) => pattern.test(name) && name !== keep)
    .map((name) => `${TELEGRAM_WELCOME_MEDIA_FOLDER}/${name}`);
  if (!stale.length) return;
  const removed = await supabase.storage
    .from(TELEGRAM_MEDIA_BUCKET)
    .remove(stale);
  if (removed.error) {
    console.error("[telegramWelcome.cleanup]", removed.error.message);
  }
}

/** Saves one language only. Empty content stores "" (not set → the bot uses its built-in welcome). */
export async function updateTelegramWelcome(
  locale: unknown,
  input: unknown,
): Promise<TelegramWelcomeSaveResult> {
  await requireAdmin();
  if (!isLocale(locale)) return { ok: false, error: "invalidLocale" };

  const parsed = parseTelegramWelcomeInput(input, ownMediaUrlCheck(locale));
  if (!parsed.ok) return parsed;

  const key = TELEGRAM_WELCOME_KEYS[locale];
  const value = isTelegramWelcomeEmpty(parsed.value)
    ? ""
    : JSON.stringify(parsed.value);
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });

  await removeUnusedMedia(locale, parsed.value.mediaUrl);
  revalidateSettingsPage();
  return { ok: true, value: parsed.value };
}

/**
 * Step 1 of a media upload: check type and size, then hand the browser a
 * one-time signed URL so large files go straight to Storage instead of
 * through the Server Action body limit.
 */
export async function prepareTelegramMediaUpload(input: {
  locale: unknown;
  mime: unknown;
  size: unknown;
}): Promise<PrepareTelegramMediaResult> {
  await requireVerifiedAdmin();
  if (!isLocale(input.locale)) return { ok: false, error: "invalidLocale" };
  if (
    typeof input.mime !== "string" ||
    !isTelegramWelcomeMediaMime(input.mime)
  ) {
    return { ok: false, error: "invalidType" };
  }
  const spec = TELEGRAM_WELCOME_MEDIA_MIME[input.mime];
  if (
    typeof input.size !== "number" ||
    input.size < 1 ||
    input.size > spec.maxBytes
  ) {
    return { ok: false, error: "tooLarge" };
  }

  const name = `${input.locale}-${Date.now().toString(36)}${randomBytes(6).toString("hex")}.${spec.ext}`;
  const path = `${TELEGRAM_WELCOME_MEDIA_FOLDER}/${name}`;
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(TELEGRAM_MEDIA_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[prepareTelegramMediaUpload]", error?.message);
    return { ok: false, error: "uploadFailed" };
  }
  return { ok: true, path, token: data.token };
}

/** Step 2: confirm what landed in Storage really matches the limits, then return its public URL. */
export async function finalizeTelegramMediaUpload(input: {
  locale: unknown;
  path: unknown;
}): Promise<FinalizeTelegramMediaResult> {
  await requireVerifiedAdmin();
  if (!isLocale(input.locale)) return { ok: false, error: "invalidLocale" };
  const folderPrefix = `${TELEGRAM_WELCOME_MEDIA_FOLDER}/`;
  const path = typeof input.path === "string" ? input.path : "";
  const name = path.startsWith(folderPrefix)
    ? path.slice(folderPrefix.length)
    : "";
  if (!mediaFileNamePattern(input.locale).test(name)) {
    return { ok: false, error: "uploadFailed" };
  }

  const supabase = createServiceClient();
  const bucket = supabase.storage.from(TELEGRAM_MEDIA_BUCKET);
  const { data, error } = await bucket.list(TELEGRAM_WELCOME_MEDIA_FOLDER, {
    search: name,
    limit: 10,
  });
  const object = data?.find((row) => row.name === name);
  if (error || !object) {
    console.error(
      "[finalizeTelegramMediaUpload]",
      error?.message ?? "missing object",
    );
    return { ok: false, error: "uploadFailed" };
  }

  const mime = String(object.metadata?.mimetype ?? "");
  const size = Number(object.metadata?.size ?? 0);
  const ext = name.slice(name.lastIndexOf(".") + 1);
  const spec = isTelegramWelcomeMediaMime(mime)
    ? TELEGRAM_WELCOME_MEDIA_MIME[mime]
    : null;
  const problem: TelegramMediaUploadError | null =
    !spec || spec.ext !== ext
      ? "invalidType"
      : size < 1 || size > spec.maxBytes
        ? "tooLarge"
        : null;
  if (problem || !spec) {
    await bucket.remove([path]);
    return { ok: false, error: problem ?? "invalidType" };
  }

  return {
    ok: true,
    url: `${mediaPublicUrlPrefix()}${name}`,
    mediaType: spec.type,
  };
}
