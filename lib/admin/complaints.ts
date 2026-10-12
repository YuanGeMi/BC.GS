"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  CASE_USER_MESSAGE_MAX,
  normalizeCaseUserMessage,
} from "@/lib/admin/case-message";
import {
  isAllowedComplaintStatus,
  isComplaintStatus,
} from "@/lib/admin/complaint-status";
import { requireAdmin, requireVerifiedAdmin } from "@/lib/auth/require-admin";
import {
  ComplaintSource,
  ComplaintStatus,
  NotificationState,
  ReportType,
} from "@/lib/db-enums";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";

const COMPLAINT_PAGE_SIZE = 20;
const ADMIN_NOTES_MAX_LENGTH = 10_000;
const RECENT_NOTIFICATIONS = 5;

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
  /** What the user typed for the casino, kept even after staff link a casino. */
  casinoName: string | null;
  description: string;
  contactName: string | null;
  contactEmail: string | null;
  telegramUserId: string | null;
  adminNotes: string | null;
  updatedAt: string;
  moderatedAt: string | null;
  moderatorLabel: string | null;
  evidence: AdminComplaintEvidence[];
  /** Sent back with a status/message save to detect a concurrent change. */
  revision: number;
  /** Telegram case with a Telegram user ID: staff can notify the user. */
  canNotify: boolean;
  lastUserMessage: string | null;
  lastUserMessageAt: string | null;
  notifications: AdminComplaintNotification[];
};

export type AdminComplaintNotification = {
  revision: number;
  state: NotificationState;
  status: ComplaintStatus;
  hasMessage: boolean;
  createdAt: string;
  sentAt: string | null;
  updatedAt: string;
};

export type ComplaintUpdateInput = {
  status: string;
  /** Message to the user; empty for none. */
  message: string;
  notify: boolean;
  /** The revision the page loaded. */
  expectedRevision: number;
};

export type ComplaintUpdateResult =
  { ok: true; notified: boolean } | { ok: false; error: ComplaintActionError };

export type AdminComplaintCasinoOption = {
  id: string;
  label: string;
  isDraft: boolean;
};

export type ComplaintActionError =
  | "missing"
  | "invalidStatus"
  | "notesTooLong"
  | "invalidCasino"
  | "conflict"
  | "messageTooLong"
  | "messageNotSent";

export type ComplaintActionResult =
  { ok: true } | { ok: false; error: ComplaintActionError };

function isReportType(value: string): value is ReportType {
  return (Object.values(ReportType) as string[]).includes(value);
}

function isComplaintSource(value: string): value is ComplaintSource {
  return (Object.values(ComplaintSource) as string[]).includes(value);
}

/** Only Telegram cases with a Telegram user ID can be notified. */
function isNotifiable(row: {
  source: ComplaintSource;
  telegramUserId: string | null;
}) {
  return (
    row.source === ComplaintSource.telegram && !!row.telegramUserId?.trim()
  );
}

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
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

export async function listAdminComplaintCasinos(): Promise<
  AdminComplaintCasinoOption[]
> {
  await requireAdmin();
  const rows = await prisma.casino.findMany({
    select: {
      id: true,
      slug: true,
      status: true,
      translations: {
        where: { locale: "en" },
        select: { name: true },
        take: 1,
      },
    },
  });
  return rows
    .map((row) => ({
      id: row.id,
      label: row.translations[0]?.name || row.slug,
      isDraft: row.status === "draft",
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, "en", { sensitivity: "base" }),
    );
}

export async function listAdminComplaints(filters: {
  status?: string;
  type?: string;
  source?: string;
  caseId?: string;
  /** Partial, case-insensitive match on the linked casino's English name or slug, or the typed casinoName. */
  casino?: string;
  unlinkedOnly?: boolean;
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
  const casino = filters.casino?.trim();
  const page = Math.max(1, filters.page ?? 1);

  const where: Prisma.ComplaintWhereInput = {
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(source ? { source } : {}),
    ...(caseId ? { caseId: { contains: caseId, mode: "insensitive" } } : {}),
    ...(filters.unlinkedOnly ? { casinoId: null } : {}),
    ...(casino
      ? {
          OR: [
            { casinoName: { contains: casino, mode: "insensitive" } },
            { casino: { slug: { contains: casino, mode: "insensitive" } } },
            {
              casino: {
                translations: {
                  some: {
                    locale: "en",
                    name: { contains: casino, mode: "insensitive" },
                  },
                },
              },
            },
          ],
        }
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
        revision: true,
        lastUserMessage: true,
        lastUserMessageAt: true,
        notifications: {
          orderBy: { revision: "desc" },
          take: RECENT_NOTIFICATIONS,
          select: {
            revision: true,
            state: true,
            status: true,
            userMessage: true,
            createdAt: true,
            sentAt: true,
            updatedAt: true,
          },
        },
      },
    });
  } catch (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  if (!row) return null;

  return {
    ...mapRow(row),
    casinoName: row.casinoName?.trim() || null,
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
    revision: row.revision,
    canNotify: isNotifiable(row),
    lastUserMessage: row.lastUserMessage,
    lastUserMessageAt: row.lastUserMessageAt
      ? row.lastUserMessageAt.toISOString()
      : null,
    notifications: row.notifications.map((item) => ({
      revision: item.revision,
      state: item.state,
      status: item.status,
      hasMessage: item.userMessage !== null,
      createdAt: item.createdAt.toISOString(),
      sentAt: item.sentAt ? item.sentAt.toISOString() : null,
      updatedAt: item.updatedAt.toISOString(),
    })),
  };
}

class RevisionConflict extends Error {}

/**
 * Saves a status change and/or a message to the user. In one transaction: checks the
 * revision the page loaded, updates the case, bumps revision, and queues one
 * CaseNotificationOutbox row when the user should be notified.
 */
export async function setComplaintStatus(
  caseId: string,
  input: ComplaintUpdateInput,
): Promise<ComplaintUpdateResult> {
  const admin = await requireVerifiedAdmin();

  const nextStatus = typeof input.status === "string" ? input.status : "";
  const message = normalizeCaseUserMessage(
    typeof input.message === "string" ? input.message : "",
  );
  if (message.length > CASE_USER_MESSAGE_MAX) {
    return { ok: false, error: "messageTooLong" };
  }
  const notify = input.notify === true;
  const expectedRevision = input.expectedRevision;
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
    return { ok: false, error: "conflict" };
  }

  let result: ComplaintUpdateResult & { changed?: boolean };
  try {
    result = await prisma.$transaction(
      async (tx): Promise<ComplaintUpdateResult & { changed?: boolean }> => {
        const existing = await tx.complaint.findUnique({
          where: { caseId },
          select: {
            id: true,
            caseId: true,
            type: true,
            status: true,
            source: true,
            telegramUserId: true,
            revision: true,
            casinoName: true,
            casino: {
              select: {
                slug: true,
                translations: {
                  where: { locale: "en" },
                  select: { name: true },
                  take: 1,
                },
              },
            },
          },
        });
        if (!existing) return { ok: false, error: "missing" };
        if (existing.revision !== expectedRevision) {
          return { ok: false, error: "conflict" };
        }

        const statusChanged = nextStatus !== existing.status;
        if (!statusChanged && !message) return { ok: true, notified: false };

        let status: ComplaintStatus = existing.status;
        if (statusChanged) {
          if (!isAllowedComplaintStatus(existing.type, nextStatus)) {
            return { ok: false, error: "invalidStatus" };
          }
          status = nextStatus;
        }

        const willNotify = notify && isNotifiable(existing);
        if (message && !willNotify)
          return { ok: false, error: "messageNotSent" };

        const now = new Date();
        const revision = existing.revision + 1;
        const updated = await tx.complaint.updateMany({
          where: { id: existing.id, revision: expectedRevision },
          data: {
            ...(statusChanged ? { status } : {}),
            moderatedById: admin.id,
            moderatedAt: now,
            updatedAt: now,
            revision,
            ...(message
              ? { lastUserMessage: message, lastUserMessageAt: now }
              : {}),
          },
        });
        if (updated.count !== 1) throw new RevisionConflict();

        if (willNotify) {
          await tx.caseNotificationOutbox.create({
            data: {
              complaintId: existing.id,
              revision,
              telegramUserId: existing.telegramUserId!.trim(),
              caseId: existing.caseId,
              type: existing.type,
              status,
              casinoLabel:
                existing.casino?.translations[0]?.name ||
                existing.casinoName?.trim() ||
                existing.casino?.slug ||
                "",
              userMessage: message || null,
              caseUpdatedAt: now,
            },
            select: { id: true },
          });
        }

        return { ok: true, notified: willNotify, changed: true };
      },
      { maxWait: 10_000, timeout: 15_000 },
    );
  } catch (error) {
    if (error instanceof RevisionConflict || isUniqueViolation(error)) {
      return { ok: false, error: "conflict" };
    }
    throw error;
  }

  if (!result.ok) return result;
  if (result.changed) revalidateAdminComplaintPaths(caseId);
  return { ok: true, notified: result.notified };
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

/** Data correction only: writes casinoId and nothing else (casinoName, status and moderator fields stay as they are). */
export async function setComplaintCasino(
  caseId: string,
  casinoId: string,
): Promise<ComplaintActionResult> {
  await requireVerifiedAdmin();

  const nextCasinoId = casinoId.trim() || null;
  if (nextCasinoId) {
    const casino = await prisma.casino.findUnique({
      where: { id: nextCasinoId },
      select: { id: true },
    });
    if (!casino) return { ok: false, error: "invalidCasino" };
  }

  const existing = await prisma.complaint.findUnique({
    where: { caseId },
    select: { casinoId: true },
  });
  if (!existing) return { ok: false, error: "missing" };
  if (existing.casinoId === nextCasinoId) return { ok: true };

  await prisma.complaint.update({
    where: { caseId },
    data: { casinoId: nextCasinoId },
    select: { id: true },
  });

  revalidateAdminComplaintPaths(caseId);
  return { ok: true };
}
