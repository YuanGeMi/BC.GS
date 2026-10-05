"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { adminSelectClass, adminTextareaClass } from "@/lib/admin/fields";
import { saveComplaintNotes, setComplaintStatus } from "@/lib/admin/complaints";

const STATUSES = ["open", "in_review", "resolved", "rejected"] as const;

export function ComplaintActions({
  caseId,
  status,
  adminNotes,
}: {
  caseId: string;
  status: string;
  adminNotes: string;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [notes, setNotes] = useState(adminNotes);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function err(code: string) {
    return t.has(`errors.${code}`) ? t(`errors.${code}`) : code;
  }

  function saveStatus() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await setComplaintStatus(caseId, nextStatus);
      if (!result.ok) {
        setError(err(result.error));
        return;
      }
      setNotice(t("complaints.statusSaved"));
      router.refresh();
    });
  }

  function saveNotes() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await saveComplaintNotes(caseId, notes);
      if (!result.ok) {
        setError(err(result.error));
        return;
      }
      setNotice(t("complaints.notesSaved"));
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {error ? <p className="text-accent text-sm">{error}</p> : null}
      {notice ? <p className="text-text/55 text-sm">{notice}</p> : null}

      <div>
        <label
          htmlFor="complaint-status"
          className="text-text/40 text-[11px] tracking-[0.16em] uppercase"
        >
          {t("complaints.columns.status")}
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <select
            id="complaint-status"
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
            className={`${adminSelectClass} max-w-[12rem]`}
          >
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(`complaints.status.${value}`)}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isPending || nextStatus === status}
            onClick={saveStatus}
            className="bg-accent text-background hover:bg-accent-highlight h-11 px-4 text-sm font-medium disabled:opacity-40"
          >
            {isPending ? t("actions.saving") : t("complaints.updateStatus")}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="complaint-notes"
          className="text-text/40 text-[11px] tracking-[0.16em] uppercase"
        >
          {t("complaints.adminNotes")}
        </label>
        <p className="text-text/40 mt-1 text-xs">
          {t("complaints.adminNotesHelp")}
        </p>
        <textarea
          id="complaint-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className={`${adminTextareaClass} mt-2`}
          maxLength={10_000}
          rows={6}
        />
        <button
          type="button"
          disabled={isPending || notes === adminNotes}
          onClick={saveNotes}
          className="ring-text/20 hover:ring-accent/50 mt-2 h-10 px-4 text-sm ring-1 disabled:opacity-40"
        >
          {isPending ? t("actions.saving") : t("complaints.saveNotes")}
        </button>
      </div>
    </div>
  );
}
