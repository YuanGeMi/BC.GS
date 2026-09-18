import { after } from "next/server";

import { completeEmailCallback } from "@/lib/auth/complete-email-callback";
import { ensureUserProfile } from "@/lib/auth/profile";
import { syncAuthRoleClaim } from "@/lib/auth/role-claim";
import { UserRole } from "@/lib/db-enums";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { response, recovery, user } = await completeEmailCallback(request);

  if (!recovery && user) {
    after(async () => {
      try {
        await ensureUserProfile(user);
        const profile = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        await syncAuthRoleClaim(user.id, profile?.role ?? UserRole.user);
      } catch (profileError) {
        console.error("[auth/callback] ensureUserProfile", profileError);
      }
    });
  }

  return response;
}
