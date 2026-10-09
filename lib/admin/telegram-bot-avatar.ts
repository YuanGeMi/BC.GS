// Server-only helper for the bot profile picture. The bot token is used only
// inside this module's request and must never be logged, returned, or thrown.

const TELEGRAM_API = "https://api.telegram.org";
const REQUEST_TIMEOUT_MS = 30_000;
const ATTACH_NAME = "avatar";

export type SetProfilePhotoFailure =
  "badToken" | "rateLimited" | "invalidFile" | "rejected" | "unreachable";

export type SetProfilePhotoResult =
  | { ok: true }
  | { ok: false; reason: SetProfilePhotoFailure; retryAfter?: number };

type TelegramResponse = {
  ok?: boolean;
  result?: unknown;
  error_code?: number;
  description?: string;
  parameters?: { retry_after?: number };
};

function classify(body: TelegramResponse): {
  reason: SetProfilePhotoFailure;
  retryAfter?: number;
} {
  const code = body.error_code;
  const description = body.description ?? "";
  if (code === 401 || code === 404) return { reason: "badToken" };
  if (code === 429) {
    const retryAfter = body.parameters?.retry_after;
    return {
      reason: "rateLimited",
      ...(typeof retryAfter === "number" && retryAfter > 0
        ? { retryAfter: Math.ceil(retryAfter) }
        : {}),
    };
  }
  if (code === 400 && /photo|image|file|dimension|size/i.test(description)) {
    return { reason: "invalidFile" };
  }
  if (code === 400 || code === 403) return { reason: "rejected" };
  return { reason: "unreachable" };
}

/** setMyProfilePhoto with InputProfilePhotoStatic, uploaded as multipart/form-data. */
export async function setTelegramProfilePhoto(opts: {
  token: string;
  jpeg: Uint8Array;
  fetchImpl?: typeof fetch;
}): Promise<SetProfilePhotoResult> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const body = new FormData();
  body.set(
    "photo",
    JSON.stringify({ type: "static", photo: `attach://${ATTACH_NAME}` }),
  );
  body.set(
    ATTACH_NAME,
    new Blob([opts.jpeg as BlobPart], { type: "image/jpeg" }),
    "avatar.jpg",
  );

  let response: TelegramResponse;
  try {
    const res = await fetchImpl(
      `${TELEGRAM_API}/bot${opts.token}/setMyProfilePhoto`,
      {
        method: "POST",
        body,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );
    response = (await res.json()) as TelegramResponse;
  } catch {
    return { ok: false, reason: "unreachable" };
  }

  if (response.ok === true && response.result === true) return { ok: true };
  return { ok: false, ...classify(response) };
}
