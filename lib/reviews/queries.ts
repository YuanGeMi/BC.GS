import { prisma } from "@/lib/prisma";

export type PublishedUserReview = {
  id: string;
  rating: number;
  body: string;
  createdAt: Date;
};

export async function getPublishedUserReviews(
  casinoId: string,
): Promise<PublishedUserReview[]> {
  console.log(
    "[DEBUG getPublishedUserReviews] casinoId:",
    casinoId,
    "| DATABASE_URL:",
    (process.env.DATABASE_URL || "").replace(/:([^:@/]+)@/, ":****@"),
  );
  const result = await prisma.userReview.findMany({
    where: { casinoId, status: "published" },
    select: {
      id: true,
      rating: true,
      body: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  console.log(
    "[DEBUG getPublishedUserReviews] raw result:",
    JSON.stringify(result, null, 2),
  );
  return result;
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
