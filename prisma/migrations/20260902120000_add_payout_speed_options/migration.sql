-- CreateTable
CREATE TABLE "PayoutSpeedOption" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PayoutSpeedOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutSpeedOptionTranslation" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "PayoutSpeedOptionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayoutSpeedOption_slug_key" ON "PayoutSpeedOption"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutSpeedOptionTranslation_optionId_locale_key" ON "PayoutSpeedOptionTranslation"("optionId", "locale");

-- AddForeignKey
ALTER TABLE "PayoutSpeedOptionTranslation" ADD CONSTRAINT "PayoutSpeedOptionTranslation_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PayoutSpeedOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed options needed for backfill before dropping the old free-text field.
INSERT INTO "PayoutSpeedOption" ("id", "slug", "sortOrder")
VALUES
    ('payout_under_1_hour', 'under-1-hour', 10),
    ('payout_under_2_hours', 'under-2-hours', 20),
    ('payout_same_day', 'same-day', 30),
    ('payout_under_6_hours', 'under-6-hours', 40),
    ('payout_12_24_hours', '12-24-hours', 50),
    ('payout_24_48_hours', '24-48-hours', 60),
    ('payout_1_2_days', '1-2-days', 70);

-- AlterTable
ALTER TABLE "Casino" ADD COLUMN "payoutSpeedId" TEXT;

-- Backfill from the old free-text field to the nearest available option.
UPDATE "Casino"
SET "payoutSpeedId" = CASE
    WHEN "withdrawalTime" = 'Under 1 hour' THEN 'payout_under_1_hour'
    WHEN "withdrawalTime" = 'Under 2 hours' THEN 'payout_under_2_hours'
    WHEN "withdrawalTime" = 'Same day' THEN 'payout_same_day'
    WHEN "withdrawalTime" = 'Under 6 hours' THEN 'payout_under_6_hours'
    WHEN "withdrawalTime" IN ('Under 12 hours', '12–24 hours', '24 hours') THEN 'payout_12_24_hours'
    WHEN "withdrawalTime" = '24–48 hours' THEN 'payout_24_48_hours'
    WHEN "withdrawalTime" IN ('1–2 days', '2–3 days', '3–5 days') THEN 'payout_1_2_days'
    ELSE NULL
END;

-- AddForeignKey
ALTER TABLE "Casino" ADD CONSTRAINT "Casino_payoutSpeedId_fkey" FOREIGN KEY ("payoutSpeedId") REFERENCES "PayoutSpeedOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Casino" DROP COLUMN "withdrawalTime";
