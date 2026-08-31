-- CreateTable
CREATE TABLE "Bonus" (
    "id" TEXT NOT NULL,
    "casinoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" TEXT,
    "wageringRequirement" TEXT,
    "minDeposit" DOUBLE PRECISION,
    "code" TEXT,
    "expiryDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusTranslation" (
    "id" TEXT NOT NULL,
    "bonusId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "terms" TEXT NOT NULL,

    CONSTRAINT "BonusTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BonusTranslation_bonusId_locale_key" ON "BonusTranslation"("bonusId", "locale");

-- AddForeignKey
ALTER TABLE "Bonus" ADD CONSTRAINT "Bonus_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES "Casino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusTranslation" ADD CONSTRAINT "BonusTranslation_bonusId_fkey" FOREIGN KEY ("bonusId") REFERENCES "Bonus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
