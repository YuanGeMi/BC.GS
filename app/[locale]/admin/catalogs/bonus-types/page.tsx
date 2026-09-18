import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { OptionCatalogScreen } from "@/components/admin/option-catalog-screen";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.catalogs" });
  return { title: t("kinds.bonusType.title") };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OptionCatalogScreen kind="bonusType" />;
}
