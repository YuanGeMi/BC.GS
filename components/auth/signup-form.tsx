"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { Link } from "@/i18n/navigation";
import { signup, type AuthFormState } from "@/lib/auth/actions";
import { authInputClassName } from "@/lib/auth/input-class";

type SignupFormProps = {
  locale: string;
  next?: string;
};

const initialState: AuthFormState = {};

export function SignupForm({ locale, next }: SignupFormProps) {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(
    signup.bind(null, locale, next),
    initialState,
  );

  useEffect(() => {
    if (state.debug) {
      console.error("[signup debug]", state.debug);
    }
  }, [state.debug]);

  const loginHref = next
    ? `/login?next=${encodeURIComponent(next)}`
    : "/login";

  if (state.checkEmail) {
    return (
      <div className="space-y-4">
        <p className="text-text/80 text-sm leading-relaxed" role="status">
          {t("signup.checkEmail")}
        </p>
        <p className="text-text/55 text-center text-sm">
          {t("signup.hasAccount")}{" "}
          <Link
            href={loginHref}
            className="text-accent hover:text-accent-highlight font-medium transition-colors"
          >
            {t("signup.toLogin")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="displayName"
          className="text-text/75 mb-1.5 block text-sm font-medium"
        >
          {t("name")}
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          minLength={2}
          maxLength={80}
          required
          className={authInputClassName()}
        />
      </div>

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
        <label
          htmlFor="password"
          className="text-text/75 mb-1.5 block text-sm font-medium"
        >
          {t("password")}
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
        {pending ? t("signup.pending") : t("signup.submit")}
      </Button>

      <p className="text-text/55 text-center text-sm">
        {t("signup.hasAccount")}{" "}
        <Link
          href={loginHref}
          className="text-accent hover:text-accent-highlight font-medium transition-colors"
        >
          {t("signup.toLogin")}
        </Link>
      </p>
    </form>
  );
}
