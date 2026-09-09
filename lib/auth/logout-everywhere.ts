"use client";

import { logout } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";

/** Sign out the browser client (header) then the server cookies. */
export async function logoutEverywhere(locale: string) {
  const supabase = createClient();
  await supabase.auth.signOut();
  await logout(locale);
}
