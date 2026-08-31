import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { StaticPage } from "@/components/static-page";
import { getStaticPage } from "@/lib/static-pages";
import { pageAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getStaticPage("terms", locale);

  if (!page) {
    return {};
  }

  return {
    title: page.seoTitle?.trim() || page.title,
    description: page.seoDescription ?? undefined,
    ...pageAlternates("/terms"),
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getStaticPage("terms", locale);

  if (!page) {
    notFound();
  }

  return <StaticPage locale={locale} page={page} />;
}
