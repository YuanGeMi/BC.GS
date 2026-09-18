import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import {
  getAdminBonusCatalogs,
  listAdminBonuses,
} from "@/lib/admin/bonuses";
import { adminSelectClass } from "@/lib/admin/fields";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ casino?: string; type?: string; status?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.bonuses" });
  return { title: t("title") };
}

export default async function AdminBonusesPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const tb = await getTranslations("Admin.bonuses");

  const casinoId = query.casino ?? "";
  const typeId = query.type ?? "";
  const status = query.status ?? "all";

  const [catalogs, bonuses] = await Promise.all([
    getAdminBonusCatalogs(),
    listAdminBonuses({
      casinoId: casinoId || undefined,
      typeId: typeId || undefined,
      status: status === "all" ? undefined : status,
    }),
  ]);

  const today = new Date().toISOString().slice(0, 10);
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
            {tb("eyebrow")}
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">
            {tb("title")}
          </h1>
          <p className="text-text/55 mt-3 max-w-xl text-sm">{tb("lede")}</p>
        </div>
        <Link
          href="/admin/bonuses/new"
          className="bg-accent text-background hover:bg-accent-highlight inline-flex h-10 items-center px-4 text-sm font-medium"
        >
          {t("actions.newBonus")}
        </Link>
      </div>

      <form className="mt-10 flex flex-wrap gap-3" method="get">
        <select
          name="casino"
          defaultValue={casinoId}
          className={`${adminSelectClass} max-w-[14rem]`}
        >
          <option value="">{tb("allCasinos")}</option>
          {catalogs.casinos.map((row) => (
            <option key={row.id} value={row.id}>
              {row.label}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={typeId}
          className={`${adminSelectClass} max-w-[12rem]`}
        >
          <option value="">{tb("allTypes")}</option>
          {catalogs.types.map((row) => (
            <option key={row.id} value={row.id}>
              {row.label}
            </option>
          ))}
        </select>
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
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              <th className="py-3 pr-4 font-medium">{tb("columns.title")}</th>
              <th className="py-3 pr-4 font-medium">{tb("columns.casino")}</th>
              <th className="py-3 pr-4 font-medium">{tb("columns.type")}</th>
              <th className="py-3 pr-4 font-medium">{tb("columns.status")}</th>
              <th className="py-3 pr-4 font-medium">{tb("columns.expiry")}</th>
              <th className="py-3 font-medium">{tb("columns.order")}</th>
            </tr>
          </thead>
          <tbody>
            {bonuses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-text/45 py-8">
                  {tb("empty")}
                </td>
              </tr>
            ) : (
              bonuses.map((row) => {
                const day = row.expiryDate?.slice(0, 10);
                const expired = Boolean(day && day < today);
                return (
                  <tr key={row.id} className="border-text/8 border-t">
                    <td className="py-3.5 pr-4">
                      <Link
                        href={`/admin/bonuses/${row.id}`}
                        className="hover:text-accent"
                      >
                        {row.title}
                      </Link>
                    </td>
                    <td className="text-text/70 py-3.5 pr-4">{row.casinoName}</td>
                    <td className="text-text/70 py-3.5 pr-4">{row.typeName}</td>
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
                    <td className="text-text/55 py-3.5 pr-4">
                      {row.expiryDate
                        ? dateFmt.format(new Date(row.expiryDate))
                        : "—"}
                      {expired ? (
                        <span className="text-accent/80 ml-2 text-[11px] tracking-wide uppercase">
                          {tb("expired")}
                        </span>
                      ) : null}
                    </td>
                    <td className="text-text/50 py-3.5 tabular-nums">
                      {row.sortOrder}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
