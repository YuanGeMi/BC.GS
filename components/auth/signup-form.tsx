"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { signup, type AuthFormState } from "@/lib/auth/actions";

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
          className="bg-background/70 text-text ring-text/12 focus:ring-accent/55 h-11 w-full rounded-md px-3 text-sm ring-1 transition outline-none"
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
          className="bg-background/70 text-text ring-text/12 focus:ring-accent/55 h-11 w-full rounded-md px-3 text-sm ring-1 transition outline-none"
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
          className="bg-background/70 text-text ring-text/12 focus:ring-accent/55 h-11 w-full rounded-md px-3 text-sm ring-1 transition outline-none"
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
    </form>
  );
}
