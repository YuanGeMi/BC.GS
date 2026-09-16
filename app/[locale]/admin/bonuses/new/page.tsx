import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { BonusEditor } from "@/components/admin/bonus-editor";
import { getAdminBonusCatalogs } from "@/lib/admin/bonuses";

export const metadata: Metadata = {
  title: "New bonus",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ casino?: string }>;
};

export default async function NewAdminBonusPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const catalogs = await getAdminBonusCatalogs();

  return (
    <BonusEditor catalogs={catalogs} presetCasinoId={query.casino} />
  );
}
