import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { CasinoEditor } from "@/components/admin/casino-editor";
import { getAdminCasinoCatalogs } from "@/lib/admin/casinos";

export const metadata: Metadata = {
  title: "New casino",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewAdminCasinoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const catalogs = await getAdminCasinoCatalogs();

  return <CasinoEditor catalogs={catalogs} />;
}
