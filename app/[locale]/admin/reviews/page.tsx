import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { ReviewActions } from "@/components/admin/review-actions";
import { Link } from "@/i18n/navigation";
import { adminInputClass, adminSelectClass } from "@/lib/admin/fields";
import {
  listAdminReviewCasinos,
  listAdminReviews,
} from "@/lib/admin/reviews";

export const metadata: Metadata = {
  title: "Reviews",
};

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

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminReviewsPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

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

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        Queue
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">Reviews</h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">
        Pending first. Publish, reject, or later unpublish. The visitor’s text
        is not edited here.
      </p>

      <form className="mt-10 flex flex-wrap gap-3" method="get">
        <select
          name="status"
          defaultValue={status}
          className={`${adminSelectClass} max-w-[10rem]`}
        >
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
          <option value="rejected">Rejected</option>
          <option value="all">All statuses</option>
        </select>
        <select
          name="casino"
          defaultValue={casinoId}
          className={`${adminSelectClass} max-w-[14rem]`}
        >
          <option value="">All casinos</option>
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
          aria-label="From date"
          className={`${adminInputClass} max-w-[11rem]`}
        />
        <input
          type="date"
          name="to"
          defaultValue={to}
          aria-label="To date"
          className={`${adminInputClass} max-w-[11rem]`}
        />
        <button
          type="submit"
          className="ring-text/20 hover:ring-accent/50 h-11 px-4 text-sm ring-1"
        >
          Filter
        </button>
      </form>

      <p className="text-text/40 mt-6 text-xs tracking-wide">
        {list.total} {list.total === 1 ? "review" : "reviews"}
      </p>

      <div className="border-text/10 mt-4 overflow-x-auto border-t">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              <th className="py-3 pr-4 font-medium">Author</th>
              <th className="py-3 pr-4 font-medium">Casino</th>
              <th className="py-3 pr-4 font-medium">Rating</th>
              <th className="py-3 pr-4 font-medium">Excerpt</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {list.rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-text/45 py-8">
                  Nothing in this queue.
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
                      {row.status}
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
              Previous
            </Link>
          ) : null}
          <span className="text-text/45">
            Page {list.page} of {list.pageCount}
          </span>
          {list.page < list.pageCount ? (
            <Link href={queryForPage(list.page + 1)} className="text-accent">
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
