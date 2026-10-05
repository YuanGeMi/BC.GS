"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin, requireVerifiedAdmin } from "@/lib/auth/require-admin";
import { ComplaintSource, ComplaintStatus, ReportType } from "@/lib/db-enums";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";

const COMPLAINT_PAGE_SIZE = 20;
const ADMIN_NOTES_MAX_LENGTH = 10_000;

export type AdminComplaintListRow = {
  id: string;
  caseId: string;
  type: ReportType;
  source: ComplaintSource;
  status: ComplaintStatus;
  subject: string;
  createdAt: string;
  casinoId: string | null;
  /** Linked casino name, or the free-text name when the casino is not in the database. */
  casinoLabel: string | null;
};

export type AdminComplaintEvidence = {
  /** 1-based, matches the evidence route segment. */
  number: number;
  available: boolean;
};

export type AdminComplaintDetail = AdminComplaintListRow & {
  description: string;
  contactName: string | null;
  contactEmail: string | null;
  telegramUserId: string | null;
  adminNotes: string | null;
  updatedAt: string;
  moderatedAt: string | null;
  moderatorLabel: string | null;
  evidence: AdminComplaintEvidence[];
};

export type ComplaintActionError = "missing" | "invalidStatus" | "notesTooLong";

export type ComplaintActionResult =
  { ok: true } | { ok: false; error: ComplaintActionError };

function isComplaintStatus(value: string): value is ComplaintStatus {
  return (Object.values(ComplaintStatus) as string[]).includes(value);
}

function isReportType(value: string): value is ReportType {
  return (Object.values(ReportType) as string[]).includes(value);
}

function isComplaintSource(value: string): value is ComplaintSource {
  return (Object.values(ComplaintSource) as string[]).includes(value);
}

/** True when the Complaint migration has not been applied to this database yet. */
function isMissingTable(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021"
  );
}

const listSelect = {
  id: true,
  caseId: true,
  type: true,
  source: true,
  status: true,
  subject: true,
  createdAt: true,
  casinoId: true,
  casinoName: true,
  casino: {
    select: {
      slug: true,
      translations: { where: { locale: "en" }, select: { name: true } },
    },
  },
} as const;

function mapRow(row: {
  id: string;
  caseId: string;
  type: ReportType;
  source: ComplaintSource;
  status: ComplaintStatus;
  subject: string;
  createdAt: Date;
  casinoId: string | null;
  casinoName: string | null;
  casino: { slug: string; translations: { name: string }[] } | null;
}): AdminComplaintListRow {
  return {
    id: row.id,
    caseId: row.caseId,
    type: row.type,
    source: row.source,
    status: row.status,
    subject: row.subject,
    createdAt: row.createdAt.toISOString(),
    casinoId: row.casino ? row.casinoId : null,
    casinoLabel: row.casino
      ? row.casino.translations[0]?.name || row.casino.slug
      : row.casinoName?.trim() || null,
  };
}

/** Only Telegram file references can be fetched; anything else (e.g. legacy storage: values) is unavailable. */
function isFetchableEvidence(entry: string) {
  return /^tg-file:[A-Za-z0-9_-]+$/.test(entry);
}

function revalidateAdminComplaintPaths(caseId?: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/complaints`);
    if (caseId) revalidatePath(`/${locale}/admin/complaints/${caseId}`);
  }
}

export async function listAdminComplaints(filters: {
  status?: string;
  type?: string;
  source?: string;
  caseId?: string;
  page?: number;
}): Promise<{
  rows: AdminComplaintListRow[];
  total: number;
  page: number;
  pageCount: number;
  tableMissing: boolean;
}> {
  await requireAdmin();

  const status =
    filters.status && isComplaintStatus(filters.status)
      ? filters.status
      : undefined;
  const type =
    filters.type && isReportType(filters.type) ? filters.type : undefined;
  const source =
    filters.source && isComplaintSource(filters.source)
      ? filters.source
      : undefined;
  const caseId = filters.caseId?.trim();
  const page = Math.max(1, filters.page ?? 1);

  const where = {
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(source ? { source } : {}),
    ...(caseId
      ? { caseId: { contains: caseId, mode: "insensitive" as const } }
      : {}),
  };

  try {
    const [total, rows] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * COMPLAINT_PAGE_SIZE,
        take: COMPLAINT_PAGE_SIZE,
        select: listSelect,
      }),
    ]);

    return {
      rows: rows.map(mapRow),
      total,
      page,
      pageCount: Math.max(1, Math.ceil(total / COMPLAINT_PAGE_SIZE)),
      tableMissing: false,
    };
  } catch (error) {
    if (!isMissingTable(error)) throw error;
    return { rows: [], total: 0, page: 1, pageCount: 1, tableMissing: true };
  }
}

export async function getAdminComplaint(
  caseId: string,
): Promise<AdminComplaintDetail | null> {
  await requireAdmin();

  let row;
  try {
    row = await prisma.complaint.findUnique({
      where: { caseId },
      select: {
        ...listSelect,
        description: true,
        contactName: true,
        contactEmail: true,
        telegramUserId: true,
        adminNotes: true,
        evidenceUrls: true,
        updatedAt: true,
        moderatedAt: true,
        moderatedBy: { select: { displayName: true, email: true } },
      },
    });
  } catch (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  if (!row) return null;

  return {
    ...mapRow(row),
    description: row.description,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    telegramUserId: row.telegramUserId,
    adminNotes: row.adminNotes,
    updatedAt: row.updatedAt.toISOString(),
    moderatedAt: row.moderatedAt ? row.moderatedAt.toISOString() : null,
    moderatorLabel: row.moderatedBy
      ? row.moderatedBy.displayName?.trim() || row.moderatedBy.email
      : null,
    evidence: row.evidenceUrls.map((entry, index) => ({
      number: index + 1,
      available: isFetchableEvidence(entry),
    })),
  };
}

export async function setComplaintStatus(
  caseId: string,
  nextStatus: string,
): Promise<ComplaintActionResult> {
  const admin = await requireVerifiedAdmin();
  if (!isComplaintStatus(nextStatus)) {
    return { ok: false, error: "invalidStatus" };
  }

  const existing = await prisma.complaint.findUnique({
    where: { caseId },
    select: { status: true },
  });
  if (!existing) return { ok: false, error: "missing" };
  if (existing.status === nextStatus) return { ok: true };

  await prisma.complaint.update({
    where: { caseId },
    data: {
      status: nextStatus,
      moderatedById: admin.id,
      moderatedAt: new Date(),
    },
    select: { id: true },
  });

  revalidateAdminComplaintPaths(caseId);
  return { ok: true };
}

export async function saveComplaintNotes(
  caseId: string,
  notes: string,
): Promise<ComplaintActionResult> {
  await requireVerifiedAdmin();

  const trimmed = notes.trim();
  if (trimmed.length > ADMIN_NOTES_MAX_LENGTH) {
    return { ok: false, error: "notesTooLong" };
  }

  const existing = await prisma.complaint.findUnique({
    where: { caseId },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "missing" };

  await prisma.complaint.update({
    where: { caseId },
    data: { adminNotes: trimmed || null },
    select: { id: true },
  });

  revalidateAdminComplaintPaths(caseId);
  return { ok: true };
}
