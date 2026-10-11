import type { Locale } from "@/i18n/routing";

/** Telegram limits: message text 4096, media caption 1024. */
export const TELEGRAM_WELCOME_TEXT_MAX = 4096;
export const TELEGRAM_WELCOME_CAPTION_MAX = 1024;
export const TELEGRAM_WELCOME_BUTTON_LABEL_MAX = 30;
export const TELEGRAM_WELCOME_MAX_BUTTONS = 3;

/** Telegram fetches media by URL: photos up to 5 MB, other files up to 20 MB. */
export const TELEGRAM_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const TELEGRAM_ANIMATION_MAX_BYTES = 20 * 1024 * 1024;
export const TELEGRAM_VIDEO_MAX_BYTES = 20 * 1024 * 1024;

/** Matches the Bot API send method: sendPhoto / sendAnimation / sendVideo. */
export type TelegramWelcomeMediaType = "photo" | "animation" | "video";

export const TELEGRAM_WELCOME_MEDIA_MIME = {
  "image/jpeg": {
    ext: "jpg",
    type: "photo",
    maxBytes: TELEGRAM_IMAGE_MAX_BYTES,
  },
  "image/png": {
    ext: "png",
    type: "photo",
    maxBytes: TELEGRAM_IMAGE_MAX_BYTES,
  },
  "image/webp": {
    ext: "webp",
    type: "photo",
    maxBytes: TELEGRAM_IMAGE_MAX_BYTES,
  },
  "image/gif": {
    ext: "gif",
    type: "animation",
    maxBytes: TELEGRAM_ANIMATION_MAX_BYTES,
  },
  "video/mp4": {
    ext: "mp4",
    type: "video",
    maxBytes: TELEGRAM_VIDEO_MAX_BYTES,
  },
} as const satisfies Record<
  string,
  { ext: string; type: TelegramWelcomeMediaType; maxBytes: number }
>;

export type TelegramWelcomeMediaMime = keyof typeof TELEGRAM_WELCOME_MEDIA_MIME;

export function isTelegramWelcomeMediaMime(
  value: string,
): value is TelegramWelcomeMediaMime {
  return Object.hasOwn(TELEGRAM_WELCOME_MEDIA_MIME, value);
}

export function telegramWelcomeMediaTypeForExt(
  ext: string,
): TelegramWelcomeMediaType | null {
  const match = Object.values(TELEGRAM_WELCOME_MEDIA_MIME).find(
    (item) => item.ext === ext.toLowerCase(),
  );
  return match ? match.type : null;
}

function mediaTypeFromUrl(value: string): TelegramWelcomeMediaType | null {
  try {
    const ext = /\.([a-z0-9]+)$/i.exec(new URL(value).pathname)?.[1];
    return ext ? telegramWelcomeMediaTypeForExt(ext) : null;
  } catch {
    return null;
  }
}

export type TelegramWelcomeButton = { label: string; url: string };

/** Stored as JSON in SiteSetting `telegram_welcome_<locale>`. */
export type TelegramWelcome = {
  text: string;
  caption: string;
  mediaUrl: string | null;
  mediaType: TelegramWelcomeMediaType | null;
  buttons: TelegramWelcomeButton[];
};

export type TelegramWelcomeByLocale = Record<Locale, TelegramWelcome>;

export type TelegramWelcomeInputError =
  | "textTooLong"
  | "captionTooLong"
  | "invalidMedia"
  | "tooManyButtons"
  | "buttonLabelMissing"
  | "buttonLabelTooLong"
  | "buttonUrlInvalid"
  | "captionWithoutMedia"
  | "contentMissing";

export function emptyTelegramWelcome(): TelegramWelcome {
  return {
    text: "",
    caption: "",
    mediaUrl: null,
    mediaType: null,
    buttons: [],
  };
}

export function isTelegramWelcomeEmpty(value: TelegramWelcome): boolean {
  return (
    !value.text &&
    !value.caption &&
    !value.mediaUrl &&
    value.buttons.length === 0
  );
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** https:// only (t.me links included), no credentials, normalized. */
export function parseTelegramButtonUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" || !url.hostname) return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Validate an admin draft. Unknown fields are dropped; fields with the wrong
 * type count as empty. `isOwnMediaUrl` decides which media URLs are accepted.
 */
export function parseTelegramWelcomeInput(
  input: unknown,
  isOwnMediaUrl: (url: string) => boolean,
):
  | { ok: true; value: TelegramWelcome }
  | { ok: false; error: TelegramWelcomeInputError; buttonIndex?: number } {
  const raw =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};

  const text = asString(raw.text).trim();
  if (text.length > TELEGRAM_WELCOME_TEXT_MAX) {
    return { ok: false, error: "textTooLong" };
  }
  const caption = asString(raw.caption).trim();
  if (caption.length > TELEGRAM_WELCOME_CAPTION_MAX) {
    return { ok: false, error: "captionTooLong" };
  }

  let mediaUrl: string | null = null;
  let mediaType: TelegramWelcomeMediaType | null = null;
  const rawMediaUrl = asString(raw.mediaUrl).trim();
  if (rawMediaUrl) {
    mediaType = mediaTypeFromUrl(rawMediaUrl);
    if (!mediaType || !isOwnMediaUrl(rawMediaUrl)) {
      return { ok: false, error: "invalidMedia" };
    }
    mediaUrl = rawMediaUrl;
  }
  // The caption is sent on the media message only; it never stands in for the welcome text.
  if (caption && !mediaUrl) return { ok: false, error: "captionWithoutMedia" };

  const rawButtons = Array.isArray(raw.buttons) ? raw.buttons : [];
  const buttons: TelegramWelcomeButton[] = [];
  for (const [index, item] of rawButtons.entries()) {
    const row =
      item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const label = asString(row.label).trim();
    const rawUrl = asString(row.url).trim();
    if (!label && !rawUrl) continue;
    if (!label)
      return { ok: false, error: "buttonLabelMissing", buttonIndex: index };
    if (label.length > TELEGRAM_WELCOME_BUTTON_LABEL_MAX) {
      return { ok: false, error: "buttonLabelTooLong", buttonIndex: index };
    }
    const url = parseTelegramButtonUrl(rawUrl);
    if (!url)
      return { ok: false, error: "buttonUrlInvalid", buttonIndex: index };
    buttons.push({ label, url });
  }
  if (buttons.length > TELEGRAM_WELCOME_MAX_BUTTONS) {
    return { ok: false, error: "tooManyButtons" };
  }

  const value: TelegramWelcome = {
    text,
    caption,
    mediaUrl,
    mediaType,
    buttons,
  };
  // The bot needs text or media to send anything; buttons alone can't be sent.
  if (!isTelegramWelcomeEmpty(value) && !text && !mediaUrl) {
    return { ok: false, error: "contentMissing" };
  }
  return { ok: true, value };
}

/** Read a stored value. Anything that isn't valid JSON of the expected shape is "not set". */
export function parseStoredTelegramWelcome(
  stored: string | undefined,
  isOwnMediaUrl: (url: string) => boolean,
): TelegramWelcome {
  if (!stored?.trim()) return emptyTelegramWelcome();
  let json: unknown;
  try {
    json = JSON.parse(stored);
  } catch {
    return emptyTelegramWelcome();
  }
  // Older saves could keep a caption without media; the bot ignores it, so drop it here instead of losing the whole value.
  if (json && typeof json === "object" && !Array.isArray(json)) {
    const raw = json as Record<string, unknown>;
    if (!asString(raw.mediaUrl).trim()) json = { ...raw, caption: "" };
  }
  const parsed = parseTelegramWelcomeInput(json, isOwnMediaUrl);
  return parsed.ok ? parsed.value : emptyTelegramWelcome();
}

export const TELEGRAM_WELCOME_PLACEHOLDERS = [
  "{name}",
  "{full_name}",
  "{username}",
] as const;

export type TelegramWelcomeUser = {
  firstName?: string;
  lastName?: string;
  username?: string;
};

// Same rules as the bot (bcgs-telegram-bot src/services/welcome-placeholders.ts), so the preview matches what is sent.
const UNSAFE_NAME_CHARS =
  /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u2069\uFEFF]/g;

function cleanName(value: string | undefined): string {
  return (value ?? "")
    .replace(UNSAFE_NAME_CHARS, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanUsername(value: string | undefined): string {
  const name = (value ?? "").trim().replace(/^@/, "");
  return /^[A-Za-z0-9_]{1,32}$/.test(name) ? name : "";
}

function truncateForTelegram(value: string, max: number): string {
  if (value.length <= max) return value;
  let cut = value.slice(0, max - 1);
  if (/[\uD800-\uDBFF]$/.test(cut)) cut = cut.slice(0, -1);
  return `${cut.trimEnd()}…`;
}

function dropUsername(template: string): string {
  return template
    .replace(/[ \t]*\([ \t]*@?\{username\}[ \t]*\)/g, "")
    .replace(/(^|\n)[ \t]*@?\{username\}[ \t]*/g, "$1")
    .replace(
      /[ \t]*[,;:]?[ \t]*@?\{username\}(?=[ \t]*(?:[!?.,;:)\]]|\n|$))/g,
      "",
    )
    .replace(/[ \t]*@?\{username\}/g, "");
}

/** Fills {name}, {full_name} and {username}, then applies the Telegram length limit. Unknown placeholders stay as typed. */
export function renderTelegramWelcomeTemplate(
  template: string,
  user: TelegramWelcomeUser,
  fallbackName: string,
  max: number,
): string {
  const first = cleanName(user.firstName);
  const full = cleanName(`${first} ${cleanName(user.lastName)}`);
  const username = cleanUsername(user.username);
  const source = username ? template : dropUsername(template);
  const filled = source.replace(
    /(@?)\{(name|full_name|username)\}/g,
    (_match, at: string, key: string) => {
      if (key === "username") return `@${username}`;
      return `${at}${key === "name" ? first || fallbackName : full || fallbackName}`;
    },
  );
  return truncateForTelegram(filled, max);
}
