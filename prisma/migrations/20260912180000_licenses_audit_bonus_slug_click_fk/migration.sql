-- License catalog: sort order + public labels
ALTER TABLE "License" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

UPDATE "License" SET "sortOrder" = CASE "slug"
  WHEN 'mga' THEN 10
  WHEN 'curacao' THEN 20
  WHEN 'gibraltar' THEN 30
  WHEN 'ukgc' THEN 40
  WHEN 'kahnawake' THEN 50
  ELSE 1000
END;

INSERT INTO "LicenseTranslation" ("id", "licenseId", "locale", "name")
SELECT gen_random_uuid()::text, l.id, v.locale, v.name
FROM "License" l
JOIN (VALUES
  ('mga', 'en', 'Malta (MGA)'),
  ('mga', 'zh', '马耳他（MGA）'),
  ('mga', 'th', 'มอลตา (MGA)'),
  ('curacao', 'en', 'Curaçao'),
  ('curacao', 'zh', '库拉索'),
  ('curacao', 'th', 'คูราเซา'),
  ('gibraltar', 'en', 'Gibraltar'),
  ('gibraltar', 'zh', '直布罗陀'),
  ('gibraltar', 'th', 'ยิบรอลตาร์'),
  ('ukgc', 'en', 'UKGC'),
  ('ukgc', 'zh', 'UKGC'),
  ('ukgc', 'th', 'UKGC'),
  ('kahnawake', 'en', 'Kahnawake'),
  ('kahnawake', 'zh', 'Kahnawake'),
  ('kahnawake', 'th', 'Kahnawake')
) AS v(slug, locale, name) ON v.slug = l.slug
ON CONFLICT ("licenseId", "locale") DO UPDATE SET "name" = EXCLUDED."name";

-- Bonus slug + sort order
ALTER TABLE "Bonus" ADD COLUMN "slug" TEXT;
UPDATE "Bonus" SET "slug" = "id" WHERE "slug" IS NULL;
ALTER TABLE "Bonus" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Bonus_slug_key" ON "Bonus"("slug");
ALTER TABLE "Bonus" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Audit fields
ALTER TABLE "Casino" ADD COLUMN "createdById" TEXT;
ALTER TABLE "Casino" ADD COLUMN "updatedById" TEXT;
ALTER TABLE "Bonus" ADD COLUMN "createdById" TEXT;
ALTER TABLE "Bonus" ADD COLUMN "updatedById" TEXT;
ALTER TABLE "Category" ADD COLUMN "createdById" TEXT;
ALTER TABLE "Category" ADD COLUMN "updatedById" TEXT;
ALTER TABLE "StaticPage" ADD COLUMN "createdById" TEXT;
ALTER TABLE "StaticPage" ADD COLUMN "updatedById" TEXT;
ALTER TABLE "UserReview" ADD COLUMN "moderatedById" TEXT;
ALTER TABLE "UserReview" ADD COLUMN "moderatedAt" TIMESTAMP(3);

ALTER TABLE "Casino" ADD CONSTRAINT "Casino_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Casino" ADD CONSTRAINT "Casino_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Bonus" ADD CONSTRAINT "Bonus_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Bonus" ADD CONSTRAINT "Bonus_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StaticPage" ADD CONSTRAINT "StaticPage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StaticPage" ADD CONSTRAINT "StaticPage_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserReview" ADD CONSTRAINT "UserReview_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Casino_createdById_idx" ON "Casino"("createdById");
CREATE INDEX "Casino_updatedById_idx" ON "Casino"("updatedById");
CREATE INDEX "Bonus_createdById_idx" ON "Bonus"("createdById");
CREATE INDEX "Bonus_updatedById_idx" ON "Bonus"("updatedById");
CREATE INDEX "Category_createdById_idx" ON "Category"("createdById");
CREATE INDEX "Category_updatedById_idx" ON "Category"("updatedById");
CREATE INDEX "StaticPage_createdById_idx" ON "StaticPage"("createdById");
CREATE INDEX "StaticPage_updatedById_idx" ON "StaticPage"("updatedById");
CREATE INDEX "UserReview_moderatedById_idx" ON "UserReview"("moderatedById");

-- AffiliateClick.bonusId becomes a real FK
UPDATE "AffiliateClick" SET "bonusId" = NULL
WHERE "bonusId" IS NOT NULL
  AND "bonusId" NOT IN (SELECT "id" FROM "Bonus");

ALTER TABLE "AffiliateClick" ADD CONSTRAINT "AffiliateClick_bonusId_fkey" FOREIGN KEY ("bonusId") REFERENCES "Bonus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "AffiliateClick_bonusId_idx" ON "AffiliateClick"("bonusId");
