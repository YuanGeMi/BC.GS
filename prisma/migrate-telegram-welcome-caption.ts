/**
 * One-off: keep the old /start look for saved welcomes that have media and text but no caption.
 *
 * The bot used to put the welcome text on the media as its caption (when the text fit in 1024
 * characters). It now sends the text and the media as two messages and never reuses the text as
 * caption. This copies the text into the caption for exactly the configs the old rule applied to.
 *
 * Dry run (default, read-only):  npx tsx prisma/migrate-telegram-welcome-caption.ts
 * Apply:                         npx tsx prisma/migrate-telegram-welcome-caption.ts --apply
 */
import { PrismaClient } from "@prisma/client";

const KEYS = ["telegram_welcome_en", "telegram_welcome_zh", "telegram_welcome_th"];
const CAPTION_MAX = 1024;

export type CaptionMigration =
  | { action: "skip"; reason: string }
  | { action: "copy"; next: string; textLength: number };

/** Decides what to do with one stored value, using the old bot rule. Never touches anything else in the JSON. */
export function planCaptionMigration(stored: string | null | undefined): CaptionMigration {
  if (!stored?.trim()) return { action: "skip", reason: "not set" };
  let json: unknown;
  try {
    json = JSON.parse(stored);
  } catch {
    return { action: "skip", reason: "not valid JSON" };
  }
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return { action: "skip", reason: "not an object" };
  }
  const raw = json as Record<string, unknown>;
  const text = typeof raw.text === "string" ? raw.text.trim() : "";
  const caption = typeof raw.caption === "string" ? raw.caption.trim() : "";
  const hasMedia = typeof raw.mediaUrl === "string" && raw.mediaUrl.trim() !== "";

  if (!hasMedia) return { action: "skip", reason: "no media" };
  if (caption) return { action: "skip", reason: "already has a caption" };
  if (!text) return { action: "skip", reason: "no welcome text" };
  if (text.length > CAPTION_MAX) {
    return { action: "skip", reason: `text is ${text.length} chars (> ${CAPTION_MAX}); the old bot sent it after the media, as now` };
  }
  return { action: "copy", next: JSON.stringify({ ...raw, caption: text }), textLength: text.length };
}

async function main() {
  const apply = process.argv.includes("--apply");
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: KEYS } },
      select: { key: true, value: true },
    });
    const byKey = new Map(rows.map((row) => [row.key, row.value]));
    console.log(apply ? "APPLY: writing changes" : "DRY RUN: nothing is written (add --apply to write)");

    let changed = 0;
    for (const key of KEYS) {
      const current = byKey.get(key);
      const plan = planCaptionMigration(current);
      if (plan.action === "skip") {
        console.log(`  ${key}: skip (${plan.reason})`);
        continue;
      }
      console.log(`  ${key}: copy the welcome text (${plan.textLength} chars) into the empty caption`);
      if (!apply) continue;
      // Only overwrite the exact value read above, so an admin edit made in between is never clobbered.
      const result = await prisma.siteSetting.updateMany({
        where: { key, value: current },
        data: { value: plan.next },
      });
      console.log(result.count === 1 ? "    written" : "    NOT written: the value changed since it was read");
      changed += result.count;
    }
    if (apply) console.log(`Done: ${changed} value(s) updated.`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.endsWith("migrate-telegram-welcome-caption.ts")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
