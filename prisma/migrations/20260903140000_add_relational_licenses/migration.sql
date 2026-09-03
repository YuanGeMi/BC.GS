-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseTranslation" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LicenseTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasinoLicense" (
    "casinoId" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationUrl" TEXT,

    CONSTRAINT "CasinoLicense_pkey" PRIMARY KEY ("casinoId","licenseId")
);

-- CreateIndex
CREATE UNIQUE INDEX "License_slug_key" ON "License"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseTranslation_licenseId_locale_key" ON "LicenseTranslation"("licenseId", "locale");

-- AddForeignKey
ALTER TABLE "LicenseTranslation" ADD CONSTRAINT "LicenseTranslation_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasinoLicense" ADD CONSTRAINT "CasinoLicense_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES "Casino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasinoLicense" ADD CONSTRAINT "CasinoLicense_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed canonical license types (deterministic ids so CasinoLicense migration can join by slug)
INSERT INTO "License" ("id", "slug") VALUES
    ('license_mga', 'mga'),
    ('license_curacao', 'curacao'),
    ('license_gibraltar', 'gibraltar'),
    ('license_ukgc', 'ukgc'),
    ('license_kahnawake', 'kahnawake');

INSERT INTO "LicenseTranslation" ("id", "licenseId", "locale", "name") VALUES
    ('license_tr_mga_en', 'license_mga', 'en', 'Malta Gaming Authority'),
    ('license_tr_curacao_en', 'license_curacao', 'en', 'Curaçao eGaming'),
    ('license_tr_gibraltar_en', 'license_gibraltar', 'en', 'Gibraltar Gambling Commissioner'),
    ('license_tr_ukgc_en', 'license_ukgc', 'en', 'UK Gambling Commission'),
    ('license_tr_kahnawake_en', 'license_kahnawake', 'en', 'Kahnawake Gaming Commission');

-- Migrate comma-separated Casino.license strings into CasinoLicense rows
INSERT INTO "CasinoLicense" ("casinoId", "licenseId", "verified")
SELECT DISTINCT c."id", l."id", false
FROM "Casino" c
CROSS JOIN LATERAL unnest(string_to_array(c."license", ',')) AS raw(code)
JOIN "License" l ON l."slug" = btrim(raw.code)
WHERE c."license" IS NOT NULL AND btrim(c."license") <> '';

-- AlterTable
ALTER TABLE "Casino" DROP COLUMN "license";
