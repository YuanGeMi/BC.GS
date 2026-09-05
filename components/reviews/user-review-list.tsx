"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { InitialsAvatar } from "@/components/initials-avatar";
import { RatingStars } from "@/components/rating-stars";
import { loadMoreReviews } from "@/lib/reviews/actions";
import type {
  PublishedUserReview,
  ReviewPageCursor,
} from "@/lib/reviews/queries";
import { formatRelativeTime } from "@/lib/reviews/relative-time";

type UserReviewListProps = {
  casinoId: string;
  initialReviews: PublishedUserReview[];
  initialCursor: ReviewPageCursor | null;
  locale: string;
};

function ReviewCard({
  review,
  locale,
}: {
  review: PublishedUserReview;
  locale: string;
}) {
  const createdAt = new Date(review.createdAt);

  return (
    <li className="bg-card/50 ring-text/8 rounded-xl p-5 ring-1">
      <div className="flex items-start gap-3.5">
        <InitialsAvatar
          initials={review.authorInitials}
          className="mt-0.5"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <div className="min-w-0">
              <p className="text-text truncate text-sm font-medium tracking-tight">
                {review.authorName}
              </p>
              <time
                dateTime={createdAt.toISOString()}
                className="text-text/40 text-xs"
              >
                {formatRelativeTime(createdAt, locale)}
              </time>
            </div>
            <RatingStars rating={review.rating} size="sm" />
          </div>

          <p className="text-text/72 mt-3 text-sm leading-relaxed whitespace-pre-wrap">
            {review.body}
          </p>
        </div>
      </div>
    </li>
  );
}

export function UserReviewList({
  casinoId,
  initialReviews,
  initialCursor,
  locale,
}: UserReviewListProps) {
  const t = useTranslations("CasinoDetail.userReviews");
  const [reviews, setReviews] = useState(initialReviews);
  const [cursor, setCursor] = useState(initialCursor);
  const [pending, startTransition] = useTransition();

  if (reviews.length === 0) {
    return (
      <div className="bg-card/40 ring-text/8 rounded-xl px-5 py-8 text-center ring-1">
        <p className="text-text text-sm font-medium">{t("emptyTitle")}</p>
        <p className="text-text/55 mt-1.5 text-sm">{t("emptyBody")}</p>
      </div>
    );
  }

  function handleLoadMore() {
    if (!cursor) return;

    startTransition(async () => {
      const page = await loadMoreReviews(casinoId, cursor);
      setReviews((current) => [...current, ...page.reviews]);
      setCursor(page.nextCursor);
    });
  }

  return (
    <div>
      <ul className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} locale={locale} />
        ))}
      </ul>

      {cursor ? (
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={handleLoadMore}
          >
            {pending ? t("loadingMore") : t("loadMore")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
