"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireVerifiedAdmin } from "@/lib/auth/require-admin";
import { ReviewStatus } from "@/lib/db-enums";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { revalidateCasinoPage } from "@/lib/revalidate";

const REVIEW_PAGE_SIZE = 20;

const ALLOWED_TRANSITIONS: Record<ReviewStatus, ReviewStatus[]> = {
  pending: [ReviewStatus.published, ReviewStatus.rejected],
  unpublished: [ReviewStatus.published],
  published: [ReviewStatus.unpublished],
  rejected: [],
};

export type AdminReviewListRow = {
  id: string;
  status: ReviewStatus;
  rating: number;
  bodyPreview: string;
  createdAt: string;
  casinoId: string;
  casinoName: string;
  casinoSlug: string;
  authorName: string;
  authorEmail: string;
};

export type AdminReviewDetail = AdminReviewListRow & {
  body: string;
  moderatedAt: string | null;
  updatedAt: string;
};

export type AdminReviewCasinoOption = {
  id: string;
  label: string;
};

export type ReviewActionError = "missing" | "invalidStatus" | "invalidTransition";

export type ReviewActionResult =
  | { ok: true }
  | { ok: false; error: ReviewActionError };

function isReviewStatus(value: string): value is ReviewStatus {
  return (
    value === ReviewStatus.pending ||
    value === ReviewStatus.published ||
    value === ReviewStatus.rejected ||
    value === ReviewStatus.unpublished
  );
}

function preview(body: string) {
  const trimmed = body.trim();
  if (trimmed.length <= 120) return trimmed;
  return `${trimmed.slice(0, 117).trimEnd()}…`;
}

function mapRow(row: {
  id: string;
  status: ReviewStatus;
  rating: number;
  body: string;
  createdAt: Date;
  casinoId: string;
  casino: { slug: string; translations: { name: string }[] };
  user: { displayName: string | null; email: string };
}): AdminReviewListRow {
  return {
    id: row.id,
    status: row.status,
    rating: row.rating,
    bodyPreview: preview(row.body),
    createdAt: row.createdAt.toISOString(),
    casinoId: row.casinoId,
    casinoName: row.casino.translations[0]?.name || row.casino.slug,
    casinoSlug: row.casino.slug,
    authorName: row.user.displayName?.trim() || "—",
    authorEmail: row.user.email,
  };
}

function revalidateAdminReviewPaths(id?: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/reviews`);
    if (id) revalidatePath(`/${locale}/admin/reviews/${id}`);
  }
}

function parseDayStart(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  return new Date(`${trimmed}T00:00:00.000Z`);
}

function parseDayEnd(value?: string) {
  const start = parseDayStart(value);
  if (!start) return undefined;
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

export async function listAdminReviewCasinos(): Promise<AdminReviewCasinoOption[]> {
  await requireAdmin();
  const rows = await prisma.casino.findMany({
    orderBy: { slug: "asc" },
    select: {
      id: true,
      slug: true,
      translations: {
        where: { locale: "en" },
        select: { name: true },
        take: 1,
      },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    label: row.translations[0]?.name || row.slug,
  }));
}

export async function listAdminReviews(filters: {
  status?: string;
  casinoId?: string;
  from?: string;
  to?: string;
  page?: number;
}): Promise<{
  rows: AdminReviewListRow[];
  total: number;
  page: number;
  pageCount: number;
}> {
  await requireAdmin();

  const status =
    filters.status === "all"
      ? undefined
      : filters.status && isReviewStatus(filters.status)
        ? filters.status
        : ReviewStatus.pending;
  const page = Math.max(1, filters.page ?? 1);
  const from = parseDayStart(filters.from);
  const to = parseDayEnd(filters.to);

  const where = {
    ...(status ? { status } : {}),
    ...(filters.casinoId ? { casinoId: filters.casinoId } : {}),
    ...((from || to) && {
      createdAt: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lt: to } : {}),
      },
    }),
  };

  const [total, rows] = await Promise.all([
    prisma.userReview.count({ where }),
    prisma.userReview.findMany({
      where,
      orderBy:
        status === ReviewStatus.pending
          ? [{ createdAt: "asc" }, { id: "asc" }]
          : [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * REVIEW_PAGE_SIZE,
      take: REVIEW_PAGE_SIZE,
      include: {
        casino: {
          select: {
            slug: true,
            translations: { where: { locale: "en" }, select: { name: true } },
          },
        },
        user: { select: { displayName: true, email: true } },
      },
    }),
  ]);

  return {
    rows: rows.map(mapRow),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / REVIEW_PAGE_SIZE)),
  };
}

export async function getAdminReview(
  id: string,
): Promise<AdminReviewDetail | null> {
  await requireAdmin();

  const row = await prisma.userReview.findUnique({
    where: { id },
    include: {
      casino: {
        select: {
          slug: true,
          translations: { where: { locale: "en" }, select: { name: true } },
        },
      },
      user: { select: { displayName: true, email: true } },
    },
  });
  if (!row) return null;

  return {
    ...mapRow(row),
    body: row.body,
    moderatedAt: row.moderatedAt ? row.moderatedAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function setReviewStatus(
  id: string,
  nextStatus: string,
): Promise<ReviewActionResult> {
  const admin = await requireVerifiedAdmin();
  if (!isReviewStatus(nextStatus)) return { ok: false, error: "invalidStatus" };

  const existing = await prisma.userReview.findUnique({
    where: { id },
    include: { casino: { select: { slug: true } } },
  });
  if (!existing) return { ok: false, error: "missing" };

  if (!ALLOWED_TRANSITIONS[existing.status].includes(nextStatus)) {
    return { ok: false, error: "invalidTransition" };
  }

  await prisma.userReview.update({
    where: { id },
    data: {
      status: nextStatus,
      moderatedById: admin.id,
      moderatedAt: new Date(),
    },
  });

  revalidateAdminReviewPaths(id);
  const publicChanged =
    existing.status === ReviewStatus.published ||
    nextStatus === ReviewStatus.published;
  if (publicChanged) {
    revalidateCasinoPage(existing.casino.slug);
  }

  return { ok: true };
}
