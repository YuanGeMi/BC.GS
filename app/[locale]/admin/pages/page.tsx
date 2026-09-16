import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { Link } from "@/i18n/navigation";
import {
  getSiteSettings,
  listAdminStaticPages,
} from "@/lib/admin/static-pages";
import { LEGAL_PAGE_LABELS } from "@/lib/static-pages";

export const metadata: Metadata = {
  title: "Pages",
};

type Props = {
  params: Promise<{ locale: string }>;
};

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminPagesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [pages, settings] = await Promise.all([
    listAdminStaticPages(),
    getSiteSettings(),
  ]);

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        Legal
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">Pages</h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">
        These three slugs are fixed. Unpublish to 404 the public URL.
      </p>

      <div className="border-text/10 mt-10 overflow-x-auto border-t">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              <th className="py-3 pr-4 font-medium">Page</th>
              <th className="py-3 pr-4 font-medium">Slug</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 font-medium">Updated</th>
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
                    {row.status}
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
          Site
        </p>
        <h2 className="font-display mt-3 text-3xl tracking-tight">Settings</h2>
        <p className="text-text/55 mt-3 max-w-xl text-sm">
          Footer Telegram link. Empty hides it on the public site.
        </p>
        <SiteSettingsForm telegramChannelUrl={settings.telegramChannelUrl} />
      </div>
    </section>
  );
}
