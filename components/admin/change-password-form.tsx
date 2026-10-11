"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";

import { toast } from "@/components/admin/admin-toast";
import { adminInputClass } from "@/lib/admin/fields";
import {
  changeOwnPassword,
  type ChangePasswordState,
} from "@/lib/auth/change-password";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";

const labelClass =
  "text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase";

const initialState: ChangePasswordState = { status: "idle" };

export function ChangePasswordForm({ email }: { email: string }) {
  const t = useTranslations("Admin.account");
  const [state, formAction, pending] = useActionState(
    changeOwnPassword,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(t("updated"));
    } else if (state.status === "error") {
      toast.error(
        state.error === "passwordTooShort"
          ? t("errors.passwordTooShort", { min: MIN_PASSWORD_LENGTH })
          : t(`errors.${state.error}`),
      );
    }
  }, [state, t]);

  return (
    <section className="border-text/10 mt-10 max-w-md border-t pt-8">
      <h2 className="font-display text-2xl tracking-tight">
        {t("passwordTitle")}
      </h2>
      <p className="text-text/55 mt-2 text-sm">{t("passwordHelp")}</p>

      <form action={formAction} className="mt-6 space-y-5">
        <input
          type="email"
          name="username"
          autoComplete="username"
          value={email}
          readOnly
          hidden
        />
        <div>
          <label htmlFor="currentPassword" className={labelClass}>
            {t("currentPassword")}
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className={adminInputClass}
          />
        </div>
        <div>
          <label htmlFor="newPassword" className={labelClass}>
            {t("newPassword")}
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            className={adminInputClass}
          />
          <p className="text-text/40 mt-1.5 text-xs">
            {t("newPasswordHelp", { min: MIN_PASSWORD_LENGTH })}
          </p>
        </div>
        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            {t("confirmPassword")}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            className={adminInputClass}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
        >
          {pending ? t("saving") : t("submit")}
        </button>
      </form>
    </section>
  );
}
