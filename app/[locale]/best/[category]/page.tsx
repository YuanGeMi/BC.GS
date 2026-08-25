import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BestRankedList } from "@/components/best-ranked-list";
import { Button } from "@/components/button";
import { RatingStars } from "@/components/rating-stars";
import { Section } from "@/components/section";
import {
  getBestCategory,
  getFeaturedHighlight,
  getRankedCasinos,
  getRelatedBestCategories,
  getWelcomeBonus,
  bestCategories,
} from "@/data/best-categories";
import { localize, mockCasinos } from "@/data/mock-casinos";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string; category: string }>;
};

export function generateStaticParams() {
  return bestCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: slug } = await params;
  setRequestLocale(locale);

  const category = getBestCategory(slug);

  if (!category) {
    return {};
  }

  return {
    title: localize(category.seoTitle, locale),
    description: localize(category.seoDescription, locale),
  };
}

export default async function BestCategoryPage({ params }: Props) {
  const { locale, category: slug } = await params;
  setRequestLocale(locale);

  const category = getBestCategory(slug);

  if (!category) {
    notFound();
  }

  const t = await getTranslations("BestOfPage");
  const ranked = getRankedCasinos(category, mockCasinos);
  const related = getRelatedBestCategories(slug);
  const title = localize(category.title, locale);
  const description = localize(category.description, locale);

  const entries = ranked.map((casino, index) => ({
    rank: index + 1,
    featured: index === 0,
    name: localize(casino.name, locale),
    slug: casino.slug,
    logoUrl: casino.logoUrl,
    rating: casino.rating,
    badges: casino.badges.map((badge) => localize(badge, locale)),
    highlight: getFeaturedHighlight(casino, locale, category.highlightLabelEn),
    lede: casino.coverLede
      ? localize(casino.coverLede, locale)
      : undefined,
  }));

  return (
    <>
      <Section className="border-text/5 border-b pb-10 md:pb-12 lg:pb-14">
        <p className="text-accent mb-3 text-xs font-medium tracking-[0.22em] uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="text-text text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="text-text/60 mt-4 max-w-2xl text-base leading-relaxed">
          {description}
        </p>
        {ranked.length > 0 ? (
          <p className="text-text/40 mt-5 text-xs font-medium tracking-[0.16em] uppercase">
            {t("count", { count: ranked.length })}
          </p>
        ) : null}
      </Section>

      <Section>
        {entries.length > 0 ? (
          <BestRankedList
            entries={entries}
            editorsChoice={t("editorsChoice")}
            ctaLabel={t("cta")}
            rankLabel={(rank) => t("rankLabel", { rank })}
          />
        ) : (
          <div className="bg-card/40 ring-text/8 rounded-xl px-6 py-12 text-center ring-1">
            <p className="text-text text-base font-semibold tracking-tight">
              {t("empty.title")}
            </p>
            <p className="text-text/55 mt-2 text-sm leading-relaxed">
              {t("empty.body")}
            </p>
          </div>
        )}
      </Section>

      {ranked.length > 0 ? (
        <Section className="bg-card/30 border-y border-text/5">
          <h2 className="text-text mb-6 text-xl font-semibold tracking-tight md:text-2xl">
            {t("table.title")}
          </h2>
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <thead>
                <tr className="border-text/8 border-b">
                  <th
                    scope="col"
                    className="text-text/40 px-3 py-3 text-[11px] font-medium tracking-[0.14em] uppercase"
                  >
                    {t("table.rank")}
                  </th>
                  <th
                    scope="col"
                    className="text-text/40 px-3 py-3 text-[11px] font-medium tracking-[0.14em] uppercase"
                  >
                    {t("table.casino")}
                  </th>
                  <th
                    scope="col"
                    className="text-text/40 px-3 py-3 text-[11px] font-medium tracking-[0.14em] uppercase"
                  >
                    {t("table.rating")}
                  </th>
                  <th
                    scope="col"
                    className="text-text/40 px-3 py-3 text-[11px] font-medium tracking-[0.14em] uppercase"
                  >
                    {t("table.bonus")}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    <span className="sr-only">{t("table.cta")}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((casino, index) => {
                  const name = localize(casino.name, locale);
                  const rank = index + 1;

                  return (
                    <tr
                      key={casino.id}
                      className="border-text/8 hover:bg-card/50 border-b last:border-b-0"
                    >
                      <td
                        className={cn(
                          "font-display px-3 py-4 text-xl tabular-nums",
                          rank === 1 ? "text-accent" : "text-text/35",
                        )}
                      >
                        {rank}
                      </td>
                      <td className="text-text px-3 py-4 text-sm font-semibold tracking-tight">
                        <Link
                          href={`/casinos/${casino.slug}`}
                          className="hover:text-accent transition-colors duration-200"
                        >
                          {name}
                        </Link>
                      </td>
                      <td className="px-3 py-4">
                        <RatingStars rating={casino.rating} showValue size="sm" />
                      </td>
                      <td className="text-text/80 px-3 py-4 text-sm">
                        {getWelcomeBonus(casino, locale)}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <Button
                          href={`/casinos/${casino.slug}`}
                          variant="secondary"
                          size="sm"
                        >
                          {t("table.cta")}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      <Section>
        <h2 className="text-text mb-6 text-xl font-semibold tracking-tight md:text-2xl">
          {t("method.title")}
        </h2>
        <div className="max-w-2xl space-y-5">
          {category.methodology.map((paragraph) => (
            <p
              key={localize(paragraph, locale)}
              className="text-text/70 text-base leading-relaxed"
            >
              {localize(paragraph, locale)}
            </p>
          ))}
        </div>
      </Section>

      {related.length > 0 ? (
        <Section className="border-text/5 border-t">
          <h2 className="text-text mb-6 text-xl font-semibold tracking-tight md:text-2xl">
            {t("related.title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <Link
                key={item.slug}
                href={`/best/${item.slug}`}
                className="bg-card group ring-text/8 hover:ring-accent/30 rounded-xl p-5 ring-1 transition-all duration-300 ease-out hover:-translate-y-0.5"
              >
                <span className="text-accent/70 mb-3 block text-[11px] font-medium tracking-[0.18em] uppercase">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-text group-hover:text-accent-highlight text-base font-semibold tracking-tight transition-colors duration-200">
                  {localize(item.title, locale)}
                </h3>
                <p className="text-text/55 mt-2 text-sm leading-relaxed">
                  {localize(item.summary, locale)}
                </p>
                <p className="text-accent mt-4 text-sm font-medium">
                  {t("related.cta")}
                  <span
                    aria-hidden
                    className="ml-1 inline-block translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
