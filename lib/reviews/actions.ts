"use server";

import { Prisma } from "@prisma/client";

import { ensureUserProfile } from "@/lib/auth/profile";
import { getAuthUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isValidDisplayName, normalizeDisplayName } from "@/lib/reviews/display-name";
import {
  getPublishedUserReviewsPage,
  type ReviewPageCursor,
} from "@/lib/reviews/queries";

export type SubmitReviewState = {
  error?: string;
  success?: boolean;
};

const MIN_RATING = 1;
const MAX_RATING = 5;
const MAX_BODY_LENGTH = 2000;

function parseRating(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const rating = Number.parseInt(value, 10);
  if (!Number.isInteger(rating) || rating < MIN_RATING || rating > MAX_RATING) {
    return null;
  }
  return rating;
}

export async function submitReview(
  casinoId: string,
  _state: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  const user = await getAuthUser();

  if (!user) {
    return { error: "unauthenticated" };
  }

  await ensureUserProfile(user);
  const userId = user.id;

  const rating = parseRating(formData.get("rating"));
  if (rating == null) {
    return { error: "invalidRating" };
  }

  const submittedName = normalizeDisplayName(formData.get("displayName"));
  if (submittedName && !isValidDisplayName(submittedName)) {
    return { error: "invalidName" };
  }

  if (submittedName) {
    await prisma.user.update({
      where: { id: userId },
      data: { displayName: submittedName },
    });
  }

  const rawBody = formData.get("body");
  const body = typeof rawBody === "string" ? rawBody.trim() : "";

  if (!body) {
    return { error: "emptyBody" };
  }

  if (body.length > MAX_BODY_LENGTH) {
    return { error: "bodyTooLong" };
  }

  const casino = await prisma.casino.findUnique({
    where: { id: casinoId },
    select: { id: true, status: true },
  });

  if (!casino || casino.status !== "published") {
    return { error: "casinoNotFound" };
  }

  try {
    await prisma.userReview.create({
      data: {
        userId,
        casinoId,
        rating,
        body,
        status: "pending",
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "alreadyReviewed" };
    }

    throw error;
  }

  return { success: true };
}

export async function loadMoreReviews(
  casinoId: string,
  cursor: ReviewPageCursor,
) {
  return getPublishedUserReviewsPage(casinoId, cursor);
}
