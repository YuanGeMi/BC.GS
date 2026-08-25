import { getTranslations, setRequestLocale } from "next-intl/server";

import { CardStyleToggle } from "@/components/card-style-toggle";
import { HeroStyleToggle } from "@/components/hero-style-toggle";
import { Section } from "@/components/section";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("SettingsPage");

  return (
    <Section containerClassName="max-w-xl">
      <p className="text-accent mb-3 text-xs font-medium tracking-[0.22em] uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="text-text text-3xl font-semibold tracking-tight md:text-4xl">
        {t("title")}
      </h1>
      <p className="text-text/60 mt-4 text-base leading-relaxed">
        {t("description")}
      </p>

      <div className="border-text/10 mt-10 border-t pt-8">
        <p className="text-text mb-2 text-sm font-semibold tracking-tight">
          {t("cards.label")}
        </p>
        <p className="text-text/50 mb-5 text-sm">{t("cards.help")}</p>
        <CardStyleToggle />
      </div>

      <div className="border-text/10 mt-10 border-t pt-8">
        <p className="text-text mb-2 text-sm font-semibold tracking-tight">
          {t("hero.label")}
        </p>
        <p className="text-text/50 mb-5 text-sm">{t("hero.help")}</p>
        <HeroStyleToggle />
      </div>
    </Section>
  );
}
