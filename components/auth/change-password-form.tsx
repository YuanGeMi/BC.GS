"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import {
  changeOwnPassword,
  type ChangePasswordState,
} from "@/lib/auth/change-password";
import { authInputClassName } from "@/lib/auth/input-class";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";

const initialState: ChangePasswordState = { status: "idle" };

const labelClass = "text-text/75 mb-1.5 block text-sm font-medium";

export function ChangePasswordForm({ email }: { email: string }) {
  const t = useTranslations("Auth.account");
  const [state, formAction, pending] = useActionState(
    changeOwnPassword,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
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
          className={authInputClassName()}
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
          aria-describedby="newPasswordHelp"
          className={authInputClassName()}
        />
        <p id="newPasswordHelp" className="text-text/45 mt-1.5 text-xs">
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
          className={authInputClassName()}
        />
      </div>

      {state.status === "error" ? (
        <p className="text-sm font-medium text-red-300" role="alert">
          {state.error === "passwordTooShort"
            ? t("errors.passwordTooShort", { min: MIN_PASSWORD_LENGTH })
            : t(`errors.${state.error}`)}
        </p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm font-medium text-emerald-300" role="status">
          {t("updated")}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("saving") : t("submit")}
      </Button>
    </form>
  );
}
