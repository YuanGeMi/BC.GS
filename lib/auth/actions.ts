"use server";

import bcrypt from "bcrypt";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { signIn, signOut } from "@/auth";
import {
  getPassword,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export type AuthFormState = {
  error?: string;
};

function homePath(locale: string) {
  return `/${locale}`;
}

export async function signup(
  locale: string,
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email"));
  const password = getPassword(formData.get("password"));
  const confirmPassword = getPassword(formData.get("confirmPassword"));

  if (!isValidEmail(email)) {
    return { error: "invalidEmail" };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: "passwordTooShort" };
  }

  if (password !== confirmPassword) {
    return { error: "passwordMismatch" };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "user",
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "signupFailed" };
    }

    throw error;
  }

  await signIn("credentials", {
    email,
    password,
    redirectTo: homePath(locale),
  });

  return {};
}

export async function login(
  locale: string,
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email"));
  const password = getPassword(formData.get("password"));

  if (!isValidEmail(email) || !password) {
    return { error: "invalidCredentials" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: homePath(locale),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "invalidCredentials" };
    }

    throw error;
  }

  return {};
}

export async function logout(locale: string) {
  await signOut({ redirectTo: homePath(locale) });
  redirect(homePath(locale));
}
