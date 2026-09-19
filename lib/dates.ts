/** Coerce Prisma Date fields after JSON cache round-trips (unstable_cache). */
export function toIsoString(value: Date | string): string {
  return typeof value === "string" ? value : value.toISOString();
}

export function toIsoStringOrNull(
  value: Date | string | null | undefined,
): string | null {
  if (value == null) return null;
  return toIsoString(value);
}
