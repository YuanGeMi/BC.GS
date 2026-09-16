"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { AdminConfirm } from "@/components/admin/admin-confirm";
import { setReviewStatus } from "@/lib/admin/reviews";

const errorCopy: Record<string, string> = {
  missing: "That review is no longer in Desk.",
  invalidStatus: "That status is not allowed.",
  invalidTransition: "That action is not allowed from the current status.",
};

export function ReviewActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [confirmReject, setConfirmReject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(next: "published" | "rejected" | "unpublished") {
    setError(null);
    startTransition(async () => {
      const result = await setReviewStatus(id, next);
      if (!result.ok) {
        setError(errorCopy[result.error] ?? result.error);
        setConfirmReject(false);
        return;
      }
      setConfirmReject(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-accent text-sm">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        {(status === "pending" || status === "unpublished") && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run("published")}
            className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
          >
            Publish
          </button>
        )}
        {status === "pending" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirmReject(true)}
            className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1 disabled:opacity-40"
          >
            Reject
          </button>
        )}
        {status === "published" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run("unpublished")}
            className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1 disabled:opacity-40"
          >
            Unpublish
          </button>
        )}
      </div>

      {confirmReject ? (
        <AdminConfirm
          title="Reject this review?"
          body="It will never appear on the public page. The author still cannot submit another review for this casino."
          confirmLabel="Reject"
          pending={isPending}
          onCancel={() => setConfirmReject(false)}
          onConfirm={() => run("rejected")}
        />
      ) : null}
    </div>
  );
}
