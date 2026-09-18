import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CategoryEditor } from "@/components/admin/category-editor";
import { listAdminCategoryCasinos } from "@/lib/admin/categories";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.categories.editor" });
  return { title: t("newTitle") };
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewAdminCategoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const casinos = await listAdminCategoryCasinos();

  return <CategoryEditor casinos={casinos} />;
}
