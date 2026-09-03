import type { CasinoMarket, Market, MarketTranslation } from "@prisma/client";

import { prisma } from "@/lib/prisma";

function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
): T | undefined {
  return (
    translations.find((item) => item.locale === locale) ??
    translations.find((item) => item.locale === "en")
  );
}

export type CasinoMarketAvailability = {
  code: string;
  name: string;
  status: string;
  affiliateLink: string | null;
};

export async function getMarketsForCasino(
  casinoId: string,
  locale = "en",
): Promise<CasinoMarketAvailability[]> {
  const rows = await prisma.casinoMarket.findMany({
    where: { casinoId },
    include: {
      market: {
        include: { translations: true },
      },
    },
    orderBy: { market: { code: "asc" } },
  });

  return rows.flatMap(
    (
      row: CasinoMarket & {
        market: Market & { translations: MarketTranslation[] };
      },
    ) => {
      const translation = pickTranslation(row.market.translations, locale);
      if (!translation) return [];

      return [
        {
          code: row.market.code,
          name: translation.name,
          status: row.status,
          affiliateLink: row.affiliateLink,
        },
      ];
    },
  );
}
