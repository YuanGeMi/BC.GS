import { PrismaClient } from "@prisma/client";

import { payoutSpeedOptions } from "./payout-speed-options";

const prisma = new PrismaClient();

async function seedPayoutSpeedOptions() {
  const optionIdsBySlug = new Map<string, string>();
  let optionRows = 0;
  let translationRows = 0;

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

    optionIdsBySlug.set(row.slug, row.id);
    optionRows += 1;

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

      translationRows += 1;
    }
  }

  return { optionIdsBySlug, optionRows, translationRows };
}

async function main() {
  const { optionIdsBySlug, optionRows, translationRows } =
    await seedPayoutSpeedOptions();

  let casinoRows = 0;
  const skipped: string[] = [];

  const casinos = await prisma.casino.findMany({
    select: {
      id: true,
      slug: true,
    },
  });

  const casinoMappings: Record<string, string> = {
    "arcadia-play": "1-2-days",
    "atlas-table": "1-2-days",
    "aurelia-club": "same-day",
    "cinder-park": "1-2-days",
    "harbor-line": "12-24-hours",
    "lumen-bet": "24-48-hours",
    "meridian-house": "same-day",
    northline: "12-24-hours",
    "nova-prime": "under-2-hours",
    "opal-desk": "under-1-hour",
    "quartz-bet": "1-2-days",
    "ridge-play": "12-24-hours",
    "sable-room": "same-day",
    "velvet-odds": "under-6-hours",
  };

  for (const casino of casinos) {
    const optionSlug = casinoMappings[casino.slug];
    if (!optionSlug) {
      skipped.push(casino.slug);
      continue;
    }

    const payoutSpeedId = optionIdsBySlug.get(optionSlug);
    if (!payoutSpeedId) {
      skipped.push(`${casino.slug} -> ${optionSlug}`);
      continue;
    }

    await prisma.casino.update({
      where: { id: casino.id },
      data: { payoutSpeedId },
    });

    casinoRows += 1;
  }

  console.log(
    `Seeded ${optionRows} payout speed options, ${translationRows} translations, and assigned ${casinoRows} casinos.`,
  );

  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} unmatched payout speed rows:`);
    for (const item of skipped) {
      console.log(`- ${item}`);
    }
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
