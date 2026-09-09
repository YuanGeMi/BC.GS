import { routing, type Locale } from "@/i18n/routing";

export const RESET_LOCALE_COOKIE = "reset-locale";
export const RESET_LOCALE_MAX_AGE = 60 * 15;

export function resetLocaleCookieOptions(expired = false) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: expired ? 0 : RESET_LOCALE_MAX_AGE,
  };
}

export function parseResetLocale(value: string | undefined | null): Locale {
  if (value && routing.locales.includes(value as Locale)) {
    return value as Locale;
  }

  return routing.defaultLocale;
}
