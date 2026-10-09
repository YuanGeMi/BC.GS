"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";

import { routing } from "@/i18n/routing";
import {
  setTelegramProfilePhoto,
  type SetProfilePhotoFailure,
} from "@/lib/admin/telegram-bot-avatar";
import { requireAdmin, requireVerifiedAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { SITE_SETTING_KEYS } from "@/lib/site";
import { createServiceClient } from "@/lib/supabase/admin";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import {
  TELEGRAM_BOT_AVATAR_FOLDER,
  TELEGRAM_MEDIA_BUCKET,
} from "@/lib/supabase/storage";
import {
  BOT_AVATAR_MAX_BYTES,
  botAvatarDimensionsOk,
  jpegDimensions,
  sniffImageType,
} from "@/lib/telegram-bot-avatar";

export type BotAvatarError =
  | "notConfigured"
  | "invalidType"
  | "tooLarge"
  | "invalidDimensions"
  | "uploadFailed"
  | SetProfilePhotoFailure;

export type BotAvatarSettings = {
  /** Public URL of the last picture applied from this page, or null. */
  url: string | null;
  tokenConfigured: boolean;
};

export type PrepareBotAvatarResult =
  | { ok: true; path: string; token: string }
  | { ok: false; error: BotAvatarError };

export type ApplyBotAvatarResult =
  | { ok: true; url: string }
  | { ok: false; error: BotAvatarError; retryAfter?: number };

const AVATAR_KEY = SITE_SETTING_KEYS.telegramBotAvatar;
const FILE_NAME_PATTERN = /^[a-z0-9]{8,40}\.jpg$/;

function botToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
}

function avatarPublicUrlPrefix() {
  const origin = new URL(getSupabasePublicEnv().url).origin;
  return `${origin}/storage/v1/object/public/${TELEGRAM_MEDIA_BUCKET}/${TELEGRAM_BOT_AVATAR_FOLDER}/`;
}

function fileNameFromPath(path: unknown): string | null {
  if (typeof path !== "string") return null;
  const prefix = `${TELEGRAM_BOT_AVATAR_FOLDER}/`;
  if (!path.startsWith(prefix)) return null;
  const name = path.slice(prefix.length);
  return FILE_NAME_PATTERN.test(name) ? name : null;
}

function storedAvatarUrl(value: string | undefined): string | null {
  const url = value?.trim() ?? "";
  const prefix = avatarPublicUrlPrefix();
  return url.startsWith(prefix) &&
    FILE_NAME_PATTERN.test(url.slice(prefix.length))
    ? url
    : null;
}

export async function getBotAvatarSettings(): Promise<BotAvatarSettings> {
  await requireAdmin();
  const row = await prisma.siteSetting.findUnique({
    where: { key: AVATAR_KEY },
  });
  return {
    url: storedAvatarUrl(row?.value),
    tokenConfigured: Boolean(botToken()),
  };
}

/** Step 1: a one-time signed upload link for `avatar/<random>.jpg`. */
export async function prepareBotAvatarUpload(input: {
  size: unknown;
}): Promise<PrepareBotAvatarResult> {
  await requireVerifiedAdmin();
  if (!botToken()) return { ok: false, error: "notConfigured" };
  if (
    typeof input.size !== "number" ||
    input.size < 1 ||
    input.size > BOT_AVATAR_MAX_BYTES
  ) {
    return { ok: false, error: "tooLarge" };
  }

  const name = `${Date.now().toString(36)}${randomBytes(6).toString("hex")}.jpg`;
  const path = `${TELEGRAM_BOT_AVATAR_FOLDER}/${name}`;
  const { data, error } = await createServiceClient()
    .storage.from(TELEGRAM_MEDIA_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[prepareBotAvatarUpload]", error?.message);
    return { ok: false, error: "uploadFailed" };
  }
  return { ok: true, path, token: data.token };
}

/**
 * Step 2: check the stored file's real bytes, send it to Telegram, and only on
 * success save its URL and delete older pictures. Any failure deletes the new
 * file and leaves the saved URL as it was.
 */
export async function applyBotAvatar(input: {
  path: unknown;
}): Promise<ApplyBotAvatarResult> {
  await requireVerifiedAdmin();
  const name = fileNameFromPath(input.path);
  if (!name) return { ok: false, error: "uploadFailed" };
  const path = `${TELEGRAM_BOT_AVATAR_FOLDER}/${name}`;
  const bucket = createServiceClient().storage.from(TELEGRAM_MEDIA_BUCKET);
  const discard = async () => {
    const { error } = await bucket.remove([path]);
    if (error) console.error("[applyBotAvatar] cleanup", error.message);
  };

  const token = botToken();
  if (!token) {
    await discard();
    return { ok: false, error: "notConfigured" };
  }

  const { data: blob, error: downloadError } = await bucket.download(path);
  if (downloadError || !blob) {
    console.error(
      "[applyBotAvatar] download",
      downloadError?.message ?? "missing",
    );
    return { ok: false, error: "uploadFailed" };
  }
  if (blob.size < 1 || blob.size > BOT_AVATAR_MAX_BYTES) {
    await discard();
    return { ok: false, error: "tooLarge" };
  }
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (sniffImageType(bytes) !== "jpeg") {
    await discard();
    return { ok: false, error: "invalidType" };
  }
  const size = jpegDimensions(bytes);
  if (!size || !botAvatarDimensionsOk(size.width, size.height)) {
    await discard();
    return { ok: false, error: size ? "invalidDimensions" : "invalidType" };
  }

  const result = await setTelegramProfilePhoto({ token, jpeg: bytes });
  if (!result.ok) {
    console.warn(
      `[applyBotAvatar] Telegram refused the picture: ${result.reason}`,
    );
    await discard();
    return {
      ok: false,
      error: result.reason,
      ...(result.retryAfter ? { retryAfter: result.retryAfter } : {}),
    };
  }

  const url = `${avatarPublicUrlPrefix()}${name}`;
  await prisma.siteSetting.upsert({
    where: { key: AVATAR_KEY },
    create: { key: AVATAR_KEY, value: url },
    update: { value: url },
  });

  const { data: files, error: listError } = await bucket.list(
    TELEGRAM_BOT_AVATAR_FOLDER,
    { limit: 100 },
  );
  if (listError) {
    console.error("[applyBotAvatar] list", listError.message);
  } else {
    const stale = (files ?? [])
      .map((file) => file.name)
      .filter((file) => file !== name && FILE_NAME_PATTERN.test(file))
      .map((file) => `${TELEGRAM_BOT_AVATAR_FOLDER}/${file}`);
    if (stale.length) {
      const { error } = await bucket.remove(stale);
      if (error) console.error("[applyBotAvatar] cleanup", error.message);
    }
  }

  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/settings`);
  }
  return { ok: true, url };
}
