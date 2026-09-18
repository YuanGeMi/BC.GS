"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { AdminConfirm } from "@/components/admin/admin-confirm";
import { setReviewStatus } from "@/lib/admin/reviews";

export function ReviewActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [confirmReject, setConfirmReject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function err(code: string) {
    return t.has(`errors.${code}`) ? t(`errors.${code}`) : code;
  }

  function run(next: "published" | "rejected" | "unpublished") {
    setError(null);
    startTransition(async () => {
      const result = await setReviewStatus(id, next);
      if (!result.ok) {
        setError(err(result.error));
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
            {t("actions.publish")}
          </button>
        )}
        {status === "pending" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirmReject(true)}
            className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1 disabled:opacity-40"
          >
            {t("actions.reject")}
          </button>
        )}
        {status === "published" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run("unpublished")}
            className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1 disabled:opacity-40"
          >
            {t("actions.unpublish")}
          </button>
        )}
      </div>

      {confirmReject ? (
        <AdminConfirm
          title={t("reviews.rejectTitle")}
          body={t("reviews.rejectBody")}
          confirmLabel={t("actions.reject")}
          pending={isPending}
          onCancel={() => setConfirmReject(false)}
          onConfirm={() => run("rejected")}
        />
      ) : null}
    </div>
  );
}
