-- DropTable
DROP TABLE "PrismaHealth";

-- CreateTable
CREATE TABLE "Casino" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "license" TEXT,
    "establishedYear" INTEGER,
    "minDeposit" DOUBLE PRECISION,
    "withdrawalTime" TEXT,
    "paymentMethods" TEXT[],
    "gameProviders" TEXT[],
    "overallRating" DOUBLE PRECISION,
    "ratingBonuses" DOUBLE PRECISION,
    "ratingGames" DOUBLE PRECISION,
    "ratingSupport" DOUBLE PRECISION,
    "ratingPayout" DOUBLE PRECISION,
    "ratingTrust" DOUBLE PRECISION,
    "affiliateLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Casino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasinoTranslation" (
    "id" TEXT NOT NULL,
    "casinoId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reviewBody" TEXT NOT NULL,
    "pros" TEXT[],
    "cons" TEXT[],
    "seoTitle" TEXT,
    "seoDescription" TEXT,

    CONSTRAINT "CasinoTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Casino_slug_key" ON "Casino"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CasinoTranslation_casinoId_locale_key" ON "CasinoTranslation"("casinoId", "locale");

-- AddForeignKey
ALTER TABLE "CasinoTranslation" ADD CONSTRAINT "CasinoTranslation_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES "Casino"("id") ON DELETE CASCADE ON UPDATE CASCADE;
