import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { OptionCatalogScreen } from "@/components/admin/option-catalog-screen";

export const metadata: Metadata = { title: "Licenses" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminLicenseCatalogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OptionCatalogScreen kind="license" />;
}
