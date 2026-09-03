import { RatingStars } from "@/components/rating-stars";
import { formatRelativeTime } from "@/lib/reviews/relative-time";
import type { PublishedUserReview } from "@/lib/reviews/queries";

type UserReviewListProps = {
  reviews: PublishedUserReview[];
  locale: string;
  emptyTitle: string;
  emptyBody: string;
};

export function UserReviewList({
  reviews,
  locale,
  emptyTitle,
  emptyBody,
}: UserReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-card/40 ring-text/8 rounded-xl px-5 py-8 text-center ring-1">
        <p className="text-text text-sm font-medium">{emptyTitle}</p>
        <p className="text-text/55 mt-1.5 text-sm">{emptyBody}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="bg-card ring-text/8 rounded-xl p-5 ring-1"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <RatingStars rating={review.rating} />
            <time
              dateTime={review.createdAt.toISOString()}
              className="text-text/40 text-xs"
            >
              {formatRelativeTime(review.createdAt, locale)}
            </time>
          </div>
          <p className="text-text/75 mt-3 text-sm leading-relaxed whitespace-pre-wrap">
            {review.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
