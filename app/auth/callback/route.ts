import { after, NextResponse } from "next/server";

import { localeFromPath, safeCallbackNext } from "@/lib/auth/paths";
import { ensureUserProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeCallbackNext(url.searchParams.get("next"));
  const locale = localeFromPath(next);
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
  }

  if (user) {
    after(async () => {
      try {
        await ensureUserProfile(user);
      } catch (profileError) {
        console.error("[auth/callback] ensureUserProfile", profileError);
      }
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
