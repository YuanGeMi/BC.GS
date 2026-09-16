import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { localeFromPath } from "@/lib/auth/paths";
import { ensureUserProfile } from "@/lib/auth/profile";
import { getAuthUser } from "@/lib/auth/session";
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

export async function requireAdmin(): Promise<AdminSession> {
  const pathname = (await headers()).get("x-pathname");
  const returnPath = adminReturnPath(pathname);
  const locale = localeFromPath(returnPath);

  const authUser = await getAuthUser();
  if (!authUser) {
    redirect(`/${locale}/login?next=${encodeURIComponent(returnPath)}`);
  }

  let profile = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, email: true, displayName: true, role: true },
  });

  if (!profile) {
    await ensureUserProfile(authUser);
    profile = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, displayName: true, role: true },
    });
  }

  if (!profile || profile.role !== UserRole.admin) {
    notFound();
  }

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
  };
}
