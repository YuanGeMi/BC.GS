import { PrismaClient } from "@prisma/client";
import countries from "world-countries";

const prisma = new PrismaClient();

export async function seedMarkets(client: PrismaClient = prisma) {
  const countryCodes = countries
    .map((country) => country.cca2)
    .filter((code): code is string => Boolean(code));

  // Upsert-by-code via createMany (safe to re-run).
  await client.market.createMany({
    data: countryCodes.map((code) => ({ code })),
    skipDuplicates: true,
  });

  // Admin is English-only — drop any leftover zh/th country labels.
  await client.marketTranslation.deleteMany({
    where: { locale: { not: "en" } },
  });

  const marketRows = await client.market.findMany({
    where: { code: { in: countryCodes } },
    select: { id: true, code: true },
  });
  const marketIdByCode = new Map(marketRows.map((row) => [row.code, row.id]));

  const translationRows = countries
    .filter((country) => Boolean(country.cca2))
    .flatMap((country) => {
      const marketId = marketIdByCode.get(country.cca2);
      if (!marketId) return [];
      return [
        {
          marketId,
          locale: "en",
          name: country.name.common,
        },
      ];
    });

  // skipDuplicates keeps existing en rows intact on re-run.
  await client.marketTranslation.createMany({
    data: translationRows,
    skipDuplicates: true,
  });
}

async function main() {
  await seedMarkets();

  const marketCount = await prisma.market.count();
  const translationCount = await prisma.marketTranslation.count();
  const nonEnCount = await prisma.marketTranslation.count({
    where: { locale: { not: "en" } },
  });
  const casinoMarketCount = await prisma.casinoMarket.count();

  console.log(
    `Seeded markets: ${marketCount} markets, ${translationCount} translations (${nonEnCount} non-en), ${casinoMarketCount} casino-market links.`,
  );
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  process.argv[1].includes("seed-markets");

if (isDirectRun) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
