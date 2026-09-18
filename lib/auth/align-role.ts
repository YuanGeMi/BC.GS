"use server";

import { syncAuthRoleClaim } from "@/lib/auth/role-claim";
import { getAuthUser } from "@/lib/auth/session";
import { UserRole } from "@/lib/db-enums";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Align Auth app_metadata.role with Prisma and refresh the session cookie.
 * Safe to call from a Client Component / Server Action (cookies can be set).
 * No-op when the JWT already carries the role claim.
 */
export async function alignSessionRoleClaim(): Promise<{
  refreshed: boolean;
  role: UserRole | null;
}> {
  const identity = await getAuthUser();
  if (!identity) return { refreshed: false, role: null };

  if (identity.role === UserRole.admin || identity.role === UserRole.user) {
    return { refreshed: false, role: identity.role };
  }

  const profile = await prisma.user.findUnique({
    where: { id: identity.id },
    select: { role: true },
  });
  const role = profile?.role ?? UserRole.user;

  await syncAuthRoleClaim(identity.id, role);

  const supabase = await createClient();
  const { error } = await supabase.auth.refreshSession();
  if (error) {
    console.error("[alignSessionRoleClaim] refreshSession", error.message);
    return { refreshed: false, role };
  }

  return { refreshed: true, role };
}
