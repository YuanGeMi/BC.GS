import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Section } from "@/components/section";
import { bestCategories } from "@/data/best-categories";
import { localize } from "@/data/mock-casinos";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("BestOfIndex");

  return {
    title: t("seoTitle"),
    description: t("seoDescription"),
  };
}

export default async function BestOfIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("BestOfIndex");

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
        <div className="grid gap-4 sm:grid-cols-2">
          {bestCategories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/best/${category.slug}`}
              className="bg-card group ring-text/8 hover:ring-accent/30 rounded-xl p-6 ring-1 transition-all duration-300 ease-out hover:-translate-y-0.5"
            >
              <span className="text-accent/70 mb-3 block text-[11px] font-medium tracking-[0.18em] uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="text-text group-hover:text-accent-highlight text-lg font-semibold tracking-tight transition-colors duration-200">
                {localize(category.title, locale)}
              </h2>
              <p className="text-text/55 mt-2 text-sm leading-relaxed">
                {localize(category.summary, locale)}
              </p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
