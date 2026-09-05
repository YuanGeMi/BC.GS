import { prisma } from "@/lib/prisma";
import {
  formatReviewDisplayName,
  publicReviewName,
  reviewInitials,
} from "@/lib/reviews/display-name";

export const REVIEW_PAGE_SIZE = 6;

export type ReviewPageCursor = {
  id: string;
  createdAt: string;
};

export type PublishedUserReview = {
  id: string;
  rating: number;
  body: string;
  createdAt: Date;
  authorName: string;
  authorInitials: string;
};

export type PublishedUserReviewPage = {
  reviews: PublishedUserReview[];
  nextCursor: ReviewPageCursor | null;
};

function mapReview(row: {
  id: string;
  rating: number;
  body: string;
  createdAt: Date;
  user: { displayName: string | null; email: string };
}): PublishedUserReview {
  const fullName = publicReviewName(row.user.displayName, row.user.email);

  return {
    id: row.id,
    rating: row.rating,
    body: row.body,
    createdAt: row.createdAt,
    authorName: formatReviewDisplayName(fullName),
    authorInitials: reviewInitials(fullName),
  };
}

export async function getPublishedUserReviewsPage(
  casinoId: string,
  cursor?: ReviewPageCursor | null,
): Promise<PublishedUserReviewPage> {
  const cursorDate = cursor ? new Date(cursor.createdAt) : null;

  const rows = await prisma.userReview.findMany({
    where: {
      casinoId,
      status: "published",
      ...(cursorDate
        ? {
            OR: [
              { createdAt: { lt: cursorDate } },
              { AND: [{ createdAt: cursorDate }, { id: { lt: cursor.id } }] },
            ],
          }
        : {}),
    },
    take: REVIEW_PAGE_SIZE + 1,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      rating: true,
      body: true,
      createdAt: true,
      user: {
        select: { displayName: true, email: true },
      },
    },
  });

  const hasMore = rows.length > REVIEW_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, REVIEW_PAGE_SIZE) : rows;
  const last = page[page.length - 1];

  return {
    reviews: page.map(mapReview),
    nextCursor:
      hasMore && last
        ? { id: last.id, createdAt: last.createdAt.toISOString() }
        : null,
  };
}

export async function hasUserReviewedCasino(
  userId: string | undefined,
  casinoId: string,
): Promise<boolean> {
  if (!userId) return false;

  const existing = await prisma.userReview.findUnique({
    where: {
      userId_casinoId: {
        userId,
        casinoId,
      },
    },
    select: { id: true },
  });

  return Boolean(existing);
}

export async function userNeedsDisplayName(userId: string | undefined) {
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true },
  });

  return !user?.displayName;
}
