"use server";

import { redirect } from "next/navigation";

import { mapSupabaseAuthError } from "@/lib/auth/errors";
import { emailCallbackUrl, getRequestOrigin } from "@/lib/auth/origin";
import { safeRedirectPath } from "@/lib/auth/paths";
import { ensureUserProfile } from "@/lib/auth/profile";
import {
  getPassword,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "@/lib/auth/validation";
import {
  isValidDisplayName,
  normalizeDisplayName,
} from "@/lib/reviews/display-name";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  checkEmail?: boolean;
  resetSent?: boolean;
  passwordUpdated?: boolean;
};

export async function signup(
  locale: string,
  next: string | undefined,
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email"));
  const displayName = normalizeDisplayName(formData.get("displayName"));
  const password = getPassword(formData.get("password"));
  const confirmPassword = getPassword(formData.get("confirmPassword"));

  if (!isValidDisplayName(displayName)) {
    return { error: "invalidName" };
  }

  if (!isValidEmail(email)) {
    return { error: "invalidEmail" };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: "passwordTooShort" };
  }

  if (password !== confirmPassword) {
    return { error: "passwordMismatch" };
  }

  const origin = await getRequestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: emailCallbackUrl(origin, safeRedirectPath(locale, next)),
    },
  });

  if (error) {
    return { error: mapSupabaseAuthError(error) };
  }

  if (data.session && data.user) {
    await ensureUserProfile(data.user, displayName);
    redirect(safeRedirectPath(locale, next));
  }

  return { checkEmail: true };
}

export async function login(
  locale: string,
  next: string | undefined,
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email"));
  const password = getPassword(formData.get("password"));

  if (!isValidEmail(email) || !password) {
    return { error: "invalidCredentials" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: mapSupabaseAuthError(error) };
  }

  if (data.user) {
    await ensureUserProfile(data.user);
  }

  redirect(safeRedirectPath(locale, next));
}

export async function resendConfirmation(
  locale: string,
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email"));

  if (!isValidEmail(email)) {
    return { error: "invalidEmail" };
  }

  const origin = await getRequestOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: emailCallbackUrl(origin, `/${locale}`),
    },
  });

  if (error) {
    return { error: mapSupabaseAuthError(error) };
  }

  return { checkEmail: true };
}

export async function requestPasswordReset(
  locale: string,
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email"));

  if (!isValidEmail(email)) {
    return { error: "invalidEmail" };
  }

  const origin = await getRequestOrigin();
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: emailCallbackUrl(origin, `/${locale}/reset-password`),
  });

  return { resetSent: true };
}

export async function updatePassword(
  locale: string,
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = getPassword(formData.get("password"));
  const confirmPassword = getPassword(formData.get("confirmPassword"));

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: "passwordTooShort" };
  }

  if (password !== confirmPassword) {
    return { error: "passwordMismatch" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "resetExpired" };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: mapSupabaseAuthError(error) };
  }

  return { passwordUpdated: true };
}

export async function logout(locale: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
