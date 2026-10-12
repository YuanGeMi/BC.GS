import type { Locale } from "@/i18n/routing";
import {
  telegramWelcomeMediaTypeForExt,
  type TelegramWelcomeMediaType,
} from "@/lib/telegram-welcome";

export const TELEGRAM_RANKINGS_INTRO_MAX = 300;

/** Stored as JSON in SiteSetting `telegram_rankings_<locale>`; "" means not set. */
export type TelegramRankingsBanner = {
  introText: string;
  mediaUrl: string | null;
  mediaType: TelegramWelcomeMediaType | null;
};

export type TelegramRankingsByLocale = Record<Locale, TelegramRankingsBanner>;

export type TelegramRankingsInputError = "introTooLong" | "invalidMedia";

export function emptyTelegramRankingsBanner(): TelegramRankingsBanner {
  return { introText: "", mediaUrl: null, mediaType: null };
}

export function isTelegramRankingsEmpty(value: TelegramRankingsBanner): boolean {
  return !value.introText && !value.mediaUrl;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** jpg/png/webp → photo, gif → animation, mp4 → video, from the file name the server chose. */
function mediaTypeFromUrl(value: string): TelegramWelcomeMediaType | null {
  try {
    const ext = /\.([a-z0-9]+)$/i.exec(new URL(value).pathname)?.[1];
    return ext ? telegramWelcomeMediaTypeForExt(ext) : null;
  } catch {
    return null;
  }
}

/**
 * Validate an admin draft. Unknown fields are dropped and a client-sent mediaType is ignored:
 * the type always comes from the media URL, which only the server can produce.
 */
export function parseTelegramRankingsInput(
  input: unknown,
  isOwnMediaUrl: (url: string) => boolean,
):
  | { ok: true; value: TelegramRankingsBanner }
  | { ok: false; error: TelegramRankingsInputError } {
  const raw =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};

  const introText = asString(raw.introText).trim();
  if (introText.length > TELEGRAM_RANKINGS_INTRO_MAX) {
    return { ok: false, error: "introTooLong" };
  }

  const rawMediaUrl = asString(raw.mediaUrl).trim();
  if (!rawMediaUrl) {
    return { ok: true, value: { introText, mediaUrl: null, mediaType: null } };
  }
  const mediaType = mediaTypeFromUrl(rawMediaUrl);
  if (!mediaType || !isOwnMediaUrl(rawMediaUrl)) {
    return { ok: false, error: "invalidMedia" };
  }
  return { ok: true, value: { introText, mediaUrl: rawMediaUrl, mediaType } };
}

/** MIME type from the file's first bytes (at least 12), or null when it is none of jpg, png, webp, gif, mp4. */
export function sniffTelegramMediaMime(
  head: Uint8Array,
): "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "video/mp4" | null {
  const ascii = (from: number, to: number) =>
    String.fromCharCode(...head.subarray(from, to));
  if (head.length < 12) return null;
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, i) => head[i] === byte)) {
    return "image/png";
  }
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return "image/gif";
  // ISO base media with an MP4 brand; QuickTime (.mov, brand "qt  ") is not MP4.
  if (ascii(4, 8) === "ftyp" && ascii(8, 12) !== "qt  ") return "video/mp4";
  return null;
}

/** Read a stored value. Anything that isn't valid JSON of the expected shape is "not set". */
export function parseStoredTelegramRankings(
  stored: string | undefined,
  isOwnMediaUrl: (url: string) => boolean,
): TelegramRankingsBanner {
  if (!stored?.trim()) return emptyTelegramRankingsBanner();
  let json: unknown;
  try {
    json = JSON.parse(stored);
  } catch {
    return emptyTelegramRankingsBanner();
  }
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return emptyTelegramRankingsBanner();
  }
  const parsed = parseTelegramRankingsInput(json, isOwnMediaUrl);
  if (!parsed.ok) return emptyTelegramRankingsBanner();
  // A stored type that disagrees with the file means the row was not written by the admin.
  const storedType = (json as Record<string, unknown>).mediaType ?? null;
  if (storedType !== parsed.value.mediaType) return emptyTelegramRankingsBanner();
  return parsed.value;
}
