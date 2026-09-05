import { randomUUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PEOPLE = [
  "Vitor Lopes",
  "Amelia Chen",
  "Kenji Watanabe",
  "Sofia Rahman",
  "Luca Bianchi",
  "Maya Okonkwo",
  "Jonas Berg",
  "Priya Nair",
  "Hugo Moreau",
  "Elena Popov",
  "Daniel Cho",
  "Isla MacLeod",
  "Mateo Silva",
  "Nora Lindqvist",
  "Arjun Patel",
  "Camille Dubois",
  "Theo Andersson",
  "Hana Suzuki",
  "Omar Haddad",
  "Leah Cohen",
  "Felix Bauer",
  "Yara Santos",
  "Nikolai Petrov",
  "Mei Lin",
  "Owen Gallagher",
  "Sienna Walsh",
  "Rafael Costa",
  "Anika Sharma",
  "Pierre Laurent",
  "Tara Nguyen",
  "Marcus Hale",
  "Lina Kowalski",
  "Diego Alvarez",
  "Freya Olsen",
  "Wei Zhang",
  "Clara Mendes",
  "Samir Khan",
  "Ines Rossi",
  "Patrick Doyle",
  "Aisha Bekele",
];

const BODIES = [
  "Clean cashier and the tables felt properly staffed. Withdrawal landed the same day.",
  "Lobby is quiet, which I like, but live dealer wait times crept up after midnight.",
  "Support actually answered in a few minutes. Rare enough to mention.",
  "Bonus terms were clearer than most. Still read the wagering twice.",
  "Mobile play was smooth. The cashier on iOS is better than the desktop one.",
  "Payout took two days, not the “instant” copy on the homepage. Fine, just honest.",
  "Game selection is grown-up. Fewer gimmicks, more tables I actually use.",
  "Verification was fussy but fair. After that, cashouts were uneventful.",
  "Would send a friend who wants a serious product, not a carnival lobby.",
  "Limits are sensible. I never felt pushed into a reload offer.",
];

function slugEmail(name: string, index: number) {
  const local = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, ".");
  return `seed.${local}.${index}@example.test`;
}

async function main() {
  const casinos = await prisma.casino.findMany({
    where: { status: "published" },
    select: { id: true, slug: true },
    orderBy: { slug: "asc" },
  });

  if (casinos.length === 0) {
    throw new Error("No published casinos. Seed casinos first.");
  }

  const users = [];

  for (const [index, displayName] of PEOPLE.entries()) {
    const email = slugEmail(displayName, index);
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, displayName: true, email: true },
    });

    if (existing) {
      users.push(existing);
      continue;
    }

    const created = await prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        displayName,
        role: "user",
      },
      select: { id: true, displayName: true, email: true },
    });
    users.push(created);
  }

  const reviewRows = [];

  for (const [casinoIndex, casino] of casinos.entries()) {
    if (casinoIndex % 4 === 3) continue;

    const count = 8 + ((casinoIndex * 5) % 13);
    const start = (casinoIndex * 7) % users.length;

    for (let n = 0; n < count; n += 1) {
      const user = users[(start + n) % users.length];
      reviewRows.push({
        userId: user.id,
        casinoId: casino.id,
        rating: 3 + ((n + casinoIndex) % 3),
        body: BODIES[(n + casinoIndex) % BODIES.length],
        status: "published",
        createdAt: new Date(Date.now() - (count - n) * 36e5 * 6),
      });
    }
  }

  const created = await prisma.userReview.createMany({
    data: reviewRows,
    skipDuplicates: true,
  });

  const perCasino = await prisma.userReview.groupBy({
    by: ["casinoId"],
    where: { status: "published" },
    _count: { _all: true },
  });
  const countById = new Map(
    perCasino.map((row) => [row.casinoId, row._count._all]),
  );

  console.log(`Users: ${users.length}. New reviews this run: ${created.count}.`);
  for (const casino of casinos) {
    const count = countById.get(casino.id) ?? 0;
    if (count > 0) console.log(`  ${casino.slug}: ${count}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
