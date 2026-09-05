const MAX_NAME_LENGTH = 80;

function firstGrapheme(value: string) {
  const match = value.match(/\p{L}|\p{N}/u);
  return match?.[0] ?? "";
}

function titleCaseWord(value: string) {
  const lower = value.toLowerCase();
  const first = firstGrapheme(lower);
  if (!first) return value;
  return first.toUpperCase() + lower.slice(lower.indexOf(first) + first.length);
}

export function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const withoutTrailingDigits = local.replace(/\d+$/g, "");
  const parts = (withoutTrailingDigits || local)
    .split(/[._+-]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(titleCaseWord);

  return parts.join(" ") || "Player";
}

export function publicReviewName(displayName: string | null, email: string) {
  const named = displayName?.trim();
  return named || nameFromEmail(email);
}

/** Amazon/Trustpilot-style: "Vitor Lopes" → "Vitor L." */
export function formatReviewDisplayName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const lastInitial = firstGrapheme(parts[parts.length - 1]);
    return lastInitial ? `${parts[0]} ${lastInitial.toUpperCase()}.` : parts[0];
  }
  return parts[0] ?? "Player";
}

/** Two-word names: VL. Single token: first two letters (or one). */
export function reviewInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = firstGrapheme(parts[0]);
    const last = firstGrapheme(parts[parts.length - 1]);
    return `${first}${last}`.toUpperCase() || "?";
  }

  const compact = (parts[0] ?? "").replace(/[^\p{L}\p{N}]/gu, "");
  if (compact.length >= 2) return compact.slice(0, 2).toUpperCase();
  return (compact[0] ?? "?").toUpperCase();
}

export function normalizeDisplayName(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, MAX_NAME_LENGTH);
}

export function isValidDisplayName(name: string) {
  return name.length >= 2 && name.length <= MAX_NAME_LENGTH;
}

export function displayNameFromAuthMetadata(
  metadata: Record<string, unknown> | undefined,
) {
  const value = metadata?.display_name;
  return typeof value === "string" ? normalizeDisplayName(value) : "";
}
