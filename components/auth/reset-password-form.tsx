"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { Link, useRouter } from "@/i18n/navigation";
import { updatePassword, type AuthFormState } from "@/lib/auth/actions";
import { authInputClassName } from "@/lib/auth/input-class";
import {
  logPasswordResetClientDebug,
  logPasswordResetSessionDebug,
} from "@/lib/auth/password-reset-debug";
import { PASSWORD_RECOVERY_FLAG } from "@/lib/auth/recovery-flag";
import { createClient } from "@/lib/supabase/client";

type ResetPasswordFormProps = {
  locale: string;
  initialReady?: boolean;
};

const initialState: AuthFormState = {};

export function ResetPasswordForm({
  locale,
  initialReady = false,
}: ResetPasswordFormProps) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [ready, setReady] = useState(initialReady);
  const [expired, setExpired] = useState(false);
  const [state, formAction, pending] = useActionState(
    updatePassword.bind(null, locale),
    initialState,
  );

  useEffect(() => {
    if (initialReady) {
      sessionStorage.setItem(PASSWORD_RECOVERY_FLAG, "1");
    }
  }, [initialReady]);

  useEffect(() => {
    logPasswordResetClientDebug("ResetPasswordForm");
    void logPasswordResetSessionDebug("ResetPasswordForm");
  }, []);

  useEffect(() => {
    if (!state.passwordUpdated) return;

    let cancelled = false;

    void (async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      if (!cancelled) {
        router.replace("/login?reset=ok");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.passwordUpdated, router]);

  useEffect(() => {
    if (initialReady) return;

    const supabase = createClient();
    let cancelled = false;
    let timeout: number | undefined;

    const markReady = () => {
      if (cancelled) return;
      window.clearTimeout(timeout);
      sessionStorage.setItem(PASSWORD_RECOVERY_FLAG, "1");
      setReady(true);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[password-reset debug] onAuthStateChange", {
        source: "ResetPasswordForm",
        event,
        hasSession: Boolean(session),
        userId: session?.user.id ?? null,
      });
      if (session && event !== "SIGNED_OUT") markReady();
    });

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        markReady();
        return;
      }

      timeout = window.setTimeout(() => {
        if (!cancelled) setExpired(true);
      }, 1500);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [initialReady]);

  if (!ready && !expired) {
    return (
      <p className="text-text/55 text-sm" role="status">
        {t("reset.checking")}
      </p>
    );
  }

  if (expired && !ready) {
    return (
      <p className="text-text/55 text-sm">
        <Link
          href="/forgot-password"
          className="text-accent hover:text-accent-highlight font-medium transition-colors"
        >
          {t("reset.requestAgain")}
        </Link>
      </p>
    );
  }

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
