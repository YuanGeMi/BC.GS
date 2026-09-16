import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Prisma + remote Supabase: each build worker has its own client/pool.
  // Cap SSG parallelism so concurrent casino×locale prerenders do not all
  // open footer + page queries at once (P2024 connection pool timeouts).
  experimental: {
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 50,
    staticGenerationRetryCount: 3,
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
