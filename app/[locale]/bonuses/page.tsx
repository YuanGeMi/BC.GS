import { getTranslations, setRequestLocale } from "next-intl/server";

import { BonusDirectory } from "@/components/bonus-directory";
import { Section } from "@/components/section";
import { mockBonuses } from "@/data/mock-bonuses";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BonusesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("BonusesPage");

  return (
    <>
      <Section className="border-text/5 border-b pb-10 md:pb-12 lg:pb-14">
        <p className="text-accent mb-3 text-xs font-medium tracking-[0.22em] uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="text-text text-3xl font-semibold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="text-text/60 mt-4 max-w-2xl text-base leading-relaxed">
          {t("description")}
        </p>
      </Section>

      <Section>
        <BonusDirectory locale={locale} bonuses={mockBonuses} />
      </Section>
    </>
  );
}
