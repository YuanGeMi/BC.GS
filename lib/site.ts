import { unstable_cache } from "next/cache";
import { cache } from "react";

import type { Locale } from "@/i18n/routing";
import { SITE_SETTINGS_TAG } from "@/lib/cache-tags";
import { dedupeInflight } from "@/lib/dedupe-inflight";
import { prisma } from "@/lib/prisma";

/** Keys stored in SiteSetting — admin can edit values without code changes. */
export const SITE_SETTING_KEYS = {
  siteName: "site_name",
  logoUrl: "logo_url",
  ogImageUrl: "og_image_url",
  faviconUrl: "favicon_url",
  seoTitleDefault: "seo_title_default",
  seoDescriptionDefault: "seo_description_default",
  telegramChannelUrl: "telegram_channel_url",
  discordChannelUrl: "discord_channel_url",
  footerTaglineEn: "footer_tagline_en",
  footerTaglineZh: "footer_tagline_zh",
  footerTaglineTh: "footer_tagline_th",
  telegramWelcomeEn: "telegram_welcome_en",
  telegramWelcomeZh: "telegram_welcome_zh",
  telegramWelcomeTh: "telegram_welcome_th",
} as const;

export const FOOTER_TAGLINE_KEYS = {
  en: SITE_SETTING_KEYS.footerTaglineEn,
  zh: SITE_SETTING_KEYS.footerTaglineZh,
  th: SITE_SETTING_KEYS.footerTaglineTh,
} as const satisfies Record<Locale, string>;

/** JSON per locale, read by the Telegram bot. Admin-only: never load on public pages. */
export const TELEGRAM_WELCOME_KEYS = {
  en: SITE_SETTING_KEYS.telegramWelcomeEn,
  zh: SITE_SETTING_KEYS.telegramWelcomeZh,
  th: SITE_SETTING_KEYS.telegramWelcomeTh,
} as const satisfies Record<Locale, string>;

const ADMIN_ONLY_SETTING_KEYS = new Set<string>(
  Object.values(TELEGRAM_WELCOME_KEYS),
);

/** SiteSetting keys that public pages may read. */
export const PUBLIC_SITE_SETTING_KEYS = Object.values(SITE_SETTING_KEYS).filter(
  (key) => !ADMIN_ONLY_SETTING_KEYS.has(key),
);

export type FooterTaglines = Record<Locale, string>;

export const DEFAULT_SITE_NAME = "BC.GS";
export const DEFAULT_LOGO_URL = "/brand/logo-mark-bc.png";
export const DEFAULT_OG_IMAGE_URL = "/brand/og.png";
export const DEFAULT_FAVICON_URL = "/icon.png";

export type SiteConfig = {
  siteName: string;
  logoUrl: string;
  ogImageUrl: string;
  faviconUrl: string;
  /** Empty means fall back to locale Meta / page i18n copy. */
  seoTitleDefault: string;
  seoDescriptionDefault: string;
  telegramChannelUrl: string | null;
  discordChannelUrl: string | null;
  /** Per-locale footer tagline. Empty means fall back to Footer.tagline i18n copy. */
  footerTagline: FooterTaglines;
};

const siteConfigInflight: { current: Promise<SiteConfig> | null } = {
  current: null,
};

function readTrimmed(
  byKey: Map<string, string>,
  key: string,
): string {
  return (byKey.get(key) ?? "").trim();
}

async function loadSiteConfig(): Promise<SiteConfig> {
  return dedupeInflight(siteConfigInflight, async () => {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: { in: PUBLIC_SITE_SETTING_KEYS },
      },
    });
    const byKey = new Map(rows.map((row) => [row.key, row.value]));

    const siteName =
      readTrimmed(byKey, SITE_SETTING_KEYS.siteName) || DEFAULT_SITE_NAME;
    const logoUrl =
      readTrimmed(byKey, SITE_SETTING_KEYS.logoUrl) || DEFAULT_LOGO_URL;
    const ogImageUrl =
      readTrimmed(byKey, SITE_SETTING_KEYS.ogImageUrl) || DEFAULT_OG_IMAGE_URL;
    const faviconUrl =
      readTrimmed(byKey, SITE_SETTING_KEYS.faviconUrl) || DEFAULT_FAVICON_URL;
    const seoTitleDefault = readTrimmed(
      byKey,
      SITE_SETTING_KEYS.seoTitleDefault,
    );
    const seoDescriptionDefault = readTrimmed(
      byKey,
      SITE_SETTING_KEYS.seoDescriptionDefault,
    );
    const telegram = readTrimmed(
      byKey,
      SITE_SETTING_KEYS.telegramChannelUrl,
    );
    const discord = readTrimmed(byKey, SITE_SETTING_KEYS.discordChannelUrl);

    return {
      siteName,
      logoUrl,
      ogImageUrl,
      faviconUrl,
      seoTitleDefault,
      seoDescriptionDefault,
      telegramChannelUrl: telegram || null,
      discordChannelUrl: discord || null,
      footerTagline: {
        en: readTrimmed(byKey, FOOTER_TAGLINE_KEYS.en),
        zh: readTrimmed(byKey, FOOTER_TAGLINE_KEYS.zh),
        th: readTrimmed(byKey, FOOTER_TAGLINE_KEYS.th),
      },
    };
  });
}

/**
 * Branding + community links from SiteSetting.
 * Cached across SSG pages so prerender does not open one query per page.
 */
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  return unstable_cache(loadSiteConfig, ["site-config"], {
    revalidate: false,
    tags: [SITE_SETTINGS_TAG],
  })();
});

export const getTelegramChannelUrl = cache(async (): Promise<string | null> => {
  return (await getSiteConfig()).telegramChannelUrl;
});

export const getDiscordChannelUrl = cache(async (): Promise<string | null> => {
  return (await getSiteConfig()).discordChannelUrl;
});
