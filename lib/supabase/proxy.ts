import { createServerClient } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";

import { adminPerfStart } from "@/lib/admin/perf-log";

export async function applySupabaseSession(
  request: NextRequest,
  response: NextResponse,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const isAdmin = request.nextUrl.pathname.includes("/admin");
  const perf = isAdmin ? adminPerfStart("proxy.getClaims") : null;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh/validate the session JWT. Prefer getClaims (local JWKS when the
  // project uses asymmetric keys) over getUser to avoid an Auth-server RTT.
  await supabase.auth.getClaims();
  perf?.end();

  return response;
}
