"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { submitReview, type SubmitReviewState } from "@/lib/reviews/actions";
import { cn } from "@/lib/utils";

type WriteReviewProps = {
  casinoId: string;
  casinoSlug: string;
  isLoggedIn: boolean;
  hasReviewed: boolean;
  askForName: boolean;
};

const initialState: SubmitReviewState = {};

function StarButton({
  value,
  selected,
  onSelect,
  label,
}: {
  value: number;
  selected: boolean;
  onSelect: (value: number) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-label={label}
      className={cn(
        "rounded-sm p-0.5 transition-colors",
        selected ? "text-accent" : "text-text/25 hover:text-accent/70",
      )}
    >
      <svg viewBox="0 0 20 20" className="h-7 w-7" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </button>
  );
}

export function WriteReview({
  casinoId,
  casinoSlug,
  isLoggedIn,
  hasReviewed,
  askForName,
}: WriteReviewProps) {
  const t = useTranslations("CasinoDetail.userReviews");
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [state, formAction, pending] = useActionState(
    submitReview.bind(null, casinoId),
    initialState,
  );

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (hasReviewed || state.success) {
    return <p className="text-text/55 text-sm">{t("alreadyReviewed")}</p>;
  }

  if (!isLoggedIn) {
    return (
      <Button
        href={`/login?next=${encodeURIComponent(`/casinos/${casinoSlug}`)}`}
        variant="secondary"
        size="sm"
      >
        {t("write")}
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
      >
        {t("write")}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-60 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label={t("close")}
            className="bg-background/70 absolute inset-0 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="bg-card ring-text/12 relative z-10 w-full max-w-md rounded-xl p-6 ring-1"
          >
            <h3
              id={titleId}
              className="text-text text-lg font-semibold tracking-tight"
            >
              {t("modalTitle")}
            </h3>
            <p className="text-text/55 mt-1 text-sm">{t("modalBody")}</p>

            <form action={formAction} className="mt-5 space-y-4">
              <div>
                <p className="text-text/75 mb-2 text-sm font-medium">
                  {t("ratingLabel")}
                </p>
                <input type="hidden" name="rating" value={rating || ""} />
                <div className="flex items-center gap-0.5" role="group">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <StarButton
                      key={value}
                      value={value}
                      selected={value <= rating}
                      onSelect={setRating}
                      label={t("starLabel", { count: value })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="review-body"
                  className="text-text/75 mb-1.5 block text-sm font-medium"
                >
                  {t("bodyLabel")}
                </label>
                <textarea
                  id="review-body"
                  name="body"
                  required
                  rows={5}
                  maxLength={2000}
                  className="bg-background/70 text-text ring-text/12 focus:ring-accent/55 w-full rounded-md px-3 py-2.5 text-sm ring-1 transition outline-none"
                />
              </div>

              {askForName ? (
                <div>
                  <label
                    htmlFor="review-name"
                    className="text-text/75 mb-1.5 block text-sm font-medium"
                  >
                    {t("nameLabel")}
                  </label>
                  <input
                    id="review-name"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    required
                    className="bg-background/70 text-text ring-text/12 focus:ring-accent/55 h-11 w-full rounded-md px-3 text-sm ring-1 transition outline-none"
                  />
                </div>
              ) : null}

              {state.error ? (
                <p className="text-sm font-medium text-red-300" role="alert">
                  {t(`errors.${state.error}`)}
                </p>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={pending || rating < 1}
                >
                  {pending ? t("submitting") : t("submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
