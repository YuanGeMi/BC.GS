"use client";

import { createClient } from "@/lib/supabase/client";

export function logPasswordResetClientDebug(source: string) {
  const hash = window.location.hash.replace(/^#/, "");
  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(window.location.search);

  console.log("[password-reset debug] url", {
    source,
    href: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    hashTypeRecovery: hashParams.get("type") === "recovery",
    hashHasAccessToken: hashParams.has("access_token"),
    queryType: searchParams.get("type"),
    queryHasCode: searchParams.has("code"),
  });
}

export async function logPasswordResetSessionDebug(source: string) {
  const supabase = createClient();
  const [{ data: sessionData }, { data: userData }] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser(),
  ]);

  console.log("[password-reset debug] supabase", {
    source,
    event: "immediate",
    hasSession: Boolean(sessionData.session),
    userId: userData.user?.id ?? sessionData.session?.user.id ?? null,
    email: userData.user?.email ?? sessionData.session?.user.email ?? null,
  });

  return supabase;
}
