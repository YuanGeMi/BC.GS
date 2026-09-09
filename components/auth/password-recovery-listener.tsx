"use client";

import { useEffect } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { PASSWORD_RECOVERY_FLAG } from "@/lib/auth/recovery-flag";
import { createClient } from "@/lib/supabase/client";

function isResetPasswordPath(pathname: string) {
  return pathname === "/reset-password" || pathname.endsWith("/reset-password");
}

function isLoginPath(pathname: string) {
  return pathname === "/login" || pathname.endsWith("/login");
}

export function PasswordRecoveryListener() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, ""),
    );
    const queryType = new URLSearchParams(window.location.search).get("type");
    const recoveryHint =
      hashParams.get("type") === "recovery" || queryType === "recovery";

    if (recoveryHint) {
      sessionStorage.setItem(PASSWORD_RECOVERY_FLAG, "1");
    } else if (isLoginPath(pathname)) {
      sessionStorage.removeItem(PASSWORD_RECOVERY_FLAG);
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || recoveryHint) {
        sessionStorage.setItem(PASSWORD_RECOVERY_FLAG, "1");
      }

      if (event === "SIGNED_OUT" || (isLoginPath(pathname) && !recoveryHint)) {
        sessionStorage.removeItem(PASSWORD_RECOVERY_FLAG);
        return;
      }

      const pending = sessionStorage.getItem(PASSWORD_RECOVERY_FLAG) === "1";
      if (session && pending && !isResetPasswordPath(pathname)) {
        router.replace("/reset-password");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
