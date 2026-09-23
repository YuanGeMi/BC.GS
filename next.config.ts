import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const LOCAL_ENV_KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
] as const;

function unquoteEnvValue(value: string): string {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if (
    (quote === '"' || quote === "'") &&
    trimmed[trimmed.length - 1] === quote
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function preferLocalEnvInDevelopment() {
  if (process.env.NODE_ENV !== "development") return;

  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const allowed = new Set<string>(LOCAL_ENV_KEYS);

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(
      line.trim(),
    );
    if (!match || !allowed.has(match[1])) continue;
    process.env[match[1]] = unquoteEnvValue(match[2]);
  }
}

preferLocalEnvInDevelopment();

function supabaseStorageHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = supabaseStorageHost();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
