"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";

import { routing, type Locale } from "@/i18n/routing";
import { requireAdmin, requireVerifiedAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { TELEGRAM_RANKINGS_KEYS } from "@/lib/site";
import { createServiceClient } from "@/lib/supabase/admin";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import {
  TELEGRAM_MEDIA_BUCKET,
  TELEGRAM_RANKINGS_MEDIA_FOLDER,
} from "@/lib/supabase/storage";
import {
  isTelegramRankingsEmpty,
  parseStoredTelegramRankings,
  parseTelegramRankingsInput,
  sniffTelegramMediaMime,
  type TelegramRankingsBanner,
  type TelegramRankingsByLocale,
  type TelegramRankingsInputError,
} from "@/lib/telegram-rankings";
import {
  TELEGRAM_WELCOME_MEDIA_MIME,
  isTelegramWelcomeMediaMime,
  type TelegramWelcomeMediaType,
} from "@/lib/telegram-welcome";

export type TelegramRankingsSaveResult =
  | { ok: true; value: TelegramRankingsBanner }
  | { ok: false; error: TelegramRankingsInputError | "invalidLocale" };

export type TelegramRankingsUploadError =
  "invalidLocale" | "invalidType" | "tooLarge" | "uploadFailed";

export type PrepareTelegramRankingsMediaResult =
  | { ok: true; path: string; token: string }
  | { ok: false; error: TelegramRankingsUploadError };

export type FinalizeTelegramRankingsMediaResult =
  | { ok: true; url: string; mediaType: TelegramWelcomeMediaType }
  | { ok: false; error: TelegramRankingsUploadError };

function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (routing.locales as readonly string[]).includes(value)
  );
}

const MEDIA_EXTENSIONS = Object.values(TELEGRAM_WELCOME_MEDIA_MIME)
  .map((item) => item.ext)
  .join("|");

/** `<random>.<ext>`; a new name on every upload. */
const MEDIA_FILE_NAME = new RegExp(`^[a-z0-9]{8,40}\\.(?:${MEDIA_EXTENSIONS})$`);

/** `rankings/<locale>`: each language has its own folder, so a save only ever cleans its own files. */
function localeFolder(locale: Locale) {
  return `${TELEGRAM_RANKINGS_MEDIA_FOLDER}/${locale}`;
}

function mediaPublicUrlPrefix(locale: Locale) {
  const origin = new URL(getSupabasePublicEnv().url).origin;
  return `${origin}/storage/v1/object/public/${TELEGRAM_MEDIA_BUCKET}/${localeFolder(locale)}/`;
}

function mediaFileNameFromUrl(locale: Locale, url: string): string | null {
  const prefix = mediaPublicUrlPrefix(locale);
  if (!url.startsWith(prefix)) return null;
  const name = url.slice(prefix.length);
  return MEDIA_FILE_NAME.test(name) ? name : null;
}

function ownMediaUrlCheck(locale: Locale) {
  return (url: string) => mediaFileNameFromUrl(locale, url) !== null;
}

function revalidateTelegramPage() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/telegram`);
  }
}

export async function getTelegramRankingsSettings(): Promise<TelegramRankingsByLocale> {
  await requireAdmin();
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: Object.values(TELEGRAM_RANKINGS_KEYS) } },
  });
  const byKey = new Map(rows.map((row) => [row.key, row.value]));
  return {
    en: parseStoredTelegramRankings(byKey.get(TELEGRAM_RANKINGS_KEYS.en), ownMediaUrlCheck("en")),
    zh: parseStoredTelegramRankings(byKey.get(TELEGRAM_RANKINGS_KEYS.zh), ownMediaUrlCheck("zh")),
    th: parseStoredTelegramRankings(byKey.get(TELEGRAM_RANKINGS_KEYS.th), ownMediaUrlCheck("th")),
  };
}

/** Delete every file in this locale's folder except the one still in use (replaced, removed or abandoned uploads). */
async function removeUnusedMedia(locale: Locale, keepUrl: string | null) {
  const keep = keepUrl ? mediaFileNameFromUrl(locale, keepUrl) : null;
  const folder = localeFolder(locale);
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(TELEGRAM_MEDIA_BUCKET)
    .list(folder, { limit: 100 });
  if (error) {
    console.error("[telegramRankings.cleanup]", error.message);
    return;
  }
  const stale = (data ?? [])
    .map((row) => row.name)
    .filter((name) => MEDIA_FILE_NAME.test(name) && name !== keep)
    .map((name) => `${folder}/${name}`);
  if (!stale.length) return;
  const removed = await supabase.storage.from(TELEGRAM_MEDIA_BUCKET).remove(stale);
  if (removed.error) {
    console.error("[telegramRankings.cleanup]", removed.error.message);
  }
}

/** Saves one language only. Empty content stores "" (not set → English banner, then the text ranking). */
export async function updateTelegramRankings(
  locale: unknown,
  input: unknown,
): Promise<TelegramRankingsSaveResult> {
  await requireAdmin();
  if (!isLocale(locale)) return { ok: false, error: "invalidLocale" };

  const parsed = parseTelegramRankingsInput(input, ownMediaUrlCheck(locale));
  if (!parsed.ok) return parsed;

  const key = TELEGRAM_RANKINGS_KEYS[locale];
  const value = isTelegramRankingsEmpty(parsed.value)
    ? ""
    : JSON.stringify(parsed.value);
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });

  await removeUnusedMedia(locale, parsed.value.mediaUrl);
  revalidateTelegramPage();
  return { ok: true, value: parsed.value };
}

/**
 * Step 1 of a media upload: check type and size, then hand the browser a one-time signed URL
 * so large files go straight to Storage instead of through the Server Action body limit.
 */
export async function prepareTelegramRankingsMediaUpload(input: {
  locale: unknown;
  mime: unknown;
  size: unknown;
}): Promise<PrepareTelegramRankingsMediaResult> {
  await requireVerifiedAdmin();
  if (!isLocale(input.locale)) return { ok: false, error: "invalidLocale" };
  if (typeof input.mime !== "string" || !isTelegramWelcomeMediaMime(input.mime)) {
    return { ok: false, error: "invalidType" };
  }
  const spec = TELEGRAM_WELCOME_MEDIA_MIME[input.mime];
  if (typeof input.size !== "number" || input.size < 1 || input.size > spec.maxBytes) {
    return { ok: false, error: "tooLarge" };
  }

  const name = `${Date.now().toString(36)}${randomBytes(6).toString("hex")}.${spec.ext}`;
  const path = `${localeFolder(input.locale)}/${name}`;
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(TELEGRAM_MEDIA_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[prepareTelegramRankingsMediaUpload]", error?.message);
    return { ok: false, error: "uploadFailed" };
  }
  return { ok: true, path, token: data.token };
}

/** First bytes of the stored file, read through its public URL; null if they can't be read. */
async function readFileHead(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url, { headers: { Range: "bytes=0-31" }, cache: "no-store" });
    if (!response.ok || !response.body) return null;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (length < 32) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      length += value.length;
    }
    await reader.cancel().catch(() => {});
    const head = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      head.set(chunk, offset);
      offset += chunk.length;
    }
    return head.subarray(0, 32);
  } catch {
    return null;
  }
}

/**
 * Step 2: confirm what landed in Storage matches the limits and that its content really is the
 * declared type (checked from the file's first bytes), then return its public URL and media type.
 */
export async function finalizeTelegramRankingsMediaUpload(input: {
  locale: unknown;
  path: unknown;
}): Promise<FinalizeTelegramRankingsMediaResult> {
  await requireVerifiedAdmin();
  if (!isLocale(input.locale)) return { ok: false, error: "invalidLocale" };
  const folder = localeFolder(input.locale);
  const path = typeof input.path === "string" ? input.path : "";
  const name = path.startsWith(`${folder}/`) ? path.slice(folder.length + 1) : "";
  if (!MEDIA_FILE_NAME.test(name)) {
    return { ok: false, error: "uploadFailed" };
  }

  const supabase = createServiceClient();
  const bucket = supabase.storage.from(TELEGRAM_MEDIA_BUCKET);
  const { data, error } = await bucket.list(folder, { search: name, limit: 10 });
  const object = data?.find((row) => row.name === name);
  if (error || !object) {
    console.error("[finalizeTelegramRankingsMediaUpload]", error?.message ?? "missing object");
    return { ok: false, error: "uploadFailed" };
  }

  const mime = String(object.metadata?.mimetype ?? "");
  const size = Number(object.metadata?.size ?? 0);
  const ext = name.slice(name.lastIndexOf(".") + 1);
  const spec = isTelegramWelcomeMediaMime(mime) ? TELEGRAM_WELCOME_MEDIA_MIME[mime] : null;
  let problem: TelegramRankingsUploadError | null =
    !spec || spec.ext !== ext
      ? "invalidType"
      : size < 1 || size > spec.maxBytes
        ? "tooLarge"
        : null;

  const url = `${mediaPublicUrlPrefix(input.locale)}${name}`;
  if (!problem) {
    const head = await readFileHead(url);
    if (!head) {
      console.error("[finalizeTelegramRankingsMediaUpload]", "could not read the file");
      await bucket.remove([path]);
      return { ok: false, error: "uploadFailed" };
    }
    if (sniffTelegramMediaMime(head) !== mime) problem = "invalidType";
  }
  if (problem || !spec) {
    await bucket.remove([path]);
    return { ok: false, error: problem ?? "invalidType" };
  }

  return { ok: true, url, mediaType: spec.type };
}
