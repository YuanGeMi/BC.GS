"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { Link } from "@/i18n/navigation";
import { updatePassword, type AuthFormState } from "@/lib/auth/actions";
import { authInputClassName } from "@/lib/auth/input-class";

type ResetPasswordFormProps = {
  locale: string;
};

const initialState: AuthFormState = {};

export function ResetPasswordForm({ locale }: ResetPasswordFormProps) {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(
    updatePassword.bind(null, locale),
    initialState,
  );

  if (state.passwordUpdated) {
    return (
      <div className="space-y-4">
        <p className="text-text/80 text-sm leading-relaxed" role="status">
          {t("reset.updated")}
        </p>
        <Button href="/login" className="w-full">
          {t("reset.toLogin")}
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="text-text/75 mb-1.5 block text-sm font-medium"
        >
          {t("reset.newPassword")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={authInputClassName()}
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="text-text/75 mb-1.5 block text-sm font-medium"
        >
          {t("confirmPassword")}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={authInputClassName()}
        />
      </div>

      {state.error ? (
        <p className="text-sm font-medium text-red-300" role="alert">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("reset.pending") : t("reset.submit")}
      </Button>

      <p className="text-text/55 text-center text-sm">
        <Link
          href="/forgot-password"
          className="text-accent hover:text-accent-highlight font-medium transition-colors"
        >
          {t("reset.requestAgain")}
        </Link>
      </p>
    </form>
  );
}
