import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { StaticPageEditor } from "@/components/admin/static-page-editor";
import { getAdminStaticPage } from "@/lib/admin/static-pages";
import { isLegalPageSlug, LEGAL_PAGE_LABELS } from "@/lib/static-pages";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: isLegalPageSlug(slug) ? LEGAL_PAGE_LABELS[slug] : "Pages",
  };
}

export default async function EditAdminStaticPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!isLegalPageSlug(slug)) notFound();

  const page = await getAdminStaticPage(slug);
  if (!page) notFound();

  return <StaticPageEditor page={page} />;
}
