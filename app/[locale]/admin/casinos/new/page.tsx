import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CasinoEditor } from "@/components/admin/casino-editor";
import { getAdminCasinoCatalogs } from "@/lib/admin/casinos";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.casinos.editor" });
  return { title: t("newTitle") };
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewAdminCasinoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const catalogs = await getAdminCasinoCatalogs();

  return <CasinoEditor catalogs={catalogs} />;
}
