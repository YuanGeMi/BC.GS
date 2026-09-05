import { routing } from "@/i18n/routing";

function homePath(locale: string) {
  return `/${locale}`;
}

export function safeRedirectPath(locale: string, next: unknown) {
  if (typeof next !== "string") return homePath(locale);

  const value = next.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return homePath(locale);
  }

  if (value === `/${locale}` || value.startsWith(`/${locale}/`)) {
    return value;
  }

  if (
    routing.locales.some(
      (item) => value === `/${item}` || value.startsWith(`/${item}/`),
    )
  ) {
    return homePath(locale);
  }

  return `/${locale}${value}`;
}

export function safeCallbackNext(next: string | null) {
  const fallback = `/${routing.defaultLocale}`;
  if (!next) return fallback;

  const value = next.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return fallback;
  }

  const isLocalized = routing.locales.some(
    (locale) => value === `/${locale}` || value.startsWith(`/${locale}/`),
  );

  return isLocalized ? value : fallback;
}

export function localeFromPath(path: string) {
  return (
    routing.locales.find(
      (locale) => path === `/${locale}` || path.startsWith(`/${locale}/`),
    ) ?? routing.defaultLocale
  );
}
