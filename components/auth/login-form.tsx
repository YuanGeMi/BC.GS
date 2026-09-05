"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { Link } from "@/i18n/navigation";
import {
  login,
  resendConfirmation,
  type AuthFormState,
} from "@/lib/auth/actions";
import { authInputClassName } from "@/lib/auth/input-class";

type LoginFormProps = {
  locale: string;
  next?: string;
  callbackError?: boolean;
};

const initialState: AuthFormState = {};

export function LoginForm({ locale, next, callbackError }: LoginFormProps) {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(
    login.bind(null, locale, next),
    initialState,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendConfirmation.bind(null, locale),
    initialState,
  );

  const error = state.error ?? resendState.error;
  const checkEmail = resendState.checkEmail;
  const signupHref = next
    ? `/signup?next=${encodeURIComponent(next)}`
    : "/signup";

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

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <label
            htmlFor="password"
            className="text-text/75 block text-sm font-medium"
          >
            {t("password")}
          </label>
          <Link
            href="/forgot-password"
            className="text-accent hover:text-accent-highlight text-xs font-medium transition-colors"
          >
            {t("forgot.link")}
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={authInputClassName()}
        />
      </div>

      {checkEmail ? (
        <p className="text-accent text-sm leading-relaxed" role="status">
          {t("signup.checkEmail")}
        </p>
      ) : error ? (
        <p className="text-sm font-medium text-red-300" role="alert">
          {t(`errors.${error}`)}
        </p>
      ) : callbackError ? (
        <p className="text-sm font-medium text-red-300" role="alert">
          {t("errors.callbackFailed")}
        </p>
      ) : null}

      {!checkEmail && error === "emailNotConfirmed" ? (
        <Button
          type="submit"
          formAction={resendAction}
          variant="secondary"
          className="w-full"
          disabled={resendPending}
        >
          {resendPending ? t("resend.pending") : t("resend.submit")}
        </Button>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("login.pending") : t("login.submit")}
      </Button>

      <p className="text-text/55 text-center text-sm">
        {t("login.noAccount")}{" "}
        <Link
          href={signupHref}
          className="text-accent hover:text-accent-highlight font-medium transition-colors"
        >
          {t("login.toSignup")}
        </Link>
      </p>
    </form>
  );
}
