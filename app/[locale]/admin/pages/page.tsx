import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { Link } from "@/i18n/navigation";
import {
  getSiteSettings,
  listAdminStaticPages,
} from "@/lib/admin/static-pages";
import { LEGAL_PAGE_LABELS } from "@/lib/static-pages";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.pages" });
  return { title: t("title") };
}

export default async function AdminPagesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const tp = await getTranslations("Admin.pages");

  const [pages, settings] = await Promise.all([
    listAdminStaticPages(),
    getSiteSettings(),
  ]);

  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        {tp("eyebrow")}
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">{tp("title")}</h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">{tp("lede")}</p>

      <div className="border-text/10 mt-10 overflow-x-auto border-t">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              <th className="py-3 pr-4 font-medium">{tp("columns.page")}</th>
              <th className="py-3 pr-4 font-medium">{tp("columns.slug")}</th>
              <th className="py-3 pr-4 font-medium">{tp("columns.status")}</th>
              <th className="py-3 font-medium">{tp("columns.updated")}</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((row) => (
              <tr key={row.slug} className="border-text/8 border-t">
                <td className="py-3.5 pr-4">
                  <Link
                    href={`/admin/pages/${row.slug}`}
                    className="hover:text-accent"
                  >
                    {LEGAL_PAGE_LABELS[row.slug]}
                  </Link>
                </td>
                <td className="text-text/55 py-3.5 pr-4">{row.slug}</td>
                <td className="py-3.5 pr-4">
                  <span
                    className={
                      row.status === "published"
                        ? "text-accent text-[11px] tracking-[0.14em] uppercase"
                        : "text-text/40 text-[11px] tracking-[0.14em] uppercase"
                    }
                  >
                    {t(`status.${row.status}`)}
                  </span>
                </td>
                <td className="text-text/50 py-3.5 tabular-nums">
                  {row.updatedAt ? dateFmt.format(new Date(row.updatedAt)) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-text/10 mt-16 border-t pt-10">
        <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
          {tp("siteEyebrow")}
        </p>
        <h2 className="font-display mt-3 text-3xl tracking-tight">
          {tp("siteTitle")}
        </h2>
        <p className="text-text/55 mt-3 max-w-xl text-sm">{tp("siteLede")}</p>
        <SiteSettingsForm telegramChannelUrl={settings.telegramChannelUrl} />
      </div>
    </section>
  );
}
