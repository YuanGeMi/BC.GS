import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { ContentStatus, ReviewStatus } from "@/lib/db-enums";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.meta" });
  return { title: t("overview") };
}

export default async function AdminHomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const tDesk = await getTranslations("Admin.desk");

  const [pendingReviews, draftCasinos, publishedCasinos] = await Promise.all([
    prisma.userReview.count({ where: { status: ReviewStatus.pending } }),
    prisma.casino.count({ where: { status: ContentStatus.draft } }),
    prisma.casino.count({ where: { status: ContentStatus.published } }),
  ]);

  const today = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <section>
      <header className="border-text/10 border-b pb-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
              {tDesk("eyebrow")}
            </p>
            <h1 className="font-display mt-3 text-5xl tracking-tight italic md:text-6xl">
              {tDesk("title")}
            </h1>
            <p className="text-text/50 mt-4 text-sm leading-relaxed">
              {tDesk("lede")}
            </p>
          </div>
          <p className="text-text/35 text-[11px] tracking-[0.16em] uppercase">
            {today}
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-text/10 sm:grid-cols-3">
          <Stat
            label={tDesk("stats.reviewsPending")}
            value={pendingReviews}
            emphasize={pendingReviews > 0}
            href={
              pendingReviews > 0 ? "/admin/reviews?status=pending" : undefined
            }
          />
          <Stat
            label={tDesk("stats.casinosPublished")}
            value={publishedCasinos}
          />
          <Stat label={tDesk("stats.casinosDraft")} value={draftCasinos} />
        </dl>
      </header>

      {pendingReviews > 0 ? (
        <Link
          href="/admin/reviews?status=pending"
          className="border-accent/25 bg-accent/[0.06] hover:bg-accent/[0.1] mt-8 flex items-center justify-between gap-4 border px-4 py-3 transition-colors"
        >
          <div>
            <p className="text-accent text-[11px] font-medium tracking-[0.16em] uppercase">
              {tDesk("needsAttention")}
            </p>
            <p className="text-text/80 mt-1 text-sm">
              {pendingReviews === 1
                ? tDesk("pendingOne")
                : tDesk("pendingMany", { count: pendingReviews })}
            </p>
          </div>
          <span className="text-accent text-sm font-medium whitespace-nowrap">
            {t("actions.openQueue")}
          </span>
        </Link>
      ) : null}

      <div className="mt-12">
        <p className="text-text/40 text-[11px] font-medium tracking-[0.18em] uppercase">
          {tDesk("sections")}
        </p>
        <ul className="border-text/10 mt-4 grid grid-cols-1 gap-px overflow-hidden border-y bg-text/10 lg:grid-cols-2">
          {ADMIN_NAV.map((item, index) => (
            <li key={item.href} className="bg-background">
              <Link
                href={item.href}
                className="group hover:bg-text/[0.03] flex h-full items-baseline gap-4 px-4 py-5 transition-colors sm:gap-5 sm:px-5"
              >
                <span className="text-text/25 group-hover:text-accent/70 w-6 shrink-0 text-right font-mono text-[11px] tabular-nums transition-colors">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-text group-hover:text-accent flex flex-wrap items-baseline gap-x-3 gap-y-1 transition-colors">
                    <span className="font-display text-xl tracking-tight sm:text-2xl">
                      {t(`nav.${item.labelKey}`)}
                    </span>
                    <span className="text-text/35 text-[10px] tracking-[0.16em] uppercase">
                      {tDesk(`sectionsMeta.${item.labelKey}.kicker`)}
                    </span>
                  </span>
                  <span className="text-text/45 mt-1 block text-sm leading-relaxed">
                    {tDesk(`sectionsMeta.${item.labelKey}.blurb`)}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="text-text/20 group-hover:text-accent shrink-0 text-sm transition-colors"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  emphasize,
  href,
}: {
  label: string;
  value: number;
  emphasize?: boolean;
  href?: string;
}) {
  const inner = (
    <>
      <dt className="text-text/40 text-[10px] tracking-[0.14em] uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "font-display mt-2 text-3xl tracking-tight tabular-nums",
          emphasize ? "text-accent" : "text-text",
        )}
      >
        {value}
      </dd>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="bg-background hover:bg-card block px-5 py-4 transition-colors sm:px-6"
      >
        {inner}
      </Link>
    );
  }

  return <div className="bg-background px-5 py-4 sm:px-6">{inner}</div>;
}
