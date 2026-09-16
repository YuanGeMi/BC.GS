import { PrismaClient } from "@prisma/client";

import {
  bonusTypeOptions,
  gameProviderOptions,
  paymentMethodOptions,
} from "./catalog-options";

export async function seedCatalogs(client: PrismaClient) {
  for (const option of paymentMethodOptions) {
    const row = await client.paymentMethod.upsert({
      where: { slug: option.slug },
      update: { sortOrder: option.sortOrder },
      create: { slug: option.slug, sortOrder: option.sortOrder },
      select: { id: true },
    });

    for (const [locale, name] of Object.entries(option.labels)) {
      await client.paymentMethodTranslation.upsert({
        where: {
          paymentMethodId_locale: { paymentMethodId: row.id, locale },
        },
        update: { name },
        create: { paymentMethodId: row.id, locale, name },
      });
    }
  }

  for (const option of gameProviderOptions) {
    const row = await client.gameProvider.upsert({
      where: { slug: option.slug },
      update: { sortOrder: option.sortOrder },
      create: { slug: option.slug, sortOrder: option.sortOrder },
      select: { id: true },
    });

    for (const [locale, name] of Object.entries(option.labels)) {
      await client.gameProviderTranslation.upsert({
        where: {
          gameProviderId_locale: { gameProviderId: row.id, locale },
        },
        update: { name },
        create: { gameProviderId: row.id, locale, name },
      });
    }
  }

  for (const option of bonusTypeOptions) {
    const row = await client.bonusType.upsert({
      where: { slug: option.slug },
      update: { sortOrder: option.sortOrder },
      create: { slug: option.slug, sortOrder: option.sortOrder },
      select: { id: true },
    });

    for (const [locale, name] of Object.entries(option.labels)) {
      await client.bonusTypeTranslation.upsert({
        where: { bonusTypeId_locale: { bonusTypeId: row.id, locale } },
        update: { name },
        create: { bonusTypeId: row.id, locale, name },
      });
    }
  }
}

export async function syncCasinoCatalogLinks(
  client: PrismaClient,
  casinoId: string,
  payments: string[],
  providers: string[],
) {
  const [paymentRows, providerRows] = await Promise.all([
    client.paymentMethod.findMany({
      where: { slug: { in: payments } },
      select: { id: true, slug: true },
    }),
    client.gameProvider.findMany({
      where: { slug: { in: providers } },
      select: { id: true, slug: true },
    }),
  ]);

  const paymentIdBySlug = new Map(paymentRows.map((row) => [row.slug, row.id]));
  const providerIdBySlug = new Map(
    providerRows.map((row) => [row.slug, row.id]),
  );

  await client.casinoPaymentMethod.deleteMany({ where: { casinoId } });
  await client.casinoGameProvider.deleteMany({ where: { casinoId } });

  if (payments.length > 0) {
    await client.casinoPaymentMethod.createMany({
      data: payments.flatMap((slug) => {
        const paymentMethodId = paymentIdBySlug.get(slug);
        return paymentMethodId ? [{ casinoId, paymentMethodId }] : [];
      }),
    });
  }

  if (providers.length > 0) {
    await client.casinoGameProvider.createMany({
      data: providers.flatMap((slug) => {
        const gameProviderId = providerIdBySlug.get(slug);
        return gameProviderId ? [{ casinoId, gameProviderId }] : [];
      }),
    });
  }
}
