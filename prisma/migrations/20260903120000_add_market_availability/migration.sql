-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketTranslation" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MarketTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasinoMarket" (
    "casinoId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "affiliateLink" TEXT,

    CONSTRAINT "CasinoMarket_pkey" PRIMARY KEY ("casinoId","marketId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Market_code_key" ON "Market"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MarketTranslation_marketId_locale_key" ON "MarketTranslation"("marketId", "locale");

-- AddForeignKey
ALTER TABLE "MarketTranslation" ADD CONSTRAINT "MarketTranslation_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasinoMarket" ADD CONSTRAINT "CasinoMarket_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES "Casino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasinoMarket" ADD CONSTRAINT "CasinoMarket_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;
