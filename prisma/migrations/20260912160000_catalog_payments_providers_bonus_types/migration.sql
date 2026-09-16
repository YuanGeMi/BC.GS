-- Catalog tables for payment methods, game providers, and bonus types.

CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentMethodTranslation" (
    "id" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PaymentMethodTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CasinoPaymentMethod" (
    "casinoId" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,

    CONSTRAINT "CasinoPaymentMethod_pkey" PRIMARY KEY ("casinoId","paymentMethodId")
);

CREATE TABLE "GameProvider" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GameProvider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GameProviderTranslation" (
    "id" TEXT NOT NULL,
    "gameProviderId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GameProviderTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CasinoGameProvider" (
    "casinoId" TEXT NOT NULL,
    "gameProviderId" TEXT NOT NULL,

    CONSTRAINT "CasinoGameProvider_pkey" PRIMARY KEY ("casinoId","gameProviderId")
);

CREATE TABLE "BonusType" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BonusType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BonusTypeTranslation" (
    "id" TEXT NOT NULL,
    "bonusTypeId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BonusTypeTranslation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentMethod_slug_key" ON "PaymentMethod"("slug");
CREATE UNIQUE INDEX "PaymentMethodTranslation_paymentMethodId_locale_key" ON "PaymentMethodTranslation"("paymentMethodId", "locale");
CREATE UNIQUE INDEX "GameProvider_slug_key" ON "GameProvider"("slug");
CREATE UNIQUE INDEX "GameProviderTranslation_gameProviderId_locale_key" ON "GameProviderTranslation"("gameProviderId", "locale");
CREATE UNIQUE INDEX "BonusType_slug_key" ON "BonusType"("slug");
CREATE UNIQUE INDEX "BonusTypeTranslation_bonusTypeId_locale_key" ON "BonusTypeTranslation"("bonusTypeId", "locale");

ALTER TABLE "PaymentMethodTranslation" ADD CONSTRAINT "PaymentMethodTranslation_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CasinoPaymentMethod" ADD CONSTRAINT "CasinoPaymentMethod_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES "Casino"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CasinoPaymentMethod" ADD CONSTRAINT "CasinoPaymentMethod_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GameProviderTranslation" ADD CONSTRAINT "GameProviderTranslation_gameProviderId_fkey" FOREIGN KEY ("gameProviderId") REFERENCES "GameProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CasinoGameProvider" ADD CONSTRAINT "CasinoGameProvider_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES "Casino"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CasinoGameProvider" ADD CONSTRAINT "CasinoGameProvider_gameProviderId_fkey" FOREIGN KEY ("gameProviderId") REFERENCES "GameProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BonusTypeTranslation" ADD CONSTRAINT "BonusTypeTranslation_bonusTypeId_fkey" FOREIGN KEY ("bonusTypeId") REFERENCES "BonusType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed known catalog rows (ids are random; slugs are stable).
INSERT INTO "PaymentMethod" ("id", "slug", "sortOrder") VALUES
  (gen_random_uuid()::text, 'crypto', 10),
  (gen_random_uuid()::text, 'visa', 20),
  (gen_random_uuid()::text, 'paypal', 30),
  (gen_random_uuid()::text, 'bank', 40);

INSERT INTO "PaymentMethodTranslation" ("id", "paymentMethodId", "locale", "name")
SELECT gen_random_uuid()::text, p.id, v.locale, v.name
FROM "PaymentMethod" p
JOIN (VALUES
  ('crypto', 'en', 'Crypto'),
  ('crypto', 'zh', '加密货币'),
  ('crypto', 'th', 'คริปโต'),
  ('visa', 'en', 'Visa / Mastercard'),
  ('visa', 'zh', 'Visa / Mastercard'),
  ('visa', 'th', 'Visa / Mastercard'),
  ('paypal', 'en', 'PayPal'),
  ('paypal', 'zh', 'PayPal'),
  ('paypal', 'th', 'PayPal'),
  ('bank', 'en', 'Bank transfer'),
  ('bank', 'zh', '银行转账'),
  ('bank', 'th', 'โอนธนาคาร')
) AS v(slug, locale, name) ON v.slug = p.slug;

INSERT INTO "GameProvider" ("id", "slug", "sortOrder") VALUES
  (gen_random_uuid()::text, 'evolution', 10),
  (gen_random_uuid()::text, 'pragmatic', 20),
  (gen_random_uuid()::text, 'netent', 30),
  (gen_random_uuid()::text, 'playngo', 40),
  (gen_random_uuid()::text, 'hacksaw', 50);

INSERT INTO "GameProviderTranslation" ("id", "gameProviderId", "locale", "name")
SELECT gen_random_uuid()::text, p.id, v.locale, v.name
FROM "GameProvider" p
JOIN (VALUES
  ('evolution', 'en', 'Evolution'),
  ('evolution', 'zh', 'Evolution'),
  ('evolution', 'th', 'Evolution'),
  ('pragmatic', 'en', 'Pragmatic Play'),
  ('pragmatic', 'zh', 'Pragmatic Play'),
  ('pragmatic', 'th', 'Pragmatic Play'),
  ('netent', 'en', 'NetEnt'),
  ('netent', 'zh', 'NetEnt'),
  ('netent', 'th', 'NetEnt'),
  ('playngo', 'en', 'Play’n GO'),
  ('playngo', 'zh', 'Play’n GO'),
  ('playngo', 'th', 'Play’n GO'),
  ('hacksaw', 'en', 'Hacksaw'),
  ('hacksaw', 'zh', 'Hacksaw'),
  ('hacksaw', 'th', 'Hacksaw')
) AS v(slug, locale, name) ON v.slug = p.slug;

INSERT INTO "BonusType" ("id", "slug", "sortOrder") VALUES
  (gen_random_uuid()::text, 'welcome', 10),
  (gen_random_uuid()::text, 'no-deposit', 20),
  (gen_random_uuid()::text, 'free-spins', 30),
  (gen_random_uuid()::text, 'reload', 40),
  (gen_random_uuid()::text, 'cashback', 50);

INSERT INTO "BonusTypeTranslation" ("id", "bonusTypeId", "locale", "name")
SELECT gen_random_uuid()::text, p.id, v.locale, v.name
FROM "BonusType" p
JOIN (VALUES
  ('welcome', 'en', 'Welcome bonus'),
  ('welcome', 'zh', '迎新优惠'),
  ('welcome', 'th', 'โบนัสต้อนรับ'),
  ('no-deposit', 'en', 'No deposit'),
  ('no-deposit', 'zh', '无需存款'),
  ('no-deposit', 'th', 'ไม่ต้องฝาก'),
  ('free-spins', 'en', 'Free spins'),
  ('free-spins', 'zh', '免费旋转'),
  ('free-spins', 'th', 'ฟรีสปิน'),
  ('reload', 'en', 'Reload'),
  ('reload', 'zh', '再存优惠'),
  ('reload', 'th', 'โบนัสเติม'),
  ('cashback', 'en', 'Cashback'),
  ('cashback', 'zh', '返水'),
  ('cashback', 'th', 'แคชแบ็ก')
) AS v(slug, locale, name) ON v.slug = p.slug;

-- Promote any leftover slugs that are already stored on casinos/bonuses.
INSERT INTO "PaymentMethod" ("id", "slug", "sortOrder")
SELECT gen_random_uuid()::text, extra.slug, 1000
FROM (
  SELECT DISTINCT trim(both FROM unnest("paymentMethods")) AS slug
  FROM "Casino"
) extra
WHERE extra.slug <> ''
  AND NOT EXISTS (SELECT 1 FROM "PaymentMethod" p WHERE p.slug = extra.slug);

INSERT INTO "PaymentMethodTranslation" ("id", "paymentMethodId", "locale", "name")
SELECT gen_random_uuid()::text, p.id, loc.locale, p.slug
FROM "PaymentMethod" p
CROSS JOIN (VALUES ('en'), ('zh'), ('th')) AS loc(locale)
WHERE NOT EXISTS (
  SELECT 1 FROM "PaymentMethodTranslation" t
  WHERE t."paymentMethodId" = p.id AND t.locale = loc.locale
);

INSERT INTO "GameProvider" ("id", "slug", "sortOrder")
SELECT gen_random_uuid()::text, extra.slug, 1000
FROM (
  SELECT DISTINCT trim(both FROM unnest("gameProviders")) AS slug
  FROM "Casino"
) extra
WHERE extra.slug <> ''
  AND NOT EXISTS (SELECT 1 FROM "GameProvider" p WHERE p.slug = extra.slug);

INSERT INTO "GameProviderTranslation" ("id", "gameProviderId", "locale", "name")
SELECT gen_random_uuid()::text, p.id, loc.locale, p.slug
FROM "GameProvider" p
CROSS JOIN (VALUES ('en'), ('zh'), ('th')) AS loc(locale)
WHERE NOT EXISTS (
  SELECT 1 FROM "GameProviderTranslation" t
  WHERE t."gameProviderId" = p.id AND t.locale = loc.locale
);

INSERT INTO "CasinoPaymentMethod" ("casinoId", "paymentMethodId")
SELECT DISTINCT c.id, p.id
FROM "Casino" c
CROSS JOIN LATERAL unnest(c."paymentMethods") AS methods(slug)
JOIN "PaymentMethod" p ON p.slug = methods.slug;

INSERT INTO "CasinoGameProvider" ("casinoId", "gameProviderId")
SELECT DISTINCT c.id, p.id
FROM "Casino" c
CROSS JOIN LATERAL unnest(c."gameProviders") AS providers(slug)
JOIN "GameProvider" p ON p.slug = providers.slug;

INSERT INTO "BonusType" ("id", "slug", "sortOrder")
SELECT gen_random_uuid()::text, extra.slug, 1000
FROM (
  SELECT DISTINCT trim(both FROM "type") AS slug
  FROM "Bonus"
) extra
WHERE extra.slug <> ''
  AND NOT EXISTS (SELECT 1 FROM "BonusType" t WHERE t.slug = extra.slug);

INSERT INTO "BonusTypeTranslation" ("id", "bonusTypeId", "locale", "name")
SELECT gen_random_uuid()::text, p.id, loc.locale, p.slug
FROM "BonusType" p
CROSS JOIN (VALUES ('en'), ('zh'), ('th')) AS loc(locale)
WHERE NOT EXISTS (
  SELECT 1 FROM "BonusTypeTranslation" t
  WHERE t."bonusTypeId" = p.id AND t.locale = loc.locale
);

ALTER TABLE "Bonus" ADD COLUMN "typeId" TEXT;

UPDATE "Bonus" b
SET "typeId" = t.id
FROM "BonusType" t
WHERE t.slug = b."type";

ALTER TABLE "Bonus" ALTER COLUMN "typeId" SET NOT NULL;
ALTER TABLE "Bonus" DROP COLUMN "type";
ALTER TABLE "Bonus" ADD CONSTRAINT "Bonus_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "BonusType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Casino" DROP COLUMN "paymentMethods";
ALTER TABLE "Casino" DROP COLUMN "gameProviders";
