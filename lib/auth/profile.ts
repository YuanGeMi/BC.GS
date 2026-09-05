import type { User } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { displayNameFromAuthMetadata } from "@/lib/reviews/display-name";

export async function ensureUserProfile(
  user: User,
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
      role: "user",
      ...(displayName ? { displayName } : {}),
    },
    update: {
      email,
      ...(displayName ? { displayName } : {}),
    },
  });
}
