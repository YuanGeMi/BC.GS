import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { listAdminCategories } from "@/lib/admin/categories";

export const metadata: Metadata = {
  title: "Categories",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const categories = await listAdminCategories();

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
            Best of
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">
            Categories
          </h1>
          <p className="text-text/55 mt-3 max-w-xl text-sm">
            Ranked lists at /best/[slug]. Drafts stay off /best-of and the
            sitemap.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-accent text-background hover:bg-accent-highlight inline-flex h-10 items-center px-4 text-sm font-medium"
        >
          New category
        </Link>
      </div>

      <div className="border-text/10 mt-10 overflow-x-auto border-t">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              <th className="py-3 pr-4 font-medium">Name</th>
              <th className="py-3 pr-4 font-medium">Slug</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 font-medium">Casinos</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-text/45 py-8">
                  No categories yet.
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
                      {row.status}
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
