import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { listAdminCategories } from "@/lib/admin/categories";
import { adminPerfStart } from "@/lib/admin/perf-log";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const perf = adminPerfStart("categories.generateMetadata");
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.categories" });
  perf.end();
  return { title: t("title") };
}

export default async function AdminCategoriesPage({ params }: Props) {
  const perf = adminPerfStart("categories.page");
  const { locale } = await params;
  setRequestLocale(locale);
  perf.mark("setRequestLocale");
  const t = await getTranslations("Admin");
  const tc = await getTranslations("Admin.categories");
  perf.mark("getTranslations");
  const categories = await listAdminCategories();
  perf.end(`count=${categories.length}`);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
            {tc("eyebrow")}
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">
            {tc("title")}
          </h1>
          <p className="text-text/55 mt-3 max-w-xl text-sm">{tc("lede")}</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-accent text-background hover:bg-accent-highlight inline-flex h-10 items-center px-4 text-sm font-medium"
        >
          {t("actions.newCategory")}
        </Link>
      </div>

      <div className="border-text/10 mt-10 overflow-x-auto border-t">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              <th className="py-3 pr-4 font-medium">{tc("columns.name")}</th>
              <th className="py-3 pr-4 font-medium">{tc("columns.slug")}</th>
              <th className="py-3 pr-4 font-medium">{tc("columns.status")}</th>
              <th className="py-3 font-medium">{tc("columns.casinos")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-text/45 py-8">
                  {tc("empty")}
                </td>
              </tr>
            ) : (
              categories.map((row) => (
                <tr key={row.id} className="border-text/8 border-t">
                  <td className="py-3.5 pr-4">
                    <Link
                      href={`/admin/categories/${row.id}`}
                      className="hover:text-accent"
                    >
                      {row.name}
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
                  <td className="text-text/70 py-3.5 tabular-nums">
                    {row.casinoCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
