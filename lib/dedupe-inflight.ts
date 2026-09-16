/**
 * Collapse concurrent callers onto one in-flight promise.
 * Stops SSG stampede where N pages miss unstable_cache at once and each
 * opens a Prisma connection for the same shared footer/settings query.
 */
export function dedupeInflight<T>(
  slot: { current: Promise<T> | null },
  load: () => Promise<T>,
): Promise<T> {
  if (!slot.current) {
    slot.current = load().finally(() => {
      slot.current = null;
    });
  }
  return slot.current;
}
