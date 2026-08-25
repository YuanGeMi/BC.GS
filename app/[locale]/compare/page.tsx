import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CompareTool } from "@/components/compare-tool";
import { Section } from "@/components/section";
import { mockCasinos } from "@/data/mock-casinos";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ casinos?: string | string[] }>;
};

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const t = await getTranslations("ComparePage");
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
        <Suspense fallback={<CompareFallback />}>
          <CompareTool
            locale={locale}
            casinos={mockCasinos}
            initialQuery={initialQuery}
          />
        </Suspense>
      </Section>
    </>
  );
}

function CompareFallback() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {[0, 1, 2].map((slot) => (
        <div
          key={slot}
          className="bg-card/40 ring-text/8 h-28 animate-pulse rounded-xl ring-1"
        />
      ))}
    </div>
  );
}
