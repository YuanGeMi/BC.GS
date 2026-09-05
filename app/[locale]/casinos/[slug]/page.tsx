import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { CasinoCard, CasinoCardList } from "@/components/casino-card";
import { CasinoReviewJsonLd } from "@/components/casino-review-json-ld";
import { RatingStars } from "@/components/rating-stars";
import { Section } from "@/components/section";
import { StickyVisitCta } from "@/components/sticky-visit-cta";
import { UserReviewList } from "@/components/reviews/user-review-list";
import { WriteReview } from "@/components/reviews/write-review";
import { getAuthUser } from "@/lib/auth/session";
import { getBonusesForCasino } from "@/lib/bonuses";
import {
  getCasinoBySlug,
  getCasinoSeoMetadata,
  getPublishedCasinoSlugs,
  getRelatedCasinos,
  type CasinoDetailView,
} from "@/lib/casinos";
import {
  getPublishedUserReviewsPage,
  hasUserReviewedCasino,
  userNeedsDisplayName,
} from "@/lib/reviews/queries";
import { pageAlternates, truncateMetaDescription } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const SCORE_KEYS = [
  "bonuses",
  "gameVariety",
  "support",
  "payoutSpeed",
  "trust",
] as const satisfies ReadonlyArray<keyof CasinoDetailView["scores"]>;

function LogoMark({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={64}
        height={64}
        className="h-16 w-16 rounded-lg object-contain"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="from-accent/20 to-accent/5 text-accent ring-accent/20 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br text-lg font-semibold tracking-wide ring-1"
    >
      {initials || "BC"}
    </div>
  );
}

export async function generateStaticParams() {
  const slugs = await getPublishedCasinoSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [meta, t] = await Promise.all([
    getCasinoSeoMetadata(slug, locale),
    getTranslations("CasinoDetail"),
  ]);

  if (!meta) {
    return {};
  }

  const title =
    meta.seoTitle?.trim() || t("seoFallbackTitle", { name: meta.name });
  const description =
    meta.seoDescription?.trim() ||
    truncateMetaDescription(meta.reviewFirstParagraph);

  return {
    title,
    description,
    ...pageAlternates(`/casinos/${slug}`),
  };
}

export default async function CasinoDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [casino, bonuses] = await Promise.all([
    getCasinoBySlug(slug, locale),
    getBonusesForCasino(slug, locale),
  ]);

  if (!casino) {
    notFound();
  }

  const t = await getTranslations("CasinoDetail");
  const tFilters = await getTranslations("CasinosPage");
  const authUser = await getAuthUser();
  const userId = authUser?.id;
  const [related, reviewPage, hasReviewed, askForName] = await Promise.all([
    getRelatedCasinos(slug, locale, 4),
    getPublishedUserReviewsPage(casino.id),
    hasUserReviewedCasino(userId, casino.id),
    userNeedsDisplayName(userId),
  ]);
  const trackVisit = { casinoId: casino.id, locale };

  const facts = [
    {
      label: t("facts.license"),
      value: casino.licenses
        .map((id) => tFilters(`licenses.${id}`))
        .join(" · "),
    },
    {
      label: t("facts.established"),
      value: casino.establishedYear ? String(casino.establishedYear) : "—",
    },
    {
      label: t("facts.minDeposit"),
      value: casino.minDeposit,
    },
    {
      label: t("facts.withdrawal"),
      value: casino.withdrawalTime,
    },
    {
      label: t("facts.payments"),
      value: casino.payments
        .map((id) => tFilters(`payments.${id}`))
        .join(" · "),
    },
    {
      label: t("facts.providers"),
      value: casino.providers
        .map((id) => tFilters(`providers.${id}`))
        .join(" · "),
    },
  ];

  return (
    <>
      <CasinoReviewJsonLd casino={casino} locale={locale} slug={slug} />
      <Section className="border-text/5 border-b pb-10 md:pb-12 lg:pb-14">
        <p className="text-accent mb-6 text-xs font-medium tracking-[0.22em] uppercase">
          {t("eyebrow")}
        </p>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <LogoMark name={casino.name} logoUrl={casino.logoUrl} />
            <div className="min-w-0">
              <h1 className="text-text text-3xl font-semibold tracking-tight md:text-4xl">
                {casino.name}
              </h1>
              <RatingStars rating={casino.rating} showValue className="mt-2" />
              {casino.badges.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {casino.badges.map((badge) => (
                    <Badge key={badge}>{badge}</Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <Button
            href={casino.affiliateUrl}
            size="lg"
            className="w-full shrink-0 sm:w-auto"
            trackClick={trackVisit}
          >
            {t("visit")}
          </Button>
        </div>
      </Section>

      <Section className="py-8 md:py-10 lg:py-12">
        <dl className="border-text/8 bg-card/40 ring-text/8 grid grid-cols-2 gap-px overflow-hidden rounded-xl ring-1 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-background/60 px-4 py-4">
              <dt className="text-text/40 text-[11px] tracking-[0.14em] uppercase">
                {fact.label}
              </dt>
              <dd className="text-text mt-1.5 text-sm leading-snug font-medium">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section className="bg-card/30 border-text/5 border-y">
        <h2 className="text-text mb-6 text-xl font-semibold tracking-tight md:text-2xl">
          {t("verdict.title")}
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="bg-card ring-text/8 rounded-xl p-5 ring-1">
            <p className="text-text mb-4 text-sm font-semibold tracking-tight">
              {t("verdict.pros")}
            </p>
            <ul className="space-y-3">
              {casino.pros.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed">
                  <span className="text-accent mt-0.5 shrink-0" aria-hidden>
                    ✓
                  </span>
                  <span className="text-text/75">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card ring-text/8 rounded-xl p-5 ring-1">
            <p className="text-text mb-4 text-sm font-semibold tracking-tight">
              {t("verdict.cons")}
            </p>
            <ul className="space-y-3">
              {casino.cons.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed">
                  <span className="text-text/35 mt-0.5 shrink-0" aria-hidden>
                    ×
                  </span>
                  <span className="text-text/75">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {bonuses.length > 0 ? (
        <Section className="!pt-16 md:!pt-20 lg:!pt-24">
          <h2 className="text-text mb-6 text-xl font-semibold tracking-tight md:text-2xl">
            {t("bonus.title")}
          </h2>
          <div className="space-y-5">
            {bonuses.map((bonus) => {
              const terms = [
                bonus.wageringRequirement
                  ? {
                      label: t("bonus.wagering"),
                      value: bonus.wageringRequirement,
                    }
                  : null,
                bonus.minDeposit
                  ? {
                      label: t("bonus.minDeposit"),
                      value: bonus.minDeposit,
                    }
                  : null,
                bonus.expiryDate
                  ? { label: t("bonus.expiry"), value: bonus.expiryDate }
                  : null,
                bonus.code
                  ? { label: t("bonus.code"), value: bonus.code }
                  : null,
              ].filter((item) => item !== null);

              return (
                <div
                  key={bonus.id}
                  className="bg-card ring-text/8 rounded-xl p-6 ring-1 md:p-8"
                >
                  <p className="text-text/50 text-xs font-medium tracking-[0.14em] uppercase">
                    {bonus.title}
                  </p>
                  <p className="text-accent mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                    {bonus.amount}
                  </p>
                  <dl className="border-text/8 mt-6 grid grid-cols-2 gap-4 border-t pt-5 sm:grid-cols-4">
                    {terms.map((term) => (
                      <div key={term.label}>
                        <dt className="text-text/40 text-[11px] tracking-[0.12em] uppercase">
                          {term.label}
                        </dt>
                        <dd className="text-text mt-1 text-sm font-medium">
                          {term.value}
                        </dd>
                      </div>
                    ))}
                    <div className="col-span-2 sm:col-span-1 sm:flex sm:items-end">
                      <Button
                        href={casino.affiliateUrl}
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        trackClick={{ ...trackVisit, bonusId: bonus.id }}
                      >
                        {t("bonus.cta")}
                      </Button>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>
        </Section>
      ) : null}

      <Section className="pt-0 md:pt-0 lg:pt-0">
        <h2 className="text-text mb-6 text-xl font-semibold tracking-tight md:text-2xl">
          {t("review.title", { name: casino.name })}
        </h2>
        <div className="max-w-2xl space-y-5">
          {casino.review.map((paragraph) => (
            <p
              key={paragraph}
              className="text-text/70 text-base leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </Section>

      <Section className="pt-0 md:pt-0 lg:pt-0">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-text text-xl font-semibold tracking-tight md:text-2xl">
            {t("userReviews.title")}
          </h2>
          <WriteReview
            casinoId={casino.id}
            casinoSlug={slug}
            isLoggedIn={Boolean(userId)}
            hasReviewed={hasReviewed}
            askForName={askForName}
          />
        </div>
        <UserReviewList
          casinoId={casino.id}
          initialReviews={reviewPage.reviews}
          initialCursor={reviewPage.nextCursor}
          locale={locale}
        />
      </Section>

      <Section className="pt-0 md:pt-0 lg:pt-0">
        <h2 className="text-text mb-6 text-xl font-semibold tracking-tight md:text-2xl">
          {t("scores.title")}
        </h2>
        <ul className="space-y-4">
          {SCORE_KEYS.map((key) => {
            const score = casino.scores[key];
            const width = `${(score / 5) * 100}%`;

            return (
              <li
                key={key}
                className="grid items-center gap-3 sm:grid-cols-[10rem_minmax(0,1fr)_auto]"
              >
                <p className="text-text/70 text-sm">{t(`scores.${key}`)}</p>
                <div className="bg-text/8 h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-accent h-full rounded-full"
                    style={{ width }}
                  />
                </div>
                <RatingStars rating={score} showValue size="sm" />
              </li>
            );
          })}
        </ul>
      </Section>

      {related.length > 0 ? (
        <Section className="border-text/5 border-t">
          <h2 className="text-text mb-6 text-xl font-semibold tracking-tight md:text-2xl">
            {t("related.title")}
          </h2>
          <CasinoCardList className="xl:grid-cols-4">
            {related.map((item) => (
              <CasinoCard
                key={item.id}
                name={item.name}
                logoUrl={item.logoUrl}
                rating={item.rating}
                badges={item.badges}
                highlights={item.highlights}
                ctaHref={`/casinos/${item.slug}`}
                ctaLabel={t("related.cta")}
              />
            ))}
          </CasinoCardList>
        </Section>
      ) : null}

      <div className="h-16" aria-hidden />

      <StickyVisitCta
        href={casino.affiliateUrl}
        label={t("visit")}
        name={casino.name}
        trackClick={trackVisit}
      />
    </>
  );
}
