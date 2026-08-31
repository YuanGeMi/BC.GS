import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CasinoDirectory } from "@/components/casino-directory";
import { Section } from "@/components/section";
import { getCasinos } from "@/lib/casinos";
import { pageAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("CasinosPage");

  return {
    title: t("seoTitle"),
    description: t("seoDescription"),
    ...pageAlternates("/casinos"),
  };
}

export default async function CasinosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("CasinosPage");
  const casinos = await getCasinos(locale);

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
        {casinos.length === 0 ? (
          <div className="bg-card ring-text/8 rounded-xl px-6 py-12 text-center ring-1">
            <p className="text-text text-base font-semibold tracking-tight">
              {t("empty.title")}
            </p>
            <p className="text-text/55 mt-2 text-sm leading-relaxed">
              {t("empty.body")}
            </p>
          </div>
        ) : (
          <CasinoDirectory locale={locale} casinos={casinos} />
        )}
      </Section>
    </>
  );
}
