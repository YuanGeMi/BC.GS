import { UserRole } from "@/lib/db-enums";
import { createServiceClient } from "@/lib/supabase/admin";

/** Stored in Supabase Auth `app_metadata` (service-role only). */
export const AUTH_ROLE_CLAIM = "role" as const;

export function parseAuthRole(
  appMetadata: Record<string, unknown> | null | undefined,
): UserRole | null {
  const raw = appMetadata?.[AUTH_ROLE_CLAIM];
  if (raw === UserRole.admin || raw === UserRole.user) return raw;
  return null;
}

/** Write role into Auth app_metadata so getClaims can authorize Desk reads locally. */
export async function syncAuthRoleClaim(
  userId: string,
  role: UserRole,
): Promise<void> {
  const admin = createServiceClient();
  const { data, error: readError } = await admin.auth.admin.getUserById(userId);
  if (readError) {
    console.error("[auth] syncAuthRoleClaim getUserById", readError.message);
    throw readError;
  }

  const existing =
    data.user?.app_metadata && typeof data.user.app_metadata === "object"
      ? (data.user.app_metadata as Record<string, unknown>)
      : {};

  if (existing[AUTH_ROLE_CLAIM] === role) return;

  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { ...existing, [AUTH_ROLE_CLAIM]: role },
  });
  if (error) {
    console.error("[auth] syncAuthRoleClaim updateUserById", error.message);
    throw error;
  }
}
