import { after } from "next/server";

import { completeEmailCallback } from "@/lib/auth/complete-email-callback";
import { ensureUserProfile } from "@/lib/auth/profile";

export async function GET(request: Request) {
  const { response, recovery, user } = await completeEmailCallback(request);

  if (!recovery && user) {
    after(async () => {
      try {
        await ensureUserProfile(user);
      } catch (profileError) {
        console.error("[auth/callback] ensureUserProfile", profileError);
      }
    });
  }

  return response;
}
