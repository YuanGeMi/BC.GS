-- AlterTable
ALTER TABLE "CasinoCategory" ADD COLUMN "rank" INTEGER;

-- CreateTable
CREATE TABLE "CasinoCategoryNote" (
    "id" TEXT NOT NULL,
    "casinoId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "editorialNote" TEXT NOT NULL,

    CONSTRAINT "CasinoCategoryNote_pkey" PRIMARY KEY ("id")
);

-- BackfillData
WITH ranked AS (
    SELECT
        cc."casinoId",
        cc."categoryId",
        ROW_NUMBER() OVER (
            PARTITION BY cc."categoryId"
            ORDER BY c."overallRating" DESC NULLS LAST, c."slug" ASC
        )::INTEGER AS "rank"
    FROM "CasinoCategory" cc
    INNER JOIN "Casino" c ON c."id" = cc."casinoId"
)
UPDATE "CasinoCategory" cc
SET "rank" = ranked."rank"
FROM ranked
WHERE cc."casinoId" = ranked."casinoId"
  AND cc."categoryId" = ranked."categoryId";

-- CreateIndex
CREATE UNIQUE INDEX "CasinoCategoryNote_casinoId_categoryId_locale_key" ON "CasinoCategoryNote"("casinoId", "categoryId", "locale");

-- AddForeignKey
ALTER TABLE "CasinoCategoryNote" ADD CONSTRAINT "CasinoCategoryNote_casinoId_categoryId_fkey" FOREIGN KEY ("casinoId", "categoryId") REFERENCES "CasinoCategory"("casinoId", "categoryId") ON DELETE CASCADE ON UPDATE CASCADE;
