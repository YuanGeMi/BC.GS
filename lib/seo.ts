import type { Metadata } from "next";

import { routing, type Locale } from "@/i18n/routing";

const DEFAULT_SITE_URL = "https://www.bc.gs";

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? DEFAULT_SITE_URL;
}

export const siteMetadataBase = new URL(getSiteUrl());

export function buildLanguageAlternates(path: string): Record<Locale, string> {
  const base = getSiteUrl();
  const normalized =
    path === "/" || path === ""
      ? ""
      : path.startsWith("/")
        ? path
        : `/${path}`;

  return Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      `${base}/${locale}${normalized}`,
    ]),
  ) as Record<Locale, string>;
}

export function pageAlternates(path: string): Pick<Metadata, "alternates"> {
  return {
    alternates: {
      languages: buildLanguageAlternates(path),
    },
  };
}

export function truncateMetaDescription(text: string, max = 155): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;

  const slice = trimmed.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");

  if (lastSpace > max * 0.6) {
    return `${slice.slice(0, lastSpace).trimEnd()}…`;
  }

  return `${slice.trimEnd()}…`;
}
