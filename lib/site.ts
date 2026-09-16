import { cache } from "react";

import { prisma } from "@/lib/prisma";

/** Keys stored in SiteSetting — admin can edit values without code changes. */
export const SITE_SETTING_KEYS = {
  telegramChannelUrl: "telegram_channel_url",
} as const;

/**
 * Official Telegram channel URL from SiteSetting.
 * Empty or missing hides the footer link.
 */
export const getTelegramChannelUrl = cache(async (): Promise<string | null> => {
  const row = await prisma.siteSetting.findUnique({
    where: { key: SITE_SETTING_KEYS.telegramChannelUrl },
  });

  const value = row?.value.trim();
  return value ? value : null;
});
