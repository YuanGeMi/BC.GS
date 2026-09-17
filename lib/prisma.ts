import { PrismaClient } from "@prisma/client";

/**
 * One PrismaClient per process. In Next.js/Turbopack, modules can re-evaluate
 * on hot reload; without a global, each evaluation opens another pool and
 * exhausts Supabase.
 *
 * Drop the cached client when DATABASE_URL changes (e.g. after swapping
 * Supabase projects) so the old tenant does not stay stuck in memory.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaUrl: string | undefined;
};

const datasourceUrl = process.env.DATABASE_URL;

if (
  globalForPrisma.prisma &&
  globalForPrisma.prismaUrl &&
  datasourceUrl &&
  globalForPrisma.prismaUrl !== datasourceUrl
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
globalForPrisma.prismaUrl = datasourceUrl;
