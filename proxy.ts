import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";

import { adminPerfStart } from "./lib/admin/perf-log";
import { routing } from "./i18n/routing";
import { applySupabaseSession } from "./lib/supabase/proxy";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdmin = path.includes("/admin");
  const perf = isAdmin ? adminPerfStart(`proxy ${path}`) : null;

  request.headers.set("x-pathname", path);
  const response = intlMiddleware(request);
  perf?.mark("intl");
  const out = await applySupabaseSession(request, response);
  perf?.end();
  return out;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|auth|.*\\..*).*)",
};
