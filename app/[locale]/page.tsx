import { getTranslations, setRequestLocale } from "next-intl/server";

import { BonusCard } from "@/components/bonus-card";
import { CasinoCard, CasinoCardList } from "@/components/casino-card";
import { HomeHero } from "@/components/home-hero";
import { Section } from "@/components/section";
import { mockBonuses } from "@/data/mock-bonuses";
import { localize, mockCasinos } from "@/data/mock-casinos";
import { mockCategories } from "@/data/mock-categories";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string }>;
};

function SectionHeader({
  title,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8">
      <h2 className="text-text text-xl font-semibold tracking-tight md:text-2xl">
        {title}
      </h2>
      {viewAllHref && viewAllLabel ? (
        <Link
          href={viewAllHref}
          className="text-accent hover:text-accent-highlight shrink-0 text-sm font-medium transition-colors duration-200"
        >
          {viewAllLabel}
        </Link>
      ) : null}
    </div>
  );
}

function ReviewIcon({ name }: { name: "research" | "test" | "score" | "update" }) {
  const className = "text-accent h-5 w-5";

  if (name === "research") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M16.2 16.2 21 21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "test") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M8 7h8M8 12h5M8 17h7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="4"
          y="3.5"
          width="16"
          height="17"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (name === "score") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="m12 4.5 1.9 4.1 4.5.5-3.4 3.1.9 4.4L12 14.7 8.1 16.6l.9-4.4-3.4-3.1 4.5-.5L12 4.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 12a8 8 0 0 1 14.3-4.9M20 12a8 8 0 0 1-14.3 4.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 3.5v4h-4M6 20.5v-4h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");

  const [cover, ...restCasinos] = mockCasinos;
  const desk = restCasinos.slice(0, 3);
  const topCasinos = mockCasinos.slice(0, 8);
  const featuredBonuses = mockBonuses.slice(0, 6);

  const reviewSteps = [
    { icon: "research" as const, title: t("review.researchTitle"), body: t("review.researchBody") },
    { icon: "test" as const, title: t("review.testTitle"), body: t("review.testBody") },
    { icon: "score" as const, title: t("review.scoreTitle"), body: t("review.scoreBody") },
    { icon: "update" as const, title: t("review.updateTitle"), body: t("review.updateBody") },
  ];

  return (
    <>
      <HomeHero
        locale={locale}
        cover={cover}
        desk={desk}
        casinos={mockCasinos}
      />

      {/* Top-rated casinos */}
      <Section>
        <SectionHeader
          title={t("casinos.title")}
          viewAllHref="/casinos"
          viewAllLabel={t("casinos.viewAll")}
        />
        <CasinoCardList className="xl:grid-cols-4">
          {topCasinos.map((casino) => (
            <CasinoCard
              key={casino.id}
              name={localize(casino.name, locale)}
              logoUrl={casino.logoUrl}
              rating={casino.rating}
              badges={casino.badges.map((badge) => localize(badge, locale))}
              highlights={casino.highlights.map((item) => ({
                label: localize(item.label, locale),
                value: localize(item.value, locale),
              }))}
              ctaHref={`/casinos/${casino.slug}`}
              ctaLabel={t("casinos.cta")}
            />
          ))}
        </CasinoCardList>
      </Section>

      {/* Featured bonuses */}
      <Section className="bg-card/30 border-y border-text/5">
        <SectionHeader
          title={t("bonuses.title")}
          viewAllHref="/bonuses"
          viewAllLabel={t("bonuses.viewAll")}
        />
        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {featuredBonuses.map((bonus) => (
            <BonusCard
              key={bonus.id}
              casinoName={localize(bonus.casinoName, locale)}
              logoUrl={bonus.logoUrl}
              title={localize(bonus.title, locale)}
              bonusValue={localize(bonus.bonusValue, locale)}
              ctaHref={`/casinos/${bonus.casinoSlug}`}
              ctaLabel={t("bonuses.cta")}
            />
          ))}
        </div>
      </Section>

      {/* Category quick links */}
      <Section>
        <SectionHeader title={t("categories.title")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/best/${category.slug}`}
              className={cn(
                "bg-card group ring-text/8 hover:ring-accent/30 rounded-xl p-5 ring-1 transition-all duration-300 ease-out hover:-translate-y-0.5",
              )}
            >
              <span className="text-accent/70 mb-3 block text-[11px] font-medium tracking-[0.18em] uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-text group-hover:text-accent-highlight text-base font-semibold tracking-tight transition-colors duration-200">
                {localize(category.title, locale)}
              </h3>
              <p className="text-text/55 mt-2 text-sm leading-relaxed">
                {localize(category.description, locale)}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      {/* Trust / editorial */}
      <Section id="review-process" className="border-t border-text/5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-accent mb-3 text-xs font-medium tracking-[0.22em] uppercase">
            {t("review.eyebrow")}
          </p>
          <h2 className="text-text text-xl font-semibold tracking-tight md:text-2xl">
            {t("review.title")}
          </h2>
          <p className="text-text/60 mt-3 text-sm leading-relaxed md:text-base">
            {t("review.subtitle")}
          </p>
        </div>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reviewSteps.map((step, index) => (
            <li
              key={step.title}
              className="bg-card/60 ring-text/8 rounded-xl p-5 ring-1"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="bg-accent/10 ring-accent/20 inline-flex h-10 w-10 items-center justify-center rounded-full ring-1">
                  <ReviewIcon name={step.icon} />
                </span>
                <span className="text-text/25 text-xs font-medium tracking-[0.16em] uppercase">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-text text-sm font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="text-text/55 mt-2 text-sm leading-relaxed">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
