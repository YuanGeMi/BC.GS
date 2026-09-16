import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { CasinoEditor } from "@/components/admin/casino-editor";
import { getAdminCasino, getAdminCasinoCatalogs } from "@/lib/admin/casinos";

export const metadata: Metadata = {
  title: "Edit casino",
};

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditAdminCasinoPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [casino, catalogs] = await Promise.all([
    getAdminCasino(id),
    getAdminCasinoCatalogs(),
  ]);

  if (!casino) notFound();

  return <CasinoEditor casino={casino} catalogs={catalogs} />;
}
