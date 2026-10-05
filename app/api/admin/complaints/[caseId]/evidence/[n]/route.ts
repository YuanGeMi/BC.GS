import { Prisma } from "@prisma/client";

import {
  fetchTelegramEvidence,
  telegramFileId,
  type EvidenceFailure,
} from "@/lib/admin/complaint-evidence";
import { requireVerifiedAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const FAILURES: Record<
  EvidenceFailure | "missingComplaint",
  { status: number; message: string }
> = {
  missingComplaint: { status: 404, message: "Complaint not found." },
  badIndex: { status: 404, message: "That attachment does not exist." },
  unavailable: { status: 404, message: "Attachment unavailable." },
  notConfigured: {
    status: 503,
    message:
      "Attachment downloads are not configured. Ask a developer to check the Telegram bot token.",
  },
  gone: {
    status: 410,
    message: "This file is no longer available on Telegram.",
  },
  tooLarge: {
    status: 413,
    message: "This file is too large to download (Telegram's limit is 20 MB).",
  },
  unreachable: {
    status: 502,
    message: "Telegram is unreachable right now. Please try again later.",
  },
};

const BASE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; sandbox",
};

function failure(reason: keyof typeof FAILURES, caseId: string, n: string) {
  const { status, message } = FAILURES[reason];
  if (reason !== "badIndex" && reason !== "missingComplaint") {
    console.warn(
      `Complaint evidence unavailable: case=${caseId} attachment=${n} reason=${reason}`,
    );
  }
  return new Response(message, {
    status,
    headers: { ...BASE_HEADERS, "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; n: string }> },
) {
  await requireVerifiedAdmin();

  const { caseId, n } = await params;
  if (!/^\d{1,3}$/.test(n)) return failure("badIndex", caseId, n);
  const index = Number(n) - 1;

  let complaint: { evidenceUrls: string[] } | null;
  try {
    complaint = await prisma.complaint.findUnique({
      where: { caseId },
      select: { evidenceUrls: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return failure("missingComplaint", caseId, n);
    }
    throw error;
  }
  if (!complaint) return failure("missingComplaint", caseId, n);

  const entry = complaint.evidenceUrls[index];
  if (index < 0 || entry === undefined) return failure("badIndex", caseId, n);

  const fileId = telegramFileId(entry);
  if (!fileId) return failure("unavailable", caseId, n);

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return failure("notConfigured", caseId, n);

  const result = await fetchTelegramEvidence({ token, fileId });
  if (!result.ok) return failure(result.reason, caseId, n);

  const safeCaseId = caseId.replace(/[^A-Za-z0-9-]/g, "");
  const filename = `${safeCaseId}-attachment-${index + 1}.${result.file.extension ?? "bin"}`;

  return new Response(result.file.body, {
    status: 200,
    headers: {
      ...BASE_HEADERS,
      "Content-Type": result.file.contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...(result.file.contentLength
        ? { "Content-Length": result.file.contentLength }
        : {}),
    },
  });
}
