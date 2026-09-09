import { completeEmailCallback } from "@/lib/auth/complete-email-callback";

export async function GET(request: Request) {
  const url = new URL(request.url);
  console.error("[password-reset debug] /auth/reset", {
    href: request.url,
    pathname: url.pathname,
    search: url.search,
    queryType: url.searchParams.get("type"),
    queryHasCode: url.searchParams.has("code"),
    queryHasTokenHash: url.searchParams.has("token_hash"),
    next: url.searchParams.get("next"),
    locale: url.searchParams.get("locale"),
  });

  const { response } = await completeEmailCallback(request, {
    forceRecovery: true,
  });
  return response;
}
