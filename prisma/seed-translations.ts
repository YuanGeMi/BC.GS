import { PrismaClient } from "@prisma/client";

import { bestCategories } from "../data/best-categories";
import { mockBonuses } from "../data/mock-bonuses";
import { toCasinoProfile } from "../data/casino-details";
import { localize, mockCasinos, type LocalizedText } from "../data/mock-casinos";

const prisma = new PrismaClient();

const LOCALES = ["zh", "th"] as const;

type SeedLocale = (typeof LOCALES)[number];

function pick(text: LocalizedText, locale: SeedLocale): string {
  return localize(text, locale);
}

function joinParagraphs(items: LocalizedText[], locale: SeedLocale): string {
  return items.map((item) => pick(item, locale)).join("\n\n");
}

function bonusTerms(mock: (typeof mockBonuses)[number], locale: SeedLocale): string {
  return [pick(mock.bonusValue, locale), pick(mock.wagering, locale)]
    .filter(Boolean)
    .join("\n\n");
}

async function upsertCasinoTranslation(
  casinoId: string,
  locale: SeedLocale,
  data: {
    name: string;
    reviewBody: string;
    pros: string[];
    cons: string[];
    seoTitle?: string | null;
    seoDescription?: string | null;
  },
) {
  await prisma.casinoTranslation.deleteMany({
    where: { casinoId, locale },
  });

  await prisma.casinoTranslation.create({
    data: {
      casinoId,
      locale,
      name: data.name,
      reviewBody: data.reviewBody,
      pros: data.pros,
      cons: data.cons,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
    },
  });
}

async function upsertBonusTranslation(
  bonusId: string,
  locale: SeedLocale,
  data: { title: string; terms: string },
) {
  await prisma.bonusTranslation.deleteMany({
    where: { bonusId, locale },
  });

  await prisma.bonusTranslation.create({
    data: {
      bonusId,
      locale,
      title: data.title,
      terms: data.terms,
    },
  });
}

async function upsertCategoryTranslation(
  categoryId: string,
  locale: SeedLocale,
  data: {
    name: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    methodology: string | null;
  },
) {
  await prisma.categoryTranslation.deleteMany({
    where: { categoryId, locale },
  });

  await prisma.categoryTranslation.create({
    data: {
      categoryId,
      locale,
      name: data.name,
      description: data.description,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      methodology: data.methodology,
    },
  });
}

async function main() {
  let casinoRows = 0;
  let bonusRows = 0;
  let categoryRows = 0;
  let bonusesSkipped = 0;

  for (const mock of mockCasinos) {
    const profile = toCasinoProfile(mock);
    const casino = await prisma.casino.findUnique({
      where: { slug: profile.slug },
      select: { id: true },
    });

    if (!casino) continue;

    for (const locale of LOCALES) {
      await upsertCasinoTranslation(casino.id, locale, {
        name: pick(profile.name, locale),
        reviewBody: joinParagraphs(profile.review, locale),
        pros: profile.pros.map((item) => pick(item, locale)),
        cons: profile.cons.map((item) => pick(item, locale)),
      });
      casinoRows += 1;
    }
  }

  for (const mock of mockBonuses) {
    const bonus = await prisma.bonus.findFirst({
      where: {
        type: mock.type,
        amount: mock.bonusValue.en,
        casino: { slug: mock.casinoSlug },
      },
      select: { id: true },
    });

    if (!bonus) {
      bonusesSkipped += 1;
      continue;
    }

    for (const locale of LOCALES) {
      await upsertBonusTranslation(bonus.id, locale, {
        title: pick(mock.title, locale),
        terms: bonusTerms(mock, locale),
      });
      bonusRows += 1;
    }
  }

  for (const category of bestCategories) {
    const row = await prisma.category.findUnique({
      where: { slug: category.slug },
      select: { id: true },
    });

    if (!row) continue;

    for (const locale of LOCALES) {
      await upsertCategoryTranslation(row.id, locale, {
        name: pick(category.title, locale),
        description: pick(category.description, locale),
        seoTitle: pick(category.seoTitle, locale),
        seoDescription: pick(category.seoDescription, locale),
        methodology:
          joinParagraphs(category.methodology, locale) || null,
      });
      categoryRows += 1;
    }
  }

  console.log(
    `Seeded ${casinoRows} casino, ${bonusRows} bonus, and ${categoryRows} category translations (zh + th).`,
  );

  if (bonusesSkipped > 0) {
    console.log(`Skipped ${bonusesSkipped} bonuses with no matching row in the database.`);
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
