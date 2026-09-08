import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CompareTool } from "@/components/compare-tool";
import { Section } from "@/components/section";
import { getCasinoPickerList } from "@/lib/casinos";
import { pageAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ casinos?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ComparePage");

  return {
    title: t("seoTitle"),
    description: t("seoDescription"),
    ...pageAlternates("/compare"),
  };
}

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const t = await getTranslations("ComparePage");
  const casinos = await getCasinoPickerList(locale);
  const initialQuery = Array.isArray(query.casinos)
    ? query.casinos[0]
    : query.casinos;

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

      <Section containerClassName="max-w-7xl">
        <CompareTool
          locale={locale}
          casinos={casinos}
          initialQuery={initialQuery}
        />
      </Section>
    </>
  );
}
