-- Keep passwordHash for any leftover rows, but allow Auth-only profiles.
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
