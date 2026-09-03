import { PrismaClient } from "@prisma/client";

import { bestCategories } from "../data/best-categories";
import { legalDocuments, legalSlugs } from "../data/legal-content";
import { mockBonuses } from "../data/mock-bonuses";
import { toCasinoProfile } from "../data/casino-details";
import { localize, mockCasinos } from "../data/mock-casinos";
import {
  legalDocumentToMarkdown,
  STATIC_PAGE_LOCALES,
} from "./legal-to-markdown";
import {
  payoutSpeedOptions,
  payoutSpeedSlugByWithdrawalTime,
} from "./payout-speed-options";
import { seedCasinoLicenses, seedLicenseCatalog } from "./seed-licenses";
import { seedMarkets } from "./seed-markets";

const prisma = new PrismaClient();

function parseMinDeposit(value: string): number | null {
  const amount = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? amount : null;
}

async function main() {
  await seedMarkets(prisma);
  await seedLicenseCatalog(prisma);

  const payoutSpeedIdsBySlug = new Map<string, string>();

  for (const option of payoutSpeedOptions) {
    const row = await prisma.payoutSpeedOption.upsert({
      where: { slug: option.slug },
      update: { sortOrder: option.sortOrder },
      create: {
        slug: option.slug,
        sortOrder: option.sortOrder,
      },
      select: { id: true, slug: true },
    });

    payoutSpeedIdsBySlug.set(row.slug, row.id);

    for (const [locale, label] of Object.entries(option.labels)) {
      await prisma.payoutSpeedOptionTranslation.upsert({
        where: {
          optionId_locale: {
            optionId: row.id,
            locale,
          },
        },
        update: { label },
        create: {
          optionId: row.id,
          locale,
          label,
        },
      });
    }
  }

  for (const mock of mockCasinos) {
    const profile = toCasinoProfile(mock);
    const payoutSpeedSlug =
      payoutSpeedSlugByWithdrawalTime[profile.withdrawalTime.en];
    const payoutSpeedId = payoutSpeedSlug
      ? payoutSpeedIdsBySlug.get(payoutSpeedSlug)
      : undefined;

    const data = {
      slug: profile.slug,
      logoUrl: profile.logoUrl ?? null,
      establishedYear: profile.establishedYear,
      minDeposit: parseMinDeposit(profile.minDeposit.en),
      payoutSpeedId: payoutSpeedId ?? null,
      paymentMethods: profile.payments,
      gameProviders: profile.providers,
      overallRating: profile.rating,
      ratingBonuses: profile.scores.bonuses,
      ratingGames: profile.scores.gameVariety,
      ratingSupport: profile.scores.support,
      ratingPayout: profile.scores.payoutSpeed,
      ratingTrust: profile.scores.trust,
      affiliateLink: profile.affiliateUrl,
      status: "published",
    };

    const translation = {
      locale: "en",
      name: profile.name.en,
      reviewBody: profile.review.map((paragraph) => paragraph.en).join("\n\n"),
      pros: profile.pros.map((item) => item.en),
      cons: profile.cons.map((item) => item.en),
    };

    await prisma.casino.upsert({
      where: { slug: profile.slug },
      update: {
        ...data,
        translations: {
          deleteMany: { locale: "en" },
          create: [translation],
        },
      },
      create: {
        ...data,
        translations: {
          create: [translation],
        },
      },
    });
  }

  await seedCasinoLicenses(prisma);

  await prisma.bonus.deleteMany();

  let bonusesCreated = 0;
  let bonusesSkipped = 0;

  for (const mock of mockBonuses) {
    const casino = await prisma.casino.findUnique({
      where: { slug: mock.casinoSlug },
      select: { id: true },
    });

    if (!casino) {
      bonusesSkipped += 1;
      continue;
    }

    const terms = [mock.bonusValue.en, mock.wagering.en]
      .filter(Boolean)
      .join("\n\n");

    await prisma.bonus.create({
      data: {
        casinoId: casino.id,
        type: mock.type,
        amount: mock.bonusValue.en,
        wageringRequirement: mock.wagering.en,
        expiryDate: new Date(`${mock.expiresAt}T00:00:00.000Z`),
        status: "published",
        translations: {
          create: [
            {
              locale: "en",
              title: mock.title.en,
              terms,
            },
          ],
        },
      },
    });

    bonusesCreated += 1;
  }

  const categoryIdsBySlug = new Map<string, string>();

  for (const category of bestCategories) {
    const translation = {
      locale: "en",
      name: category.title.en,
      description: category.description.en,
      seoTitle: category.seoTitle.en,
      seoDescription: category.seoDescription.en,
      methodology: category.methodology.map((paragraph) => paragraph.en).join("\n\n") || null,
    };

    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        status: "published",
        translations: {
          deleteMany: { locale: "en" },
          create: [translation],
        },
      },
      create: {
        slug: category.slug,
        status: "published",
        translations: {
          create: [translation],
        },
      },
    });

    categoryIdsBySlug.set(category.slug, row.id);
  }

  await prisma.casinoCategory.deleteMany();

  let linksCreated = 0;
  let linksSkipped = 0;

  const casinosBySlug = Object.fromEntries(
    (
      await prisma.casino.findMany({
        select: { id: true, slug: true },
      })
    ).map((casino) => [casino.slug, casino.id]),
  );

  for (const category of bestCategories) {
    const categoryId = categoryIdsBySlug.get(category.slug);
    if (!categoryId) continue;

    for (const mock of mockCasinos.filter(category.matches)) {
      const casinoId = casinosBySlug[mock.slug];
      if (!casinoId) {
        linksSkipped += 1;
        continue;
      }

      await prisma.casinoCategory.create({
        data: { casinoId, categoryId },
      });
      linksCreated += 1;
    }
  }

  const casinoCount = await prisma.casino.count();
  const categoryCount = await prisma.category.count();
  const licenseCount = await prisma.license.count();
  const casinoLicenseCount = await prisma.casinoLicense.count();
  const marketCount = await prisma.market.count();
  const marketTranslationCount = await prisma.marketTranslation.count();
  const casinoMarketCount = await prisma.casinoMarket.count();

  for (const slug of legalSlugs) {
    const document = legalDocuments[slug];

    await prisma.staticPage.upsert({
      where: { slug },
      update: {
        status: "published",
        translations: {
          deleteMany: {},
          create: STATIC_PAGE_LOCALES.map((locale) => ({
            locale,
            title: localize(document.title, locale),
            content: legalDocumentToMarkdown(document, locale),
            seoTitle: localize(document.seoTitle, locale),
            seoDescription: localize(document.seoDescription, locale),
          })),
        },
      },
      create: {
        slug,
        status: "published",
        translations: {
          create: STATIC_PAGE_LOCALES.map((locale) => ({
            locale,
            title: localize(document.title, locale),
            content: legalDocumentToMarkdown(document, locale),
            seoTitle: localize(document.seoTitle, locale),
            seoDescription: localize(document.seoDescription, locale),
          })),
        },
      },
    });
  }

  const staticPageCount = await prisma.staticPage.count();
  console.log(
    `Seeded ${casinoCount} casinos, ${bonusesCreated} bonuses, ${categoryCount} categories, ${linksCreated} casino-category links, ${licenseCount} licenses, ${casinoLicenseCount} casino-license links, ${marketCount} markets, ${marketTranslationCount} market translations, ${casinoMarketCount} casino-market links, and ${staticPageCount} static pages (en/zh/th translations).`,
  );
  if (bonusesSkipped > 0) {
    console.log(`Skipped ${bonusesSkipped} bonuses with no matching casino.`);
  }
  if (linksSkipped > 0) {
    console.log(`Skipped ${linksSkipped} category links with no matching casino.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
