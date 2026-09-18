import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ReviewActions } from "@/components/admin/review-actions";
import { Link } from "@/i18n/navigation";
import { adminInputClass, adminSelectClass } from "@/lib/admin/fields";
import {
  listAdminReviewCasinos,
  listAdminReviews,
} from "@/lib/admin/reviews";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    status?: string;
    casino?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.reviews" });
  return { title: t("title") };
}

export default async function AdminReviewsPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const tr = await getTranslations("Admin.reviews");

  const status = query.status ?? "pending";
  const casinoId = query.casino ?? "";
  const from = query.from ?? "";
  const to = query.to ?? "";
  const page = Number.parseInt(query.page ?? "1", 10);

  const [casinos, list] = await Promise.all([
    listAdminReviewCasinos(),
    listAdminReviews({
      status,
      casinoId: casinoId || undefined,
      from: from || undefined,
      to: to || undefined,
      page: Number.isFinite(page) ? page : 1,
    }),
  ]);

  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const queryForPage = (nextPage: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (casinoId) params.set("casino", casinoId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/reviews?${qs}` : "/admin/reviews";
  };

  function statusLabel(value: string) {
    if (value === "unpublished") return tr("statusUnpublished");
    if (t.has(`status.${value}`)) return t(`status.${value}`);
    return value;
  }

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        {tr("eyebrow")}
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">{tr("title")}</h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">{tr("lede")}</p>

      <form className="mt-10 flex flex-wrap gap-3" method="get">
        <select
          name="status"
          defaultValue={status}
          className={`${adminSelectClass} max-w-[10rem]`}
        >
          <option value="pending">{t("status.pending")}</option>
          <option value="published">{t("status.published")}</option>
          <option value="unpublished">{tr("statusUnpublished")}</option>
          <option value="rejected">{t("status.rejected")}</option>
          <option value="all">{t("status.all")}</option>
        </select>
        <select
          name="casino"
          defaultValue={casinoId}
          className={`${adminSelectClass} max-w-[14rem]`}
        >
          <option value="">{tr("allCasinos")}</option>
          {casinos.map((row) => (
            <option key={row.id} value={row.id}>
              {row.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="from"
          defaultValue={from}
          aria-label={tr("fromDate")}
          className={`${adminInputClass} max-w-[11rem]`}
        />
        <input
          type="date"
          name="to"
          defaultValue={to}
          aria-label={tr("toDate")}
          className={`${adminInputClass} max-w-[11rem]`}
        />
        <button
          type="submit"
          className="ring-text/20 hover:ring-accent/50 h-11 px-4 text-sm ring-1"
        >
          {t("actions.filter")}
        </button>
      </form>

      <p className="text-text/40 mt-6 text-xs tracking-wide">
        {list.total === 1
          ? tr("countOne", { count: list.total })
          : tr("countMany", { count: list.total })}
      </p>

      <div className="border-text/10 mt-4 overflow-x-auto border-t">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              <th className="py-3 pr-4 font-medium">{tr("columns.author")}</th>
              <th className="py-3 pr-4 font-medium">{tr("columns.casino")}</th>
              <th className="py-3 pr-4 font-medium">{tr("columns.rating")}</th>
              <th className="py-3 pr-4 font-medium">{tr("columns.excerpt")}</th>
              <th className="py-3 pr-4 font-medium">{tr("columns.status")}</th>
              <th className="py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {list.rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-text/45 py-8">
                  {tr("empty")}
                </td>
              </tr>
            ) : (
              list.rows.map((row) => (
                <tr key={row.id} className="border-text/8 border-t align-top">
                  <td className="py-3.5 pr-4">
                    <Link
                      href={`/admin/reviews/${row.id}`}
                      className="hover:text-accent"
                    >
                      {row.authorName}
                    </Link>
                    <p className="text-text/40 mt-1 text-xs">{row.authorEmail}</p>
                    <p className="text-text/35 mt-1 text-xs tabular-nums">
                      {dateFmt.format(new Date(row.createdAt))}
                    </p>
                  </td>
                  <td className="py-3.5 pr-4">{row.casinoName}</td>
                  <td className="py-3.5 pr-4 tabular-nums">{row.rating}/5</td>
                  <td className="text-text/70 max-w-xs py-3.5 pr-4">
                    {row.bodyPreview}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={
                        row.status === "pending"
                          ? "text-accent text-[11px] tracking-[0.14em] uppercase"
                          : "text-text/40 text-[11px] tracking-[0.14em] uppercase"
                      }
                    >
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <ReviewActions id={row.id} status={row.status} />
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
              {tr("previous")}
            </Link>
          ) : null}
          <span className="text-text/45">
            {tr("pageOf", { page: list.page, pageCount: list.pageCount })}
          </span>
          {list.page < list.pageCount ? (
            <Link href={queryForPage(list.page + 1)} className="text-accent">
              {tr("next")}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
