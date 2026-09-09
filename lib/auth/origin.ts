export function getRequestOrigin() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return siteUrl || "http://localhost:3000";
}

export function emailCallbackUrl(origin: string, nextPath: string) {
  return `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

export function passwordResetCallbackUrl(origin: string, locale: string) {
  const next = `/${locale}/reset-password`;
  const params = new URLSearchParams({ next, locale });
  return `${origin}/auth/reset?${params.toString()}`;
}
