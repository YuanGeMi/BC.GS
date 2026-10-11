"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { mapSupabaseAuthError } from "@/lib/auth/errors";
import { getVerifiedAuthUser } from "@/lib/auth/session";
import { getPassword, MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type ChangePasswordError =
  | "signedOut"
  | "currentRequired"
  | "wrongCurrentPassword"
  | "passwordTooShort"
  | "passwordMismatch"
  | "samePassword"
  | "rateLimited"
  | "generic";

export type ChangePasswordState =
  | { status: "idle" }
  | { status: "error"; error: ChangePasswordError }
  | { status: "success"; at: number };

/** Throwaway client: signing in with it never touches the admin's cookie session. */
function statelessClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createSupabaseClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function knownError(code: string): ChangePasswordError {
  return code === "passwordTooShort" ||
    code === "samePassword" ||
    code === "rateLimited"
    ? code
    : "generic";
}

/** Changes the signed-in user's own password, after checking the current one. */
export async function changeOwnPassword(
  _state: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const fail = (error: ChangePasswordError): ChangePasswordState => ({
    status: "error",
    error,
  });

  const user = await getVerifiedAuthUser();
  const email = user?.email?.trim();
  if (!user || !email) return fail("signedOut");

  const current = getPassword(formData.get("currentPassword"));
  const next = getPassword(formData.get("newPassword"));
  const confirm = getPassword(formData.get("confirmPassword"));

  if (!current) return fail("currentRequired");
  if (next.length < MIN_PASSWORD_LENGTH) return fail("passwordTooShort");
  if (next !== confirm) return fail("passwordMismatch");
  if (next === current) return fail("samePassword");

  const verifier = statelessClient();
  const { data: signIn, error: signInError } =
    await verifier.auth.signInWithPassword({
      email,
      password: current,
    });
  if (signInError || !signIn.user || signIn.user.id !== user.id) {
    const mapped = signInError ? mapSupabaseAuthError(signInError) : "generic";
    if (mapped === "rateLimited") return fail("rateLimited");
    if (mapped !== "invalidCredentials") {
      console.error("[changeOwnPassword] verify", signInError?.message);
      return fail("generic");
    }
    return fail("wrongCurrentPassword");
  }

  const { error: updateError } = await verifier.auth.updateUser({
    password: next,
  });
  await verifier.auth.signOut({ scope: "local" });
  if (updateError) {
    const mapped = knownError(mapSupabaseAuthError(updateError));
    if (mapped === "generic") {
      console.error("[changeOwnPassword] update", updateError.message);
    }
    return fail(mapped);
  }

  const supabase = await createClient();
  const { error: othersError } = await supabase.auth.signOut({
    scope: "others",
  });
  if (othersError) {
    console.error("[changeOwnPassword] sign out others", othersError.message);
  }

  return { status: "success", at: Date.now() };
}
