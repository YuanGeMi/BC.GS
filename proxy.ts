import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { applySupabaseSession } from "./lib/supabase/proxy";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  return applySupabaseSession(request, response);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|auth|.*\\..*).*)",
};
