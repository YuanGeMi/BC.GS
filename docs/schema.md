# BC.GS Database Schema

PostgreSQL via Prisma 5.22. Runtime queries use `DATABASE_URL` (Transaction pooler); migrations use `DIRECT_URL` (direct connection).

Locales: `en`, `zh`, `th` on all translation tables.

## Entity overview

```
Casino ──┬── CasinoTranslation
         ├── Bonus ── BonusTranslation
         ├── CasinoCategory ── Category ── CategoryTranslation
         ├── AffiliateClick
         └── PayoutSpeedOption ── PayoutSpeedOptionTranslation

StaticPage ── StaticPageTranslation
```

---

## Casino

Published operator reviews. Directory and detail pages read from here.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | CUID, PK |
| `slug` | `String` | Unique URL slug |
| `logoUrl` | `String?` | |
| `license` | `String?` | Comma-separated license ids |
| `establishedYear` | `Int?` | |
| `minDeposit` | `Float?` | |
| `payoutSpeedId` | `String?` | FK → `PayoutSpeedOption` |
| `paymentMethods` | `String[]` | e.g. crypto, visa |
| `gameProviders` | `String[]` | e.g. evolution, netent |
| `overallRating` | `Float?` | |
| `ratingBonuses` | `Float?` | Score breakdown |
| `ratingGames` | `Float?` | |
| `ratingSupport` | `Float?` | |
| `ratingPayout` | `Float?` | |
| `ratingTrust` | `Float?` | |
| `affiliateLink` | `String?` | Outbound visit URL |
| `status` | `String` | `draft` \| `published` (default: `draft`) |
| `createdAt` | `DateTime` | |
| `updatedAt` | `DateTime` | |

**Relations:** `translations`, `bonuses`, `categories`, `affiliateClicks`, `payoutSpeed`

---

## CasinoTranslation

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | CUID, PK |
| `casinoId` | `String` | FK → `Casino` (cascade delete) |
| `locale` | `String` | `en` \| `zh` \| `th` |
| `name` | `String` | Display name |
| `reviewBody` | `Text` | Full review (paragraphs joined with `\n\n`) |
| `pros` | `String[]` | |
| `cons` | `String[]` | |
| `seoTitle` | `String?` | |
| `seoDescription` | `String?` | |

**Unique:** `[casinoId, locale]`

---

## PayoutSpeedOption

Lookup table for withdrawal speed labels.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | CUID, PK |
| `slug` | `String` | Unique |
| `sortOrder` | `Int` | Default `0` |

**Relations:** `translations`, `casinos`

---

## PayoutSpeedOptionTranslation

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | CUID, PK |
| `optionId` | `String` | FK → `PayoutSpeedOption` |
| `locale` | `String` | |
| `label` | `String` | Localized display label |

**Unique:** `[optionId, locale]`

---

## Bonus

Offers tied to a casino.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | CUID, PK |
| `casinoId` | `String` | FK → `Casino` |
| `type` | `String` | `welcome` \| `no-deposit` \| `free-spins` \| `reload` \| `cashback` |
| `amount` | `String?` | e.g. `$500`, `50 free spins` |
| `wageringRequirement` | `String?` | |
| `minDeposit` | `Float?` | |
| `code` | `String?` | Promo code |
| `expiryDate` | `DateTime?` | |
| `status` | `String` | `draft` \| `published` |
| `createdAt` | `DateTime` | |
| `updatedAt` | `DateTime` | |

**Relations:** `translations`, `casino`

---

## BonusTranslation

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | CUID, PK |
| `bonusId` | `String` | FK → `Bonus` |
| `locale` | `String` | |
| `title` | `String` | |
| `terms` | `Text` | Full terms copy |

**Unique:** `[bonusId, locale]`

---

## Category

Best-of list definitions (e.g. crypto-casinos, fast-payouts).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | CUID, PK |
| `slug` | `String` | Unique |
| `status` | `String` | `draft` \| `published` |
| `createdAt` | `DateTime` | |
| `updatedAt` | `DateTime` | |

**Relations:** `translations`, `casinos` (via `CasinoCategory`)

---

## CategoryTranslation

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | CUID, PK |
| `categoryId` | `String` | FK → `Category` |
| `locale` | `String` | |
| `name` | `String` | List title |
| `description` | `Text?` | |
| `seoTitle` | `String?` | |
| `seoDescription` | `String?` | |
| `methodology` | `Text?` | How the list is ranked |

**Unique:** `[categoryId, locale]`

---

## CasinoCategory

Many-to-many join: which casinos appear on which best-of lists.

| Field | Type | Notes |
|-------|------|-------|
| `casinoId` | `String` | FK → `Casino` |
| `categoryId` | `String` | FK → `Category` |

**Primary key:** `[casinoId, categoryId]`

---

## AffiliateClick

Fire-and-forget tracking when users click visit/claim CTAs.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | CUID, PK |
| `casinoId` | `String` | FK → `Casino` |
| `bonusId` | `String?` | Optional bonus context |
| `locale` | `String` | Page locale |
| `referrer` | `String?` | |
| `createdAt` | `DateTime` | |

---

## StaticPage

Admin-editable legal/editorial pages (Privacy, Terms, Responsible Gambling).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | CUID, PK |
| `slug` | `String` | Unique: `privacy` \| `terms` \| `responsible-gambling` |
| `status` | `String` | `draft` \| `published` |
| `createdAt` | `DateTime` | |
| `updatedAt` | `DateTime` | Used for “last updated” on legal pages |

**Relations:** `translations`

---

## StaticPageTranslation

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | CUID, PK |
| `pageId` | `String` | FK → `StaticPage` |
| `locale` | `String` | |
| `title` | `String` | Page H1 |
| `content` | `Text` | Markdown body |
| `seoTitle` | `String?` | |
| `seoDescription` | `String?` | |

**Unique:** `[pageId, locale]`

---

## Prisma source

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Casino {
  id              String              @id @default(cuid())
  slug            String              @unique
  logoUrl         String?
  license         String?
  establishedYear Int?
  minDeposit      Float?
  payoutSpeedId   String?
  payoutSpeed     PayoutSpeedOption?  @relation(fields: [payoutSpeedId], references: [id], onDelete: SetNull)
  paymentMethods  String[]
  gameProviders   String[]
  overallRating   Float?
  ratingBonuses   Float?
  ratingGames     Float?
  ratingSupport   Float?
  ratingPayout    Float?
  ratingTrust     Float?
  affiliateLink   String?
  status          String              @default("draft")
  translations    CasinoTranslation[]
  bonuses         Bonus[]
  categories      CasinoCategory[]
  affiliateClicks AffiliateClick[]
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
}

model PayoutSpeedOption {
  id           String                         @id @default(cuid())
  slug         String                         @unique
  sortOrder    Int                            @default(0)
  translations PayoutSpeedOptionTranslation[]
  casinos      Casino[]
}

model PayoutSpeedOptionTranslation {
  id       String            @id @default(cuid())
  optionId String
  option   PayoutSpeedOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  locale   String
  label    String

  @@unique([optionId, locale])
}

model CasinoTranslation {
  id             String   @id @default(cuid())
  casinoId       String
  casino         Casino   @relation(fields: [casinoId], references: [id], onDelete: Cascade)
  locale         String
  name           String
  reviewBody     String   @db.Text
  pros           String[]
  cons           String[]
  seoTitle       String?
  seoDescription String?

  @@unique([casinoId, locale])
}

model Bonus {
  id                  String             @id @default(cuid())
  casinoId            String
  casino              Casino             @relation(fields: [casinoId], references: [id], onDelete: Cascade)
  type                String
  amount              String?
  wageringRequirement String?
  minDeposit          Float?
  code                String?
  expiryDate          DateTime?
  status              String             @default("draft")
  translations        BonusTranslation[]
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
}

model BonusTranslation {
  id      String @id @default(cuid())
  bonusId String
  bonus   Bonus  @relation(fields: [bonusId], references: [id], onDelete: Cascade)
  locale  String
  title   String
  terms   String @db.Text

  @@unique([bonusId, locale])
}

model Category {
  id           String                @id @default(cuid())
  slug         String                @unique
  status       String                @default("draft")
  translations CategoryTranslation[]
  casinos      CasinoCategory[]
  createdAt    DateTime              @default(now())
  updatedAt    DateTime              @updatedAt
}

model CategoryTranslation {
  id             String   @id @default(cuid())
  categoryId     String
  category       Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  locale         String
  name           String
  description    String?  @db.Text
  seoTitle       String?
  seoDescription String?
  methodology    String?  @db.Text

  @@unique([categoryId, locale])
}

model CasinoCategory {
  casinoId   String
  casino     Casino   @relation(fields: [casinoId], references: [id], onDelete: Cascade)
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([casinoId, categoryId])
}

model AffiliateClick {
  id        String   @id @default(cuid())
  casinoId  String
  casino    Casino   @relation(fields: [casinoId], references: [id], onDelete: Cascade)
  bonusId   String?
  locale    String
  referrer  String?
  createdAt DateTime @default(now())
}

model StaticPage {
  id           String                  @id @default(cuid())
  slug         String                  @unique
  status       String                  @default("draft")
  translations StaticPageTranslation[]
  createdAt    DateTime                @default(now())
  updatedAt    DateTime                @updatedAt
}

model StaticPageTranslation {
  id             String     @id @default(cuid())
  pageId         String
  page           StaticPage @relation(fields: [pageId], references: [id], onDelete: Cascade)
  locale         String
  title          String
  content        String     @db.Text
  seoTitle       String?
  seoDescription String?

  @@unique([pageId, locale])
}
```
