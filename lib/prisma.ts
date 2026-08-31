import { PrismaClient } from "@prisma/client";

// Reuse one PrismaClient per serverless isolate / dev process. Without this,
// hot reloads and module re-evaluation spawn extra clients, each holding its
// own connection pool and exhausting Supabase's limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
