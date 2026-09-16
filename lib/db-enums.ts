import {
  ContentStatus,
  MarketAvailability,
  ReviewStatus,
  UserRole,
} from "@prisma/client";

export { ContentStatus, MarketAvailability, ReviewStatus, UserRole };

/** Public listing/detail rows: casino, bonus, category, static page. */
export const publishedContentWhere = {
  status: ContentStatus.published,
} as const;

/** Reviews that are allowed to appear on casino pages.
 * pending, rejected, and unpublished stay hidden. */
export const publishedReviewWhere = {
  status: ReviewStatus.published,
} as const;

export function isPublishedContent(status: ContentStatus): boolean {
  return status === ContentStatus.published;
}
