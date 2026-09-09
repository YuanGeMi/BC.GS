import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import { localeFromPath, safeCallbackNext } from "@/lib/auth/paths";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

function callbackLocale(url: URL) {
  const localeParam = url.searchParams.get("locale");
  if (
    localeParam &&
    routing.locales.includes(localeParam as (typeof routing.locales)[number])
  ) {
    return localeParam;
  }

  return localeFromPath(url.searchParams.get("next") ?? "");
}

export function isRecoveryCallback(url: URL) {
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "";
  return (
    type === "recovery" ||
    next.includes("/reset-password") ||
    url.pathname === "/auth/reset" ||
    url.pathname.startsWith("/auth/reset/")
  );
}

export async function completeEmailCallback(
  request: Request,
  options?: { forceRecovery?: boolean },
) {
  const url = new URL(request.url);
  const origin = url.origin;
  const locale = callbackLocale(url);
  const recovery = options?.forceRecovery || isRecoveryCallback(url);
  const destination = recovery
    ? `${origin}/${locale}/reset-password`
    : `${origin}${safeCallbackNext(url.searchParams.get("next"))}`;

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const otpType =
    url.searchParams.get("type") ?? (recovery ? "recovery" : null);

  if (!code && !tokenHash) {
    if (recovery) {
      return { response: NextResponse.redirect(destination), recovery: true };
    }

    return {
      response: NextResponse.redirect(`${origin}/${locale}/login?error=auth`),
      recovery: false,
    };
  }

  const incoming = new NextRequest(request);
  const response = NextResponse.redirect(destination);
  const { url: supabaseUrl, anonKey } = getSupabasePublicEnv();
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return incoming.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          incoming.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        type: (otpType ?? "recovery") as EmailOtpType,
        token_hash: tokenHash!,
      });

  if (error) {
    return {
      response: NextResponse.redirect(`${origin}/${locale}/login?error=auth`),
      recovery,
    };
  }

  return { response, recovery, user: data.user };
}
