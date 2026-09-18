-- Admin list/report filters (Desk performance)
CREATE INDEX IF NOT EXISTS "Casino_status_idx" ON "Casino"("status");
CREATE INDEX IF NOT EXISTS "Casino_updatedAt_idx" ON "Casino"("updatedAt");
CREATE INDEX IF NOT EXISTS "UserReview_status_createdAt_idx" ON "UserReview"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "UserReview_casinoId_createdAt_idx" ON "UserReview"("casinoId", "createdAt");
CREATE INDEX IF NOT EXISTS "AffiliateClick_createdAt_idx" ON "AffiliateClick"("createdAt");
CREATE INDEX IF NOT EXISTS "AffiliateClick_casinoId_createdAt_idx" ON "AffiliateClick"("casinoId", "createdAt");
CREATE INDEX IF NOT EXISTS "AffiliateClick_locale_createdAt_idx" ON "AffiliateClick"("locale", "createdAt");
