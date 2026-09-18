import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ReviewActions } from "@/components/admin/review-actions";
import { Link } from "@/i18n/navigation";
import { getAdminReview } from "@/lib/admin/reviews";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.reviews" });
  return { title: t("detailTitle") };
}

export default async function AdminReviewDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const tr = await getTranslations("Admin.reviews");

  const review = await getAdminReview(id);
  if (!review) notFound();

  const dateTimeFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  function statusLabel(value: string) {
    if (value === "unpublished") return tr("statusUnpublished");
    if (t.has(`status.${value}`)) return t(`status.${value}`);
    return value;
  }

  return (
    <section className="max-w-3xl">
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        {tr("eyebrow")}
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">
        {tr("detailTitle")}
      </h1>
      <p className="text-text/45 mt-2 text-xs tracking-[0.16em] uppercase">
        {statusLabel(review.status)}
      </p>

      <dl className="mt-10 space-y-5 text-sm">
        <div>
          <dt className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
            {tr("columns.casino")}
          </dt>
          <dd className="mt-1">
            <Link
              href={`/casinos/${review.casinoSlug}`}
              className="text-accent hover:text-accent-highlight"
            >
              {review.casinoName}
            </Link>
            <span className="text-text/35 mx-2">/</span>
            <Link
              href={`/admin/casinos/${review.casinoId}`}
              className="text-text/55 hover:text-accent"
            >
              {tr("editInDesk")}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
            {tr("columns.author")}
          </dt>
          <dd className="mt-1">
            {review.authorName}
            <span className="text-text/40 ml-2">{review.authorEmail}</span>
          </dd>
        </div>
        <div>
          <dt className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
            {tr("columns.rating")}
          </dt>
          <dd className="mt-1 tabular-nums">{review.rating} / 5</dd>
        </div>
        <div>
          <dt className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
            {tr("submitted")}
          </dt>
          <dd className="mt-1 tabular-nums">
            {dateTimeFmt.format(new Date(review.createdAt))}
          </dd>
        </div>
        {review.moderatedAt ? (
          <div>
            <dt className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              {tr("moderated")}
            </dt>
            <dd className="mt-1 tabular-nums">
              {dateTimeFmt.format(new Date(review.moderatedAt))}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="border-text/10 mt-10 border-t pt-8">
        <p className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
          {tr("body")}
        </p>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
          {review.body}
        </p>
      </div>

      <div className="mt-10">
        <ReviewActions id={review.id} status={review.status} />
      </div>

      <Link
        href="/admin/reviews"
        className="text-text/45 hover:text-accent mt-10 inline-block text-sm"
      >
        {tr("backToQueue")}
      </Link>
    </section>
  );
}
