import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import { adminPerfStart } from "@/lib/admin/perf-log";
import { parseAuthRole } from "@/lib/auth/role-claim";
import { UserRole } from "@/lib/db-enums";
import { createClient } from "@/lib/supabase/server";

/** Minimal identity from a verified JWT (getClaims). */
export type AuthIdentity = {
  id: string;
  email?: string | null;
  role: UserRole | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

function metadataObject(
  value: unknown,
): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function identityFromClaims(claims: {
  sub: string;
  email?: unknown;
  user_metadata?: unknown;
  app_metadata?: unknown;
}): AuthIdentity {
  const app_metadata = metadataObject(claims.app_metadata);
  const email = typeof claims.email === "string" ? claims.email : null;
  return {
    id: claims.sub,
    email,
    role: parseAuthRole(app_metadata),
    user_metadata: metadataObject(claims.user_metadata),
    app_metadata,
  };
}

/**
 * Per-request identity via local JWT verification (getClaims).
 * Avoids a second Auth-server round trip after middleware cookie refresh.
 */
export const getAuthUser = cache(async (): Promise<AuthIdentity | null> => {
  const perf = adminPerfStart("getAuthUser.getClaims");
  const supabase = await createClient();
  perf.mark("createClient");
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) {
    perf.end(error ? `error=${error.message}` : "no-sub");
    return null;
  }

  const identity = identityFromClaims(
    data.claims as {
      sub: string;
      email?: unknown;
      user_metadata?: unknown;
      app_metadata?: unknown;
    },
  );
  perf.end(`ok role=${identity.role ?? "none"}`);
  return identity;
});

/**
 * Live Auth-server check. Use for sensitive mutations (role changes, deletes,
 * moderation) where JWT-only validation is not enough.
 */
export async function getVerifiedAuthUser(): Promise<AuthIdentity | null> {
  const perf = adminPerfStart("getVerifiedAuthUser.getUser");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    perf.end("null");
    return null;
  }
  const identity = identityFromUser(user);
  perf.end(`ok role=${identity.role ?? "none"}`);
  return identity;
}

export function identityFromUser(user: User): AuthIdentity {
  const app_metadata = metadataObject(user.app_metadata);
  return {
    id: user.id,
    email: user.email ?? null,
    role: parseAuthRole(app_metadata),
    user_metadata: metadataObject(user.user_metadata),
    app_metadata,
  };
}
