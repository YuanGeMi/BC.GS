import { unstable_cache } from "next/cache";
import { cache } from "react";

import { SITE_SETTINGS_TAG } from "@/lib/cache-tags";
import { dedupeInflight } from "@/lib/dedupe-inflight";
import { prisma } from "@/lib/prisma";

/** Keys stored in SiteSetting — admin can edit values without code changes. */
export const SITE_SETTING_KEYS = {
  telegramChannelUrl: "telegram_channel_url",
} as const;

const telegramInflight: { current: Promise<string | null> | null } = {
  current: null,
};

async function loadTelegramChannelUrl(): Promise<string | null> {
  return dedupeInflight(telegramInflight, async () => {
    const row = await prisma.siteSetting.findUnique({
      where: { key: SITE_SETTING_KEYS.telegramChannelUrl },
    });

    const value = row?.value.trim();
    return value ? value : null;
  });
}

/**
 * Official Telegram channel URL from SiteSetting.
 * Empty or missing hides the footer link.
 *
 * Cached across SSG pages — without this, every prerendered page opens its
 * own siteSetting connection and saturates the Prisma pool during build.
 */
export const getTelegramChannelUrl = cache(async (): Promise<string | null> => {
  return unstable_cache(loadTelegramChannelUrl, ["telegram-channel-url"], {
    revalidate: false,
    tags: [SITE_SETTINGS_TAG],
  })();
});
