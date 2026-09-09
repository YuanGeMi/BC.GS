import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  parseResetLocale,
  RESET_LOCALE_COOKIE,
  resetLocaleCookieOptions,
} from "@/lib/auth/reset-locale-cookie";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const locale = parseResetLocale(
    cookieStore.get(RESET_LOCALE_COOKIE)?.value,
  );
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const origin = url.origin;
  const loginError = `${origin}/${locale}/login?error=auth`;
  const resetPassword = `${origin}/${locale}/reset-password`;

  console.error("[password-reset debug] /auth/reset", {
    href: request.url,
    pathname: url.pathname,
    search: url.search,
    queryType: type,
    queryHasTokenHash: Boolean(tokenHash),
    locale,
    localeFromCookie: cookieStore.get(RESET_LOCALE_COOKIE)?.value ?? null,
  });

  function withExpiredLocaleCookie(response: NextResponse) {
    response.cookies.set(
      RESET_LOCALE_COOKIE,
      "",
      resetLocaleCookieOptions(true),
    );
    return response;
  }

  if (!tokenHash || type !== "recovery") {
    return withExpiredLocaleCookie(NextResponse.redirect(loginError));
  }

  const response = NextResponse.redirect(resetPassword);
  const { url: supabaseUrl, anonKey } = getSupabasePublicEnv();
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.verifyOtp({
    type: "recovery",
    token_hash: tokenHash,
  });

  if (error) {
    return withExpiredLocaleCookie(NextResponse.redirect(loginError));
  }

  return withExpiredLocaleCookie(response);
}
