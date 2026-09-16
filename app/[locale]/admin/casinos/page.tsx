import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { listAdminCasinos } from "@/lib/admin/casinos";
import { adminInputClass, adminSelectClass } from "@/lib/admin/fields";

export const metadata: Metadata = {
  title: "Casinos",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
};

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminCasinosPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const q = query.q?.trim() ?? "";
  const status = query.status ?? "all";
  const casinos = await listAdminCasinos({
    q,
    status: status === "all" ? undefined : status,
  });

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
            Ledger
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">Casinos</h1>
          <p className="text-text/55 mt-3 max-w-xl text-sm">
            Drafts stay off the public site. Publish from the editor when the
            English review is ready.
          </p>
        </div>
        <Link
          href="/admin/casinos/new"
          className="bg-accent text-background hover:bg-accent-highlight inline-flex h-10 items-center px-4 text-sm font-medium"
        >
          New casino
        </Link>
      </div>

      <form className="mt-10 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or slug"
          className={`${adminInputClass} max-w-xs`}
        />
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
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              <th className="py-3 pr-4 font-medium">Name</th>
              <th className="py-3 pr-4 font-medium">Slug</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Rating</th>
              <th className="py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {casinos.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-text/45 py-8">
                  No casinos match.
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
                      {row.status}
                    </span>
                  </td>
                  <td className="text-text/70 py-3.5 pr-4 tabular-nums">
                    {row.overallRating == null ? "—" : row.overallRating.toFixed(1)}
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
