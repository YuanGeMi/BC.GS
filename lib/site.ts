import { cache } from "react";

import { prisma } from "@/lib/prisma";

/** Keys stored in SiteSetting — admin can edit values without code changes. */
export const SITE_SETTING_KEYS = {
  telegramChannelUrl: "telegram_channel_url",
} as const;

const TELEGRAM_FALLBACK = "https://t.me/bcgs";

/**
 * Official Telegram channel URL from SiteSetting.
 * Seeded / editable in DB; ready for an admin settings UI later.
 */
export const getTelegramChannelUrl = cache(async (): Promise<string> => {
  const row = await prisma.siteSetting.findUnique({
    where: { key: SITE_SETTING_KEYS.telegramChannelUrl },
  });

  const value = row?.value.trim();
  return value && value.length > 0 ? value : TELEGRAM_FALLBACK;
});
