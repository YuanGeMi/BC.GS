import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { listAdminCasinos } from "@/lib/admin/casinos";
import { adminInputClass, adminSelectClass } from "@/lib/admin/fields";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.casinos" });
  return { title: t("title") };
}

export default async function AdminCasinosPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const tc = await getTranslations("Admin.casinos");

  const q = query.q?.trim() ?? "";
  const status = query.status ?? "all";
  const casinos = await listAdminCasinos({
    q,
    status: status === "all" ? undefined : status,
  });

  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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
          href="/admin/casinos/new"
          className="bg-accent text-background hover:bg-accent-highlight inline-flex h-10 items-center px-4 text-sm font-medium"
        >
          {t("actions.newCasino")}
        </Link>
      </div>

      <form className="mt-10 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder={tc("searchPlaceholder")}
          className={`${adminInputClass} max-w-xs`}
        />
        <select
          name="status"
          defaultValue={status}
          className={`${adminSelectClass} max-w-[10rem]`}
        >
          <option value="all">{t("status.all")}</option>
          <option value="draft">{t("status.draft")}</option>
          <option value="published">{t("status.published")}</option>
        </select>
        <button
          type="submit"
          className="ring-text/20 hover:ring-accent/50 h-11 px-4 text-sm ring-1"
        >
          {t("actions.filter")}
        </button>
      </form>

      <div className="border-text/10 mt-8 overflow-x-auto border-t">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              <th className="py-3 pr-4 font-medium">{tc("columns.name")}</th>
              <th className="py-3 pr-4 font-medium">{tc("columns.slug")}</th>
              <th className="py-3 pr-4 font-medium">{tc("columns.status")}</th>
              <th className="py-3 pr-4 font-medium">{tc("columns.rating")}</th>
              <th className="py-3 font-medium">{tc("columns.updated")}</th>
            </tr>
          </thead>
          <tbody>
            {casinos.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-text/45 py-8">
                  {tc("empty")}
                </td>
              </tr>
            ) : (
              casinos.map((row) => (
                <tr key={row.id} className="border-text/8 border-t">
                  <td className="py-3.5 pr-4">
                    <Link
                      href={`/admin/casinos/${row.id}`}
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
                  <td className="text-text/70 py-3.5 pr-4 tabular-nums">
                    {row.overallRating == null
                      ? "—"
                      : row.overallRating.toFixed(1)}
                  </td>
                  <td className="text-text/50 py-3.5 tabular-nums">
                    {dateFmt.format(new Date(row.updatedAt))}
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
