import { NextResponse } from "next/server";

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
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureUserProfile(user);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
