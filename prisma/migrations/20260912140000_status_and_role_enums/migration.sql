-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'published');
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'published', 'rejected');
CREATE TYPE "MarketAvailability" AS ENUM ('available', 'restricted');
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- Normalize leftover free-text values before the type change.
UPDATE "Casino" SET "status" = 'draft' WHERE "status" NOT IN ('draft', 'published');
UPDATE "Bonus" SET "status" = 'draft' WHERE "status" NOT IN ('draft', 'published');
UPDATE "Category" SET "status" = 'draft' WHERE "status" NOT IN ('draft', 'published');
UPDATE "StaticPage" SET "status" = 'draft' WHERE "status" NOT IN ('draft', 'published');
UPDATE "UserReview" SET "status" = 'pending' WHERE "status" NOT IN ('pending', 'published', 'rejected');
UPDATE "CasinoMarket" SET "status" = 'available' WHERE "status" NOT IN ('available', 'restricted');
UPDATE "User" SET "role" = 'user' WHERE "role" NOT IN ('user', 'admin');

-- AlterTable
ALTER TABLE "Casino" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Casino" ALTER COLUMN "status" TYPE "ContentStatus" USING ("status"::text::"ContentStatus");
ALTER TABLE "Casino" ALTER COLUMN "status" SET DEFAULT 'draft'::"ContentStatus";

ALTER TABLE "Bonus" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Bonus" ALTER COLUMN "status" TYPE "ContentStatus" USING ("status"::text::"ContentStatus");
ALTER TABLE "Bonus" ALTER COLUMN "status" SET DEFAULT 'draft'::"ContentStatus";

ALTER TABLE "Category" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Category" ALTER COLUMN "status" TYPE "ContentStatus" USING ("status"::text::"ContentStatus");
ALTER TABLE "Category" ALTER COLUMN "status" SET DEFAULT 'draft'::"ContentStatus";

ALTER TABLE "StaticPage" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "StaticPage" ALTER COLUMN "status" TYPE "ContentStatus" USING ("status"::text::"ContentStatus");
ALTER TABLE "StaticPage" ALTER COLUMN "status" SET DEFAULT 'draft'::"ContentStatus";

ALTER TABLE "UserReview" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "UserReview" ALTER COLUMN "status" TYPE "ReviewStatus" USING ("status"::text::"ReviewStatus");
ALTER TABLE "UserReview" ALTER COLUMN "status" SET DEFAULT 'pending'::"ReviewStatus";

ALTER TABLE "CasinoMarket" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CasinoMarket" ALTER COLUMN "status" TYPE "MarketAvailability" USING ("status"::text::"MarketAvailability");
ALTER TABLE "CasinoMarket" ALTER COLUMN "status" SET DEFAULT 'available'::"MarketAvailability";

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::text::"UserRole");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user'::"UserRole";
