import { NextRequest } from "next/server";

import { completeEmailCallback } from "@/lib/auth/complete-email-callback";
import {
  parseResetLocale,
  RESET_LOCALE_COOKIE,
  resetLocaleCookieOptions,
} from "@/lib/auth/reset-locale-cookie";

export async function GET(request: Request) {
  const incoming = new NextRequest(request);
  const locale = parseResetLocale(
    incoming.cookies.get(RESET_LOCALE_COOKIE)?.value,
  );
  const url = new URL(request.url);
  console.error("[password-reset debug] /auth/reset", {
    href: request.url,
    pathname: url.pathname,
    search: url.search,
    queryType: url.searchParams.get("type"),
    queryHasCode: url.searchParams.has("code"),
    queryHasTokenHash: url.searchParams.has("token_hash"),
    locale,
    localeFromCookie: incoming.cookies.get(RESET_LOCALE_COOKIE)?.value ?? null,
  });

  const { response } = await completeEmailCallback(request, {
    forceRecovery: true,
    locale,
  });

  response.cookies.set(
    RESET_LOCALE_COOKIE,
    "",
    resetLocaleCookieOptions(true),
  );

  return response;
}
