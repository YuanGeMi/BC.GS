import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import {
  getAdminBonusCatalogs,
  listAdminBonuses,
} from "@/lib/admin/bonuses";
import { adminSelectClass } from "@/lib/admin/fields";

export const metadata: Metadata = {
  title: "Bonuses",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ casino?: string; type?: string; status?: string }>;
};

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminBonusesPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

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

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
            Offer
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">Bonuses</h1>
          <p className="text-text/55 mt-3 max-w-xl text-sm">
            Public pages only show published bonuses on published casinos.
            Expiry is displayed, not used to hide a row.
          </p>
        </div>
        <Link
          href="/admin/bonuses/new"
          className="bg-accent text-background hover:bg-accent-highlight inline-flex h-10 items-center px-4 text-sm font-medium"
        >
          New bonus
        </Link>
      </div>

      <form className="mt-10 flex flex-wrap gap-3" method="get">
        <select
          name="casino"
          defaultValue={casinoId}
          className={`${adminSelectClass} max-w-[14rem]`}
        >
          <option value="">All casinos</option>
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
          <option value="">All types</option>
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
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button
          type="submit"
          className="ring-text/20 hover:ring-accent/50 h-11 px-4 text-sm ring-1"
        >
          Filter
        </button>
      </form>

      <div className="border-text/10 mt-8 overflow-x-auto border-t">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              <th className="py-3 pr-4 font-medium">Title</th>
              <th className="py-3 pr-4 font-medium">Casino</th>
              <th className="py-3 pr-4 font-medium">Type</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Expiry</th>
              <th className="py-3 font-medium">Order</th>
            </tr>
          </thead>
          <tbody>
            {bonuses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-text/45 py-8">
                  No bonuses match.
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
                        {row.status}
                      </span>
                    </td>
                    <td className="text-text/55 py-3.5 pr-4">
                      {row.expiryDate
                        ? dateFmt.format(new Date(row.expiryDate))
                        : "—"}
                      {expired ? (
                        <span className="text-accent/80 ml-2 text-[11px] tracking-wide uppercase">
                          expired
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
