import type { Metadata } from "next";
import { Fragment } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ClickExportButton } from "@/components/admin/click-export-button";
import { routing } from "@/i18n/routing";
import { adminInputClass, adminSelectClass } from "@/lib/admin/fields";
import {
  getAffiliateClickReport,
  listClickCasinos,
} from "@/lib/admin/clicks";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
    casino?: string;
    locale?: string;
  }>;
};

const dayRe = /^\d{4}-\d{2}-\d{2}$/;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.clicks" });
  return { title: t("title") };
}

export default async function AdminClicksPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const tk = await getTranslations("Admin.clicks");

  const from = query.from && dayRe.test(query.from) ? query.from : undefined;
  const to = query.to && dayRe.test(query.to) ? query.to : undefined;
  const casinoId = query.casino ?? "";
  const filterLocale =
    query.locale && routing.locales.includes(query.locale as never)
      ? query.locale
      : "";

  const [casinos, report] = await Promise.all([
    listClickCasinos(),
    getAffiliateClickReport({
      from: from ?? "",
      to: to ?? "",
      casinoId: casinoId || undefined,
      locale: filterLocale || undefined,
    }),
  ]);

  const numberFmt = new Intl.NumberFormat(locale);
  const empty = report.total === 0;

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        {tk("eyebrow")}
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">{tk("title")}</h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">{tk("lede")}</p>

      <form className="mt-10 flex flex-wrap items-end gap-3" method="get">
        <input
          type="date"
          name="from"
          defaultValue={report.from}
          aria-label={tk("from")}
          className={`${adminInputClass} max-w-[11rem]`}
        />
        <input
          type="date"
          name="to"
          defaultValue={report.to}
          aria-label={tk("to")}
          className={`${adminInputClass} max-w-[11rem]`}
        />
        <select
          name="casino"
          defaultValue={casinoId}
          className={`${adminSelectClass} max-w-[14rem]`}
        >
          <option value="">{tk("allCasinos")}</option>
          {casinos.map((row) => (
            <option key={row.id} value={row.id}>
              {row.label}
            </option>
          ))}
        </select>
        <select
          name="locale"
          defaultValue={filterLocale}
          className={`${adminSelectClass} max-w-[10rem]`}
        >
          <option value="">{tk("allLocales")}</option>
          {routing.locales.map((code) => (
            <option key={code} value={code}>
              {t(`contentLocale.${code}`)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="ring-text/20 hover:ring-accent/50 h-11 px-4 text-sm ring-1"
        >
          {t("actions.filter")}
        </button>
        <ClickExportButton
          from={report.from}
          to={report.to}
          casinoId={casinoId}
          locale={filterLocale}
        />
      </form>

      <p className="text-text/40 mt-8 text-xs tracking-wide">
        {report.total === 1
          ? tk("countOne", { count: numberFmt.format(report.total) })
          : tk("countMany", { count: numberFmt.format(report.total) })}{" "}
        · {report.from} – {report.to}
      </p>

      {empty ? (
        <p className="text-text/45 mt-10 text-sm">{tk("empty")}</p>
      ) : (
        <>
          <h2 className="font-display mt-10 text-2xl tracking-tight">
            {tk("casinosHeading")}
          </h2>
          <div className="border-text/10 mt-4 overflow-x-auto border-t">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
                  <th className="py-3 pr-4 font-medium">
                    {tk("columns.casino")}
                  </th>
                  <th className="py-3 pr-4 font-medium">
                    {tk("columns.bonus")}
                  </th>
                  <th className="py-3 font-medium">{tk("columns.clicks")}</th>
                </tr>
              </thead>
              <tbody>
                {report.casinos.map((row) => (
                  <Fragment key={row.casinoId}>
                    <tr className="border-text/8 border-t">
                      <td className="py-3.5 pr-4 font-medium">{row.name}</td>
                      <td className="text-text/40 py-3.5 pr-4">{tk("all")}</td>
                      <td className="py-3.5 tabular-nums">
                        {numberFmt.format(row.clicks)}
                      </td>
                    </tr>
                    {row.bonuses.map((bonus) => (
                      <tr
                        key={bonus.bonusId ?? "none"}
                        className="border-text/5 border-t"
                      >
                        <td className="text-text/40 py-2.5 pr-4 pl-4">
                          {row.name}
                        </td>
                        <td className="py-2.5 pr-4">{bonus.title}</td>
                        <td className="py-2.5 tabular-nums">
                          {numberFmt.format(bonus.clicks)}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-display mt-14 text-2xl tracking-tight">
            {tk("localesHeading")}
          </h2>
          <div className="border-text/10 mt-4 overflow-x-auto border-t">
            <table className="w-full max-w-md text-left text-sm">
              <thead>
                <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
                  <th className="py-3 pr-4 font-medium">
                    {tk("columns.locale")}
                  </th>
                  <th className="py-3 font-medium">{tk("columns.clicks")}</th>
                </tr>
              </thead>
              <tbody>
                {report.locales.map((row) => (
                  <tr key={row.locale} className="border-text/8 border-t">
                    <td className="py-3 pr-4">
                      {t.has(`contentLocale.${row.locale}`)
                        ? t(`contentLocale.${row.locale}`)
                        : row.locale}
                    </td>
                    <td className="py-3 tabular-nums">
                      {numberFmt.format(row.clicks)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-display mt-14 text-2xl tracking-tight">
            {tk("dailyHeading")}
          </h2>
          <div className="border-text/10 mt-4 overflow-x-auto border-t">
            <table className="w-full max-w-md text-left text-sm">
              <thead>
                <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
                  <th className="py-3 pr-4 font-medium">{tk("columns.date")}</th>
                  <th className="py-3 font-medium">{tk("columns.clicks")}</th>
                </tr>
              </thead>
              <tbody>
                {report.days.map((row) => (
                  <tr key={row.date} className="border-text/8 border-t">
                    <td className="py-2.5 pr-4 tabular-nums">{row.date}</td>
                    <td className="py-2.5 tabular-nums">
                      {numberFmt.format(row.clicks)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
