import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BotAvatarForm } from "@/components/admin/bot-avatar-form";
import { TelegramWelcomeForm } from "@/components/admin/telegram-welcome-form";
import { getBotAvatarSettings } from "@/lib/admin/bot-avatar";
import { getTelegramWelcomeSettings } from "@/lib/admin/telegram-welcome";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.telegram" });
  return { title: t("title") };
}

export default async function AdminTelegramPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.telegram");
  const [telegramWelcome, botAvatar] = await Promise.all([
    getTelegramWelcomeSettings(),
    getBotAvatarSettings(),
  ]);

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">{t("title")}</h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">{t("lede")}</p>
      <TelegramWelcomeForm initial={telegramWelcome} />
      <BotAvatarForm
        currentUrl={botAvatar.url}
        tokenConfigured={botAvatar.tokenConfigured}
      />
    </section>
  );
}
