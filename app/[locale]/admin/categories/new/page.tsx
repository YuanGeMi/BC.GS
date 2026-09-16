import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { CategoryEditor } from "@/components/admin/category-editor";
import { listAdminCategoryCasinos } from "@/lib/admin/categories";

export const metadata: Metadata = {
  title: "New category",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewAdminCategoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const casinos = await listAdminCategoryCasinos();

  return <CategoryEditor casinos={casinos} />;
}
