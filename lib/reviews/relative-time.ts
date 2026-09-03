const UNITS = ["year", "month", "week", "day", "hour", "minute"] as const;

type RelativeTimeUnit = (typeof UNITS)[number];

const UNIT_SECONDS: Record<RelativeTimeUnit, number> = {
  year: 365 * 24 * 60 * 60,
  month: 30 * 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  day: 24 * 60 * 60,
  hour: 60 * 60,
  minute: 60,
};

export function formatRelativeTime(date: Date, locale: string): string {
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const deltaSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(deltaSeconds);

  if (abs < 60) {
    return formatter.format(deltaSeconds, "second");
  }

  for (const unit of UNITS) {
    const size = UNIT_SECONDS[unit];
    if (abs >= size) {
      return formatter.format(Math.round(deltaSeconds / size), unit);
    }
  }

  return formatter.format(deltaSeconds, "second");
}
