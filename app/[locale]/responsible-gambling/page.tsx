import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { LegalPage } from "@/components/legal-page";
import { getLegalDocument } from "@/data/legal-content";
import { localize } from "@/data/mock-casinos";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const document = getLegalDocument("responsible-gambling");

  return {
    title: localize(document.seoTitle, locale),
    description: localize(document.seoDescription, locale),
  };
}

export default async function ResponsibleGamblingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage
      locale={locale}
      document={getLegalDocument("responsible-gambling")}
    />
  );
}
