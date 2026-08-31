import type { LegalDocument } from "../data/legal-content";
import { localize, type LocalizedText } from "../data/mock-casinos";

const LOCALES = ["en", "zh", "th"] as const;

export type StaticPageLocale = (typeof LOCALES)[number];

function pick(text: LocalizedText, locale: StaticPageLocale): string {
  return localize(text, locale);
}

export function legalDocumentToMarkdown(
  document: LegalDocument,
  locale: StaticPageLocale,
): string {
  const parts: string[] = [pick(document.description, locale), ""];

  for (const section of document.sections) {
    parts.push(`## ${pick(section.heading, locale)}`, "");

    for (const paragraph of section.paragraphs) {
      parts.push(pick(paragraph, locale), "");
    }

    if (section.list) {
      for (const item of section.list) {
        parts.push(`- ${pick(item, locale)}`);
      }
      parts.push("");
    }

    if (section.links) {
      for (const link of section.links) {
        parts.push(`[${pick(link.label, locale)}](${link.href})`);
      }
      parts.push("");
    }
  }

  return parts.join("\n").trim();
}

export const STATIC_PAGE_LOCALES = LOCALES;
