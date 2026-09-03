export const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function getPassword(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
