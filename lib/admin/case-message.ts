/** Longest message staff can send to the person who filed a case, counted after normalizing. */
export const CASE_USER_MESSAGE_MAX = 1000;

/**
 * Plain text only: CRLF/CR become LF, tabs become spaces, and other control characters
 * (C0, DEL, C1) and bidi overrides/isolates are removed. No HTML or markdown handling.
 */
export function normalizeCaseUserMessage(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .replace(
      /[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g,
      "",
    )
    .trim();
}
