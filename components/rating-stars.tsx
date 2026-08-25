import { cn } from "@/lib/utils";

export type RatingStarsProps = {
  /** Numeric rating on a 0–5 scale (supports halves, e.g. 4.5). */
  rating: number;
  max?: number;
  className?: string;
  /** Show numeric label next to stars (e.g. "4.5"). */
  showValue?: boolean;
  size?: "sm" | "md";
};

function StarIcon({
  fill,
  size,
}: {
  fill: "full" | "half" | "empty";
  size: "sm" | "md";
}) {
  const dimension = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <span className={cn("relative inline-flex", dimension)} aria-hidden>
      {/* Empty base */}
      <svg
        viewBox="0 0 20 20"
        className={cn(dimension, "text-text/20 absolute inset-0")}
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>

      {fill !== "empty" ? (
        <span
          className={cn(
            "absolute inset-0 overflow-hidden",
            fill === "half" ? "w-1/2" : "w-full",
          )}
        >
          <svg
            viewBox="0 0 20 20"
            className={cn(dimension, "text-accent")}
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </span>
      ) : null}
    </span>
  );
}

function getStarFill(
  index: number,
  rating: number,
): "full" | "half" | "empty" {
  const value = rating - index;
  if (value >= 0.75) return "full";
  if (value >= 0.25) return "half";
  return "empty";
}

export function RatingStars({
  rating,
  max = 5,
  className,
  showValue = false,
  size = "md",
}: RatingStarsProps) {
  const clamped = Math.min(Math.max(rating, 0), max);
  const rounded = Math.round(clamped * 10) / 10;

  return (
    <div
      className={cn("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={`${rounded} out of ${max} stars`}
    >
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: max }, (_, index) => (
          <StarIcon
            key={index}
            fill={getStarFill(index, clamped)}
            size={size}
          />
        ))}
      </span>
      {showValue ? (
        <span className="text-text/70 text-xs font-medium tabular-nums">
          {rounded.toFixed(1)}
        </span>
      ) : null}
    </div>
  );
}
