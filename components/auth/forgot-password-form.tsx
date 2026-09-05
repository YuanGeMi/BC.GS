"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { Link } from "@/i18n/navigation";
import { requestPasswordReset, type AuthFormState } from "@/lib/auth/actions";
import { authInputClassName } from "@/lib/auth/input-class";

type ForgotPasswordFormProps = {
  locale: string;
};

const initialState: AuthFormState = {};

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(
    requestPasswordReset.bind(null, locale),
    initialState,
  );

  if (state.resetSent) {
    return (
      <div className="space-y-4">
        <p className="text-text/80 text-sm leading-relaxed" role="status">
          {t("forgot.sent")}
        </p>
        <p className="text-text/55 text-center text-sm">
          <Link
            href="/login"
            className="text-accent hover:text-accent-highlight font-medium transition-colors"
          >
            {t("forgot.backToLogin")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="text-text/75 mb-1.5 block text-sm font-medium"
        >
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
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
        {pending ? t("forgot.pending") : t("forgot.submit")}
      </Button>

      <p className="text-text/55 text-center text-sm">
        <Link
          href="/login"
          className="text-accent hover:text-accent-highlight font-medium transition-colors"
        >
          {t("forgot.backToLogin")}
        </Link>
      </p>
    </form>
  );
}
