import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { BonusEditor } from "@/components/admin/bonus-editor";
import { getAdminBonus, getAdminBonusCatalogs } from "@/lib/admin/bonuses";

export const metadata: Metadata = {
  title: "Edit bonus",
};

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditAdminBonusPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [bonus, catalogs] = await Promise.all([
    getAdminBonus(id),
    getAdminBonusCatalogs(),
  ]);

  if (!bonus) notFound();

  return <BonusEditor bonus={bonus} catalogs={catalogs} />;
}
