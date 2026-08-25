type ClassValue = string | false | null | undefined;

/** Join conditional Tailwind class names. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
