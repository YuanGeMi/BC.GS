import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { OptionCatalogScreen } from "@/components/admin/option-catalog-screen";

export const metadata: Metadata = { title: "Payments" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPaymentCatalogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OptionCatalogScreen kind="payment" />;
}
