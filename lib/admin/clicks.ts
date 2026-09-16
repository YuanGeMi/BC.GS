"use server";

import { Prisma } from "@prisma/client";

import { requireAdmin } from "@/lib/auth/require-admin";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";

export type ClickCasinoOption = {
  id: string;
  label: string;
};

export type ClickBonusRow = {
  bonusId: string | null;
  title: string;
  clicks: number;
};

export type ClickCasinoRow = {
  casinoId: string;
  name: string;
  clicks: number;
  bonuses: ClickBonusRow[];
};

export type ClickLocaleRow = {
  locale: string;
  clicks: number;
};

export type ClickDayRow = {
  date: string;
  clicks: number;
};

export type AffiliateClickReport = {
  from: string;
  to: string;
  total: number;
  casinos: ClickCasinoRow[];
  locales: ClickLocaleRow[];
  days: ClickDayRow[];
};

export type ClickReportFilters = {
  from: string;
  to: string;
  casinoId?: string;
  locale?: string;
};

function parseDayStart(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  return new Date(`${trimmed}T00:00:00.000Z`);
}

function parseDayEnd(value?: string) {
  const start = parseDayStart(value);
  if (!start) return undefined;
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

function utcDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function resolvedRange(filters: ClickReportFilters) {
  const toDay = parseDayStart(filters.to) ?? parseDayStart(utcDay(new Date()))!;
  const fromDay =
    parseDayStart(filters.from) ??
    new Date(toDay.getTime() - 29 * 24 * 60 * 60 * 1000);
  const toExclusive = new Date(toDay.getTime() + 24 * 60 * 60 * 1000);
  const from = fromDay <= toDay ? fromDay : toDay;
  const end = fromDay <= toDay ? toExclusive : new Date(fromDay.getTime() + 24 * 60 * 60 * 1000);
  return {
    from,
    to: end,
    fromKey: utcDay(from),
    toKey: utcDay(new Date(end.getTime() - 1)),
  };
}

function reportWhere(range: { from: Date; to: Date }, filters: ClickReportFilters) {
  const locale = routing.locales.includes(
    filters.locale as (typeof routing.locales)[number],
  )
    ? filters.locale
    : undefined;

  return {
    createdAt: { gte: range.from, lt: range.to },
    ...(filters.casinoId ? { casinoId: filters.casinoId } : {}),
    ...(locale ? { locale } : {}),
  };
}

export async function listClickCasinos(): Promise<ClickCasinoOption[]> {
  await requireAdmin();
  const rows = await prisma.casino.findMany({
    orderBy: { slug: "asc" },
    include: { translations: { where: { locale: "en" } } },
  });
  return rows.map((row) => ({
    id: row.id,
    label: row.translations[0]?.name || row.slug,
  }));
}

export async function getAffiliateClickReport(
  filters: ClickReportFilters,
): Promise<AffiliateClickReport> {
  await requireAdmin();
  const range = resolvedRange(filters);
  const where = reportWhere(range, filters);

  const [total, casinoGroups, bonusGroups, localeGroups, dayRows] =
    await Promise.all([
      prisma.affiliateClick.count({ where }),
      prisma.affiliateClick.groupBy({
        by: ["casinoId"],
        where,
        _count: { _all: true },
      }),
      prisma.affiliateClick.groupBy({
        by: ["casinoId", "bonusId"],
        where,
        _count: { _all: true },
      }),
      prisma.affiliateClick.groupBy({
        by: ["locale"],
        where,
        _count: { _all: true },
      }),
      prisma.$queryRaw<Array<{ day: Date; count: number }>>(
        Prisma.sql`
          SELECT (date_trunc('day', "createdAt"))::date AS day,
                 COUNT(*)::int AS count
          FROM "AffiliateClick"
          WHERE "createdAt" >= ${range.from}
            AND "createdAt" < ${range.to}
            ${filters.casinoId ? Prisma.sql`AND "casinoId" = ${filters.casinoId}` : Prisma.empty}
            ${
              routing.locales.includes(
                filters.locale as (typeof routing.locales)[number],
              )
                ? Prisma.sql`AND locale = ${filters.locale}`
                : Prisma.empty
            }
          GROUP BY 1
          ORDER BY 1
        `,
      ),
    ]);

  const casinoIds = casinoGroups.map((row) => row.casinoId);
  const bonusIds = bonusGroups
    .map((row) => row.bonusId)
    .filter((id): id is string => Boolean(id));

  const [casinos, bonuses] = await Promise.all([
    casinoIds.length
      ? prisma.casino.findMany({
          where: { id: { in: casinoIds } },
          include: { translations: { where: { locale: "en" } } },
        })
      : Promise.resolve([]),
    bonusIds.length
      ? prisma.bonus.findMany({
          where: { id: { in: bonusIds } },
          include: { translations: { where: { locale: "en" } } },
        })
      : Promise.resolve([]),
  ]);

  const casinoName = new Map(
    casinos.map((row) => [row.id, row.translations[0]?.name || row.slug]),
  );
  const bonusTitle = new Map(
    bonuses.map((row) => [row.id, row.translations[0]?.title || "—"]),
  );

  const casinosReport: ClickCasinoRow[] = casinoGroups
    .map((row) => ({
      casinoId: row.casinoId,
      name: casinoName.get(row.casinoId) || row.casinoId,
      clicks: row._count._all,
      bonuses: bonusGroups
        .filter((item) => item.casinoId === row.casinoId)
        .map((item) => ({
          bonusId: item.bonusId,
          title: item.bonusId ? bonusTitle.get(item.bonusId) || "—" : "—",
          clicks: item._count._all,
        }))
        .sort((a, b) => b.clicks - a.clicks),
    }))
    .sort((a, b) => b.clicks - a.clicks || a.name.localeCompare(b.name));

  const locales = localeGroups
    .map((row) => ({ locale: row.locale, clicks: row._count._all }))
    .sort((a, b) => b.clicks - a.clicks || a.locale.localeCompare(b.locale));

  const byDay = new Map(
    dayRows.map((row) => [utcDay(new Date(row.day)), Number(row.count)]),
  );
  const days: ClickDayRow[] = [];
  for (
    let cursor = range.from.getTime();
    cursor < range.to.getTime();
    cursor += 24 * 60 * 60 * 1000
  ) {
    const date = utcDay(new Date(cursor));
    days.push({ date, clicks: byDay.get(date) ?? 0 });
  }

  return {
    from: range.fromKey,
    to: range.toKey,
    total,
    casinos: casinosReport,
    locales,
    days,
  };
}

function csvCell(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export async function exportAffiliateClickReport(
  filters: ClickReportFilters,
): Promise<{ filename: string; csv: string }> {
  const report = await getAffiliateClickReport(filters);
  const lines = [
    "Section,Casino,Bonus,Locale,Date,Clicks",
    ...report.casinos.map((row) =>
      ["casino", csvCell(row.name), "", "", "", row.clicks].join(","),
    ),
    ...report.casinos.flatMap((row) =>
      row.bonuses.map((bonus) =>
        [
          "bonus",
          csvCell(row.name),
          csvCell(bonus.title),
          "",
          "",
          bonus.clicks,
        ].join(","),
      ),
    ),
    ...report.locales.map((row) =>
      ["locale", "", "", csvCell(row.locale), "", row.clicks].join(","),
    ),
    ...report.days.map((row) =>
      ["day", "", "", "", row.date, row.clicks].join(","),
    ),
  ];

  return {
    filename: `clicks-${report.from}-to-${report.to}.csv`,
    csv: `${lines.join("\n")}\n`,
  };
}
