"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState, useTransition, type ReactNode } from "react";

import { toast } from "@/components/admin/admin-toast";
import { CASE_USER_MESSAGE_MAX } from "@/lib/admin/case-message";
import { adminSelectClass, adminTextareaClass } from "@/lib/admin/fields";
import {
  saveComplaintNotes,
  setComplaintCasino,
  setComplaintStatus,
  type AdminComplaintCasinoOption,
} from "@/lib/admin/complaints";

export function ComplaintActions({
  caseId,
  status,
  statusOptions,
  revision,
  canNotify,
  notificationHistory,
  adminNotes,
  casinoId,
  casinoName,
  casinos,
}: {
  caseId: string;
  status: string;
  /** Allowed statuses for this complaint's type, plus the current one when it is outside that list. */
  statusOptions: string[];
  revision: number;
  canNotify: boolean;
  /** Read-only last message and delivery states, rendered by the page. */
  notificationHistory?: ReactNode;
  adminNotes: string;
  casinoId: string | null;
  casinoName: string | null;
  casinos: AdminComplaintCasinoOption[];
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [userMessage, setUserMessage] = useState("");
  const [notify, setNotify] = useState(true);
  const [conflict, setConflict] = useState(false);
  const [notes, setNotes] = useState(adminNotes);
  const [nextCasinoId, setNextCasinoId] = useState(casinoId ?? "");
  const [isPending, startTransition] = useTransition();

  const hasMessage = canNotify && userMessage.trim() !== "";
  const statusChanged = nextStatus !== status;
  const messageBlocked = hasMessage && !notify;
  const willNotify = canNotify && notify && (statusChanged || hasMessage);

  function err(code: string) {
    return t.has(`errors.${code}`) ? t(`errors.${code}`) : code;
  }

  function saveStatus() {
    startTransition(async () => {
      const result = await setComplaintStatus(caseId, {
        status: nextStatus,
        message: canNotify ? userMessage : "",
        notify: canNotify && notify,
        expectedRevision: revision,
      });
      if (!result.ok) {
        if (result.error === "conflict") setConflict(true);
        toast.error(err(result.error));
        return;
      }
      setUserMessage("");
      toast.success(
        result.notified
          ? t("complaints.notificationQueued")
          : t("complaints.statusSaved"),
      );
      router.refresh();
    });
  }

  function refreshAfterConflict() {
    setConflict(false);
    router.refresh();
  }

  function saveNotes() {
    startTransition(async () => {
      const result = await saveComplaintNotes(caseId, notes);
      if (!result.ok) {
        toast.error(err(result.error));
        return;
      }
      toast.success(t("complaints.notesSaved"));
      router.refresh();
    });
  }

  function saveCasino() {
    startTransition(async () => {
      const result = await setComplaintCasino(caseId, nextCasinoId);
      if (!result.ok) {
        toast.error(err(result.error));
        return;
      }
      toast.success(t("complaints.casinoSaved"));
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <label
          htmlFor="complaint-casino"
          className="text-text/40 text-[11px] tracking-[0.16em] uppercase"
        >
          {t("complaints.columns.casino")}
        </label>
        <p className="text-text/40 mt-1 text-xs">
          {t("complaints.casinoLinkHelp")}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            id="complaint-casino"
            value={nextCasinoId}
            onChange={(event) => setNextCasinoId(event.target.value)}
            className={`${adminSelectClass} max-w-[18rem]`}
          >
            <option value="">{t("complaints.noCasino")}</option>
            {casinos.map((casino) => (
              <option key={casino.id} value={casino.id}>
                {casino.isDraft
                  ? t("complaints.draftCasino", { name: casino.label })
                  : casino.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isPending || nextCasinoId === (casinoId ?? "")}
            onClick={saveCasino}
            className="ring-text/20 hover:ring-accent/50 h-11 px-4 text-sm ring-1 disabled:opacity-40"
          >
            {isPending ? t("actions.saving") : t("complaints.saveCasino")}
          </button>
          {!casinoId && casinoName ? (
            <span className="text-text/55 text-sm">
              {t("complaints.userTyped", { name: casinoName })}
            </span>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="complaint-status"
          className="text-text/40 text-[11px] tracking-[0.16em] uppercase"
        >
          {t("complaints.columns.status")}
        </label>
        <select
          id="complaint-status"
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value)}
          className={`${adminSelectClass} mt-2 max-w-[18rem]`}
        >
          {statusOptions.map((value) => (
            <option key={value} value={value}>
              {t(`complaints.status.${value}`)}
            </option>
          ))}
        </select>

        {canNotify ? (
          <div className="mt-5">
            <label
              htmlFor="complaint-user-message"
              className="text-text/40 text-[11px] tracking-[0.16em] uppercase"
            >
              {t("complaints.userMessage")}
            </label>
            <textarea
              id="complaint-user-message"
              value={userMessage}
              onChange={(event) => setUserMessage(event.target.value)}
              className={`${adminTextareaClass} mt-2 min-h-24`}
              maxLength={CASE_USER_MESSAGE_MAX}
              rows={4}
            />
            <p className="text-text/40 mt-1 text-xs">
              {t("complaints.internalNotesNeverSent")}{" "}
              {t("complaints.messageCount", {
                count: userMessage.length,
                max: CASE_USER_MESSAGE_MAX,
              })}
            </p>
            <label className="text-text/65 mt-3 flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={notify}
                onChange={(event) => setNotify(event.target.checked)}
                className="border-text/25 text-accent accent-accent h-3.5 w-3.5 rounded-sm"
              />
              {t("complaints.notifyUser")}
            </label>
            {messageBlocked ? (
              <p className="text-accent mt-2 text-xs">
                {err("messageNotSent")}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-text/45 mt-3 text-xs">
            {t("complaints.noNotification")}
          </p>
        )}

        {conflict ? (
          <p className="text-accent mt-3 text-sm">
            {err("conflict")}{" "}
            <button
              type="button"
              onClick={refreshAfterConflict}
              className="underline underline-offset-2"
            >
              {t("complaints.refresh")}
            </button>
          </p>
        ) : null}

        <button
          type="button"
          disabled={
            isPending ||
            conflict ||
            messageBlocked ||
            (!statusChanged && !hasMessage)
          }
          onClick={saveStatus}
          className="bg-accent text-background hover:bg-accent-highlight mt-4 h-11 px-4 text-sm font-medium disabled:opacity-40"
        >
          {isPending
            ? t("actions.saving")
            : willNotify
              ? t("complaints.saveAndNotify")
              : t("complaints.updateStatus")}
        </button>

        {notificationHistory}
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
