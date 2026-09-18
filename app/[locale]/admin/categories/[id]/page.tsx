import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CategoryEditor } from "@/components/admin/category-editor";
import {
  getAdminCategory,
  listAdminCategoryCasinos,
} from "@/lib/admin/categories";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.categories.editor" });
  return { title: t("editTitle") };
}

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditAdminCategoryPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [category, casinos] = await Promise.all([
    getAdminCategory(id),
    listAdminCategoryCasinos(),
  ]);

  if (!category) notFound();

  return <CategoryEditor category={category} casinos={casinos} />;
}
