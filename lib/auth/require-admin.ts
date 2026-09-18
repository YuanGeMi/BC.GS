import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { adminPerfStart } from "@/lib/admin/perf-log";
import { localeFromPath } from "@/lib/auth/paths";
import { ensureUserProfile } from "@/lib/auth/profile";
import {
  getAuthUser,
  getVerifiedAuthUser,
  type AuthIdentity,
} from "@/lib/auth/session";
import { UserRole } from "@/lib/db-enums";
import { prisma } from "@/lib/prisma";

export type AdminSession = {
  id: string;
  email: string;
  displayName: string | null;
};

function adminReturnPath(pathname: string | null) {
  if (
    pathname &&
    pathname.startsWith("/") &&
    !pathname.startsWith("//") &&
    !pathname.includes("://") &&
    (pathname === "/admin" ||
      pathname.startsWith("/admin/") ||
      /\/admin(?:\/|$)/.test(pathname))
  ) {
    return pathname;
  }

  return "/en/admin";
}

async function adminGateContext() {
  const pathname = (await headers()).get("x-pathname");
  const returnPath = adminReturnPath(pathname);
  const locale = localeFromPath(returnPath);
  return { returnPath, locale };
}

/**
 * Desk reads: trust JWT `app_metadata.role` when present (local, no DB).
 * Falls back to Prisma for sessions that have not refreshed the claim yet.
 * Claim sync + cookie refresh happens on login or via alignSessionRoleClaim
 * (Server Action) — not here (RSC cannot persist refreshed cookies).
 */
async function resolveAdminFromClaims(
  authUser: AuthIdentity | null,
): Promise<AdminSession> {
  const perf = adminPerfStart("resolveAdmin.claims");
  const { returnPath, locale } = await adminGateContext();
  perf.mark("headers");

  if (!authUser) {
    perf.end("redirect-login");
    redirect(`/${locale}/login?next=${encodeURIComponent(returnPath)}`);
  }

  if (authUser.role === UserRole.admin) {
    const email = authUser.email?.trim();
    if (!email) {
      perf.end("no-email");
      notFound();
    }
    perf.end("jwt-admin");
    return {
      id: authUser.id,
      email,
      displayName: null,
    };
  }

  perf.mark("fallback-db");
  return resolveAdminFromDb(authUser, perf);
}

/**
 * Destructive / privilege paths: always confirm role in Postgres so demotion
 * takes effect even if the JWT still says admin.
 */
async function resolveAdminFromDb(
  authUser: AuthIdentity | null,
  parentPerf?: ReturnType<typeof adminPerfStart>,
): Promise<AdminSession> {
  const perf = parentPerf ?? adminPerfStart("resolveAdmin.db");
  const { returnPath, locale } = await adminGateContext();

  if (!authUser) {
    perf.end("redirect-login");
    redirect(`/${locale}/login?next=${encodeURIComponent(returnPath)}`);
  }

  let profile = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, email: true, displayName: true, role: true },
  });
  perf.mark("user.findUnique");

  if (!profile) {
    await ensureUserProfile(authUser);
    perf.mark("ensureUserProfile");
    profile = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, displayName: true, role: true },
    });
    perf.mark("user.findUnique.retry");
  }

  if (!profile || profile.role !== UserRole.admin) {
    perf.end("not-admin");
    notFound();
  }

  perf.end(`role=${profile.role}`);
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
  };
}

/** Per-request memo — JWT role claim when set; otherwise one Prisma lookup. */
export const requireAdmin = cache(async (): Promise<AdminSession> => {
  const perf = adminPerfStart("requireAdmin");
  const user = await getAuthUser();
  perf.mark("getAuthUser");
  const session = await resolveAdminFromClaims(user);
  perf.end();
  return session;
});

/** Live Auth + DB role check for destructive / privilege-changing Server Actions. */
export async function requireVerifiedAdmin(): Promise<AdminSession> {
  const perf = adminPerfStart("requireVerifiedAdmin");
  const user = await getVerifiedAuthUser();
  perf.mark("getVerifiedAuthUser");
  const session = await resolveAdminFromDb(user);
  perf.end();
  return session;
}
