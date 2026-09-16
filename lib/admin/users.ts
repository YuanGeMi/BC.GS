"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { UserRole } from "@/lib/db-enums";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";

export type AdminUserRow = {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  createdAt: string;
};

export type SetUserRoleState = {
  error?: "missing" | "lastAdmin" | "invalidRole";
};

export async function listUsers(): Promise<AdminUserRow[]> {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      createdAt: true,
    },
  });

  return users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));
}

export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<SetUserRoleState> {
  await requireAdmin();

  if (role !== UserRole.admin && role !== UserRole.user) {
    return { error: "invalidRole" };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!target) {
    return { error: "missing" };
  }

  if (target.role === role) {
    return {};
  }

  if (target.role === UserRole.admin && role === UserRole.user) {
    const otherAdmins = await prisma.user.count({
      where: { role: UserRole.admin, id: { not: userId } },
    });
    if (otherAdmins < 1) {
      return { error: "lastAdmin" };
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin/users`);
  }

  return {};
}

