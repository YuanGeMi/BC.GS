"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMemo, useState, useTransition } from "react";

import { setUserRole, type AdminUserRow } from "@/lib/admin/users";
import { cn } from "@/lib/utils";

type Role = AdminUserRow["role"];

type PendingChange = {
  user: AdminUserRow;
  role: Role;
};

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const router = useRouter();
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [locale],
  );

  function err(code: string) {
    if (code === "invalidRole") return t("errors.invalidStatus");
    return t.has(`errors.${code}`) ? t(`errors.${code}`) : code;
  }

  function confirm() {
    if (!pendingChange) return;
    const { user, role } = pendingChange;
    startTransition(async () => {
      const result = await setUserRole(user.id, role);
      if (result.error) {
        setError(err(result.error));
        return;
      }
      setPendingChange(null);
      setError(null);
      router.refresh();
    });
  }

  return (
    <>
      {error && !pendingChange ? (
        <p className="text-accent mb-4 text-sm">{error}</p>
      ) : null}

      <div className="border-text/10 overflow-x-auto border-t">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              <th className="py-3 pr-4 font-medium">{t("users.columns.email")}</th>
              <th className="py-3 pr-4 font-medium">{t("users.columns.name")}</th>
              <th className="py-3 pr-4 font-medium">{t("users.columns.role")}</th>
              <th className="py-3 pr-4 font-medium">
                {t("users.columns.created")}
              </th>
              <th className="py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const nextRole: Role = user.role === "admin" ? "user" : "admin";
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id} className="border-text/8 border-t">
                  <td className="py-3.5 pr-4">
                    {user.email}
                    {isSelf ? (
                      <span className="text-text/35 ml-2 text-[11px] tracking-wide uppercase">
                        {t("users.you")}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-text/70 py-3.5 pr-4">
                    {user.displayName || "—"}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={cn(
                        "text-[11px] tracking-[0.14em] uppercase",
                        user.role === "admin" ? "text-accent" : "text-text/45",
                      )}
                    >
                      {user.role === "admin"
                        ? t("users.roleAdmin")
                        : t("users.roleUser")}
                    </span>
                  </td>
                  <td className="text-text/50 py-3.5 pr-4 tabular-nums">
                    {dateFmt.format(new Date(user.createdAt))}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setPendingChange({ user, role: nextRole });
                      }}
                      className="text-accent hover:text-accent-highlight text-xs font-medium"
                    >
                      {nextRole === "admin"
                        ? t("actions.promote")
                        : t("actions.demote")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pendingChange ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center"
          role="presentation"
          onClick={() => !isPending && setPendingChange(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-change-title"
            className="bg-card ring-text/10 w-full max-w-md p-6 shadow-2xl ring-1"
            onClick={(event) => event.stopPropagation()}
          >
            <p
              id="role-change-title"
              className="font-display text-2xl tracking-tight"
            >
              {pendingChange.role === "admin"
                ? t("users.confirmPromote", {
                    email: pendingChange.user.email,
                  })
                : t("users.confirmDemote", {
                    email: pendingChange.user.email,
                  })}
            </p>
            <p className="text-text/60 mt-3 text-sm leading-relaxed">
              {t("users.confirmBody")}
            </p>
            {error ? <p className="text-accent mt-3 text-sm">{error}</p> : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setPendingChange(null)}
                className="text-text/50 hover:text-text px-3 py-2 text-sm"
              >
                {t("actions.cancel")}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirm}
                className="bg-accent text-background hover:bg-accent-highlight px-4 py-2 text-sm font-medium"
              >
                {isPending ? t("actions.saving") : t("actions.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
