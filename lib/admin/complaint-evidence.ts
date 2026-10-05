// Server-only helper for the admin evidence route. The bot token is used only
// inside this module's requests and must never be logged, returned, or thrown.

const TELEGRAM_API = "https://api.telegram.org";
/** Bot API getFile cannot serve anything larger. */
export const TELEGRAM_MAX_FILE_BYTES = 20 * 1024 * 1024;
const METADATA_TIMEOUT_MS = 15_000;
const DOWNLOAD_TIMEOUT_MS = 60_000;

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  mp4: "video/mp4",
  txt: "text/plain; charset=utf-8",
};

export type EvidenceFailure =
  | "badIndex"
  | "unavailable"
  | "notConfigured"
  | "gone"
  | "tooLarge"
  | "unreachable";

export type EvidenceFile = {
  body: ReadableStream<Uint8Array>;
  contentType: string;
  extension: string | null;
  contentLength: string | null;
};

export type EvidenceResult =
  { ok: true; file: EvidenceFile } | { ok: false; reason: EvidenceFailure };

/** Returns the Telegram file_id for a `tg-file:` entry, or null for any other format. */
export function telegramFileId(entry: string): string | null {
  const match = /^tg-file:([A-Za-z0-9_-]+)$/.exec(entry);
  return match ? match[1] : null;
}

/** Content type from the extension allow-list, defaulting to a generic download. */
export function evidenceContentType(filePath: string): {
  contentType: string;
  extension: string | null;
} {
  const name = filePath.split("/").pop() ?? "";
  const extension = name.includes(".")
    ? (name.split(".").pop() ?? "").toLowerCase()
    : "";
  const contentType = CONTENT_TYPES[extension];
  return contentType
    ? { contentType, extension }
    : { contentType: "application/octet-stream", extension: null };
}

type GetFileResponse = {
  ok?: boolean;
  error_code?: number;
  description?: string;
  result?: { file_path?: string; file_size?: number };
};

function classifyGetFileError(body: GetFileResponse): EvidenceFailure {
  const description = body.description ?? "";
  if (body.error_code === 401 || body.error_code === 404)
    return "notConfigured";
  if (/too big/i.test(description)) return "tooLarge";
  if (body.error_code === 400) return "gone";
  return "unreachable";
}

export async function fetchTelegramEvidence(opts: {
  token: string;
  fileId: string;
  fetchImpl?: typeof fetch;
}): Promise<EvidenceResult> {
  const fetchImpl = opts.fetchImpl ?? fetch;

  let metadata: GetFileResponse;
  try {
    const response = await fetchImpl(
      `${TELEGRAM_API}/bot${opts.token}/getFile`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: opts.fileId }),
        cache: "no-store",
        signal: AbortSignal.timeout(METADATA_TIMEOUT_MS),
      },
    );
    metadata = (await response.json()) as GetFileResponse;
  } catch {
    return { ok: false, reason: "unreachable" };
  }

  if (!metadata.ok) {
    return { ok: false, reason: classifyGetFileError(metadata) };
  }

  const filePath = metadata.result?.file_path;
  const fileSize = metadata.result?.file_size;
  if (!filePath) return { ok: false, reason: "gone" };
  if (typeof fileSize === "number" && fileSize > TELEGRAM_MAX_FILE_BYTES) {
    return { ok: false, reason: "tooLarge" };
  }

  const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
  let download: Response;
  try {
    download = await fetchImpl(
      `${TELEGRAM_API}/file/bot${opts.token}/${encodedPath}`,
      {
        method: "GET",
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
      },
    );
  } catch {
    return { ok: false, reason: "unreachable" };
  }

  if (!download.ok || !download.body) {
    return {
      ok: false,
      reason:
        download.status === 400 || download.status === 404
          ? "gone"
          : "unreachable",
    };
  }

  const { contentType, extension } = evidenceContentType(filePath);
  return {
    ok: true,
    file: {
      body: download.body,
      contentType,
      extension,
      contentLength: download.headers.get("content-length"),
    },
  };
}
