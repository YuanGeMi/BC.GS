import type { User } from "@supabase/supabase-js";

import type { AuthIdentity } from "@/lib/auth/session";
import { UserRole } from "@/lib/db-enums";
import { prisma } from "@/lib/prisma";
import { displayNameFromAuthMetadata } from "@/lib/reviews/display-name";

export async function ensureUserProfile(
  user: AuthIdentity | User,
  displayNameOverride?: string,
) {
  const email = user.email?.trim().toLowerCase();
  if (!email) return;

  const displayName =
    displayNameOverride?.trim() ||
    displayNameFromAuthMetadata(user.user_metadata);

  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email,
      role: UserRole.user,
      ...(displayName ? { displayName } : {}),
    },
    update: {
      email,
      ...(displayName ? { displayName } : {}),
      // Never write `role` here. Login/signup must not demote an existing admin.
    },
  });
}
