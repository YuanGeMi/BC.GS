import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MarketsEditor } from "@/components/admin/markets-editor";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.catalogs" });
  return { title: t("marketsTitle") };
}

export default async function AdminMarketsCatalogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.catalogs");

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">
        {t("marketsTitle")}
      </h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">{t("marketsLede")}</p>
      <MarketsEditor />
    </section>
  );
}
