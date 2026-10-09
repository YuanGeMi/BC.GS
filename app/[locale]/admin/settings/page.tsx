import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { TelegramWelcomeForm } from "@/components/admin/telegram-welcome-form";
import { routing } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/admin/static-pages";
import { getTelegramWelcomeSettings } from "@/lib/admin/telegram-welcome";
import type { FooterTaglines } from "@/lib/site";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.settings" });
  return { title: t("title") };
}

export default async function AdminSettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.settings");
  const [settings, telegramWelcome, ...defaultTaglines] = await Promise.all([
    getSiteSettings(),
    getTelegramWelcomeSettings(),
    ...routing.locales.map(async (item) => {
      const tFooter = await getTranslations({
        locale: item,
        namespace: "Footer",
      });
      return [item, tFooter("tagline")] as const;
    }),
  ]);

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">{t("title")}</h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">{t("lede")}</p>
      <SiteSettingsForm
        siteName={settings.siteName}
        logoUrl={settings.logoUrl}
        ogImageUrl={settings.ogImageUrl}
        faviconUrl={settings.faviconUrl}
        seoTitleDefault={settings.seoTitleDefault}
        seoDescriptionDefault={settings.seoDescriptionDefault}
        telegramChannelUrl={settings.telegramChannelUrl}
        discordChannelUrl={settings.discordChannelUrl}
        footerTagline={settings.footerTagline}
        defaultFooterTagline={
          Object.fromEntries(defaultTaglines) as FooterTaglines
        }
      />
      <TelegramWelcomeForm initial={telegramWelcome} />
    </section>
  );
}
