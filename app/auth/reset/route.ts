import { completeEmailCallback } from "@/lib/auth/complete-email-callback";

export async function GET(request: Request) {
  const { response } = await completeEmailCallback(request, {
    forceRecovery: true,
  });
  return response;
}
