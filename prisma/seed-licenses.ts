import { PrismaClient } from "@prisma/client";

import { mockCasinos } from "../data/mock-casinos";
import { licenseOptions } from "./license-options";

export async function seedLicenseCatalog(client: PrismaClient) {
  for (const option of licenseOptions) {
    const row = await client.license.upsert({
      where: { slug: option.slug },
      update: {},
      create: { slug: option.slug },
      select: { id: true },
    });

    await client.licenseTranslation.upsert({
      where: {
        licenseId_locale: {
          licenseId: row.id,
          locale: "en",
        },
      },
      update: { name: option.name },
      create: {
        licenseId: row.id,
        locale: "en",
        name: option.name,
      },
    });
  }
}

export async function seedCasinoLicenses(client: PrismaClient) {
  const licenseRows = await client.license.findMany({
    select: { id: true, slug: true },
  });
  const licenseIdsBySlug = new Map(
    licenseRows.map((row) => [row.slug, row.id]),
  );

  for (const mock of mockCasinos) {
    const casino = await client.casino.findUnique({
      where: { slug: mock.slug },
      select: { id: true },
    });

    if (!casino) continue;

    await client.casinoLicense.deleteMany({
      where: { casinoId: casino.id },
    });

    for (const slug of mock.licenses) {
      const licenseId = licenseIdsBySlug.get(slug);
      if (!licenseId) continue;

      await client.casinoLicense.create({
        data: {
          casinoId: casino.id,
          licenseId,
          verified: false,
        },
      });
    }
  }
}

export async function seedLicenses(client: PrismaClient) {
  await seedLicenseCatalog(client);
  await seedCasinoLicenses(client);
}
