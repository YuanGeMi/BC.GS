import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { listAdminComplaints } from "@/lib/admin/complaints";
import { adminInputClass, adminSelectClass } from "@/lib/admin/fields";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    status?: string;
    type?: string;
    source?: string;
    q?: string;
    casino?: string;
    unlinked?: string;
    page?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.complaints" });
  return { title: t("title") };
}

export default async function AdminComplaintsPage({
  params,
  searchParams,
}: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const tc = await getTranslations("Admin.complaints");

  const status = query.status ?? "";
  const type = query.type ?? "";
  const source = query.source ?? "";
  const q = query.q ?? "";
  const casino = query.casino ?? "";
  const unlinked = query.unlinked === "1";
  const page = Number.parseInt(query.page ?? "1", 10);

  const list = await listAdminComplaints({
    status: status || undefined,
    type: type || undefined,
    source: source || undefined,
    caseId: q || undefined,
    casino: casino || undefined,
    unlinkedOnly: unlinked,
    page: Number.isFinite(page) ? page : 1,
  });

  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const queryForPage = (nextPage: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (source) params.set("source", source);
    if (q) params.set("q", q);
    if (casino) params.set("casino", casino);
    if (unlinked) params.set("unlinked", "1");
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/complaints?${qs}` : "/admin/complaints";
  };

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        {tc("eyebrow")}
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">
        {tc("title")}
      </h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">{tc("lede")}</p>

      <form className="mt-10 flex flex-wrap gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={tc("searchCaseId")}
          aria-label={tc("searchCaseId")}
          className={`${adminInputClass} max-w-[14rem]`}
        />
        <input
          type="search"
          name="casino"
          defaultValue={casino}
          placeholder={tc("searchCasino")}
          aria-label={tc("searchCasino")}
          className={`${adminInputClass} max-w-[14rem]`}
        />
        <select
          name="status"
          defaultValue={status}
          aria-label={tc("columns.status")}
          className={`${adminSelectClass} max-w-[11rem]`}
        >
          <option value="">{t("status.all")}</option>
          <option value="open">{tc("status.open")}</option>
          <option value="in_review">{tc("status.in_review")}</option>
          <option value="resolved">{tc("status.resolved")}</option>
          <option value="rejected">{tc("status.rejected")}</option>
        </select>
        <select
          name="type"
          defaultValue={type}
          aria-label={tc("columns.type")}
          className={`${adminSelectClass} max-w-[11rem]`}
        >
          <option value="">{tc("allTypes")}</option>
          <option value="complaint">{tc("types.complaint")}</option>
          <option value="scam_report">{tc("types.scam_report")}</option>
        </select>
        <select
          name="source"
          defaultValue={source}
          aria-label={tc("columns.source")}
          className={`${adminSelectClass} max-w-[11rem]`}
        >
          <option value="">{tc("allSources")}</option>
          <option value="telegram">{tc("sources.telegram")}</option>
          <option value="web">{tc("sources.web")}</option>
        </select>
        <label className="text-text/65 flex h-11 cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="unlinked"
            value="1"
            defaultChecked={unlinked}
            className="border-text/25 text-accent accent-accent h-3.5 w-3.5 rounded-sm"
          />
          {tc("unlinkedOnly")}
        </label>
        <button
          type="submit"
          className="ring-text/20 hover:ring-accent/50 h-11 px-4 text-sm ring-1"
        >
          {t("actions.filter")}
        </button>
      </form>

      {list.tableMissing ? (
        <p className="text-accent mt-6 text-sm">{tc("tableMissing")}</p>
      ) : null}

      <p className="text-text/40 mt-6 text-xs tracking-wide">
        {list.total === 1
          ? tc("countOne", { count: list.total })
          : tc("countMany", { count: list.total })}
      </p>

      <div className="border-text/10 mt-4 overflow-x-auto border-t">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              <th className="py-3 pr-4 font-medium">{tc("columns.caseId")}</th>
              <th className="py-3 pr-4 font-medium">{tc("columns.type")}</th>
              <th className="py-3 pr-4 font-medium">{tc("columns.casino")}</th>
              <th className="py-3 pr-4 font-medium">{tc("columns.subject")}</th>
              <th className="py-3 pr-4 font-medium">{tc("columns.status")}</th>
              <th className="py-3 pr-4 font-medium">{tc("columns.source")}</th>
              <th className="py-3 font-medium">{tc("columns.created")}</th>
            </tr>
          </thead>
          <tbody>
            {list.rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-text/45 py-8">
                  {tc("empty")}
                </td>
              </tr>
            ) : (
              list.rows.map((row) => (
                <tr key={row.id} className="border-text/8 border-t align-top">
                  <td className="py-3.5 pr-4 tabular-nums">
                    <Link
                      href={`/admin/complaints/${row.caseId}`}
                      className="hover:text-accent"
                    >
                      {row.caseId}
                    </Link>
                  </td>
                  <td className="py-3.5 pr-4">{tc(`types.${row.type}`)}</td>
                  <td className="py-3.5 pr-4">
                    {row.casinoId ? (
                      <Link
                        href={`/admin/casinos/${row.casinoId}`}
                        className="hover:text-accent"
                      >
                        {row.casinoLabel}
                      </Link>
                    ) : row.casinoLabel ? (
                      <span className="text-text/70">
                        {tc("notInDatabase", { name: row.casinoLabel })}
                      </span>
                    ) : (
                      <span className="text-text/35">—</span>
                    )}
                  </td>
                  <td className="text-text/70 max-w-xs py-3.5 pr-4">
                    {row.subject}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={
                        row.status === "open"
                          ? "text-accent text-[11px] tracking-[0.14em] uppercase"
                          : "text-text/40 text-[11px] tracking-[0.14em] uppercase"
                      }
                    >
                      {tc(`status.${row.status}`)}
                    </span>
                  </td>
                  <td className="text-text/55 py-3.5 pr-4">
                    {tc(`sources.${row.source}`)}
                  </td>
                  <td className="text-text/55 py-3.5 tabular-nums">
                    {dateFmt.format(new Date(row.createdAt))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {list.pageCount > 1 ? (
        <div className="mt-6 flex items-center gap-4 text-sm">
          {list.page > 1 ? (
            <Link href={queryForPage(list.page - 1)} className="text-accent">
              {tc("previous")}
            </Link>
          ) : null}
          <span className="text-text/45">
            {tc("pageOf", { page: list.page, pageCount: list.pageCount })}
          </span>
          {list.page < list.pageCount ? (
            <Link href={queryForPage(list.page + 1)} className="text-accent">
              {tc("next")}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
