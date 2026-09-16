import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { MarketsEditor } from "@/components/admin/markets-editor";

export const metadata: Metadata = { title: "Markets" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminMarketsCatalogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        Catalog
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">Markets</h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">
        Search the ISO list. English names can be edited; Chinese and Thai are
        optional. Countries are not deleted from here.
      </p>
      <MarketsEditor />
    </section>
  );
}
