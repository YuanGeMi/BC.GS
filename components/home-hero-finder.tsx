"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { RatingStars } from "@/components/rating-stars";
import { Container } from "@/components/section";
import { localize, type MockCasino } from "@/data/mock-casinos";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const INTENTS = ["allrounder", "payout", "license", "live"] as const;

type IntentId = (typeof INTENTS)[number];

const INTENT_SLUGS: Record<IntentId, string> = {
  allrounder: "nova-prime",
  payout: "aurelia-club",
  license: "northline",
  live: "sable-room",
};

type Props = {
  locale: string;
  casinos: MockCasino[];
};

export function HomeHeroFinder({ locale, casinos }: Props) {
  const t = useTranslations("HomePage.hero");
  const [intent, setIntent] = useState<IntentId>("allrounder");

  const featured = useMemo(() => {
    const slug = INTENT_SLUGS[intent];
    return casinos.find((casino) => casino.slug === slug) ?? casinos[0];
  }, [casinos, intent]);

  const related = useMemo(
    () => casinos.filter((casino) => casino.id !== featured.id).slice(0, 3),
    [casinos, featured.id],
  );

  const name = localize(featured.name, locale);
  const lede = featured.coverLede
    ? localize(featured.coverLede, locale)
    : t("coverFallback");

  return (
    <section className="border-text/10 relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"
      />

      <Container className="relative py-12 sm:py-16 lg:py-20">
        <div
          className={cn(
            "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
            "animate-[hero-fade_0.7s_ease-out_both]",
          )}
        >
          <p className="text-accent text-[11px] font-medium tracking-[0.2em] uppercase">
            {t("finder.kicker")}
          </p>
          <p className="text-text/40 text-[11px] font-medium tracking-[0.18em] uppercase">
            {t("updated")}
          </p>
        </div>

        <h1
          className={cn(
            "font-display text-text mt-6 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]",
            "animate-[hero-fade_0.8s_ease-out_0.06s_both]",
          )}
        >
          {t("finder.title")}
        </h1>
        <p
          className={cn(
            "text-text/55 mt-4 max-w-xl text-sm leading-relaxed sm:text-base",
            "animate-[hero-fade_0.8s_ease-out_0.1s_both]",
          )}
        >
          {t("finder.subtitle")}
        </p>

        <ol
          className={cn(
            "border-text/10 mt-10 grid border-t sm:grid-cols-2",
            "animate-[hero-fade_0.8s_ease-out_0.16s_both]",
          )}
        >
          {INTENTS.map((id, index) => {
            const active = intent === id;

            return (
              <li
                key={id}
                className={cn(
                  "border-text/10 border-b",
                  index % 2 === 0 && "sm:border-r",
                )}
              >
                <button
                  type="button"
                  onClick={() => setIntent(id)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-baseline gap-4 px-0 py-5 text-left transition-colors duration-200 sm:px-5",
                    index % 2 === 0 && "sm:pl-0",
                    index % 2 === 1 && "sm:pr-0",
                    active ? "text-text" : "text-text/50 hover:text-text/80",
                  )}
                >
                  <span
                    className={cn(
                      "font-display w-7 shrink-0 text-lg tabular-nums",
                      active ? "text-accent" : "text-text/25",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] leading-snug sm:text-base">
                    {t(`finder.prompts.${id}`)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <article
          className={cn(
            "mt-12 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12",
            "animate-[hero-fade_0.8s_ease-out_0.22s_both]",
          )}
        >
          <div className="lg:col-span-8">
            <p className="text-accent text-[11px] font-medium tracking-[0.2em] uppercase">
              {t(`finder.answers.${intent}`)}
            </p>
            <h2 className="font-display text-text mt-3 text-3xl leading-[1.05] tracking-tight sm:text-4xl">
              {name}
            </h2>
            <p className="text-text/60 mt-4 max-w-2xl text-sm leading-relaxed sm:text-base">
              {lede}
            </p>

            <dl className="border-text/10 mt-8 grid max-w-lg grid-cols-1 gap-3 border-t pt-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-text/10">
              {featured.highlights.slice(0, 3).map((item) => (
                <div
                  key={localize(item.label, locale)}
                  className="sm:px-4 first:sm:pl-0 last:sm:pr-0"
                >
                  <dt className="text-text/40 text-[11px] tracking-[0.14em] uppercase">
                    {localize(item.label, locale)}
                  </dt>
                  <dd className="text-text mt-1 text-sm font-medium">
                    {localize(item.value, locale)}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={`/casinos/${featured.slug}`}
                className="text-background bg-accent hover:bg-accent-highlight inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium tracking-wide transition-all duration-200 hover:scale-[1.02]"
              >
                {t("coverCta")}
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="#review-process"
                className="text-text/60 hover:text-accent text-sm transition-colors duration-200"
              >
                {t("methodLink")}
              </Link>
            </div>
          </div>

          <aside className="border-text/10 lg:col-span-4 lg:border-l lg:pl-12">
            <p className="text-text/40 text-[11px] font-medium tracking-[0.2em] uppercase">
              {t("finder.scoreLabel")}
            </p>
            <div className="mt-4 flex items-end gap-3">
              <p className="font-display text-accent text-6xl leading-none tracking-tight tabular-nums">
                {featured.rating.toFixed(1)}
              </p>
              <RatingStars rating={featured.rating} size="sm" className="mb-1.5" />
            </div>
            <p className="text-text/45 mt-4 text-sm leading-relaxed">
              {t("finder.scoreNote")}
            </p>
          </aside>
        </article>

        <div className="border-text/10 mt-12 border-t pt-8">
          <p className="text-text/40 mb-4 text-[11px] font-medium tracking-[0.2em] uppercase">
            {t("finder.related")}
          </p>
          <ul className="grid gap-px sm:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/casinos/${item.slug}`}
                  className="group hover:bg-card/40 -mx-2 flex items-baseline justify-between gap-4 rounded-md px-2 py-3 transition-colors duration-200"
                >
                  <span className="text-text group-hover:text-accent-highlight truncate text-sm font-semibold tracking-tight transition-colors duration-200">
                    {localize(item.name, locale)}
                  </span>
                  <span className="text-accent shrink-0 text-sm tabular-nums">
                    {item.rating.toFixed(1)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/casinos"
            className="text-text/60 hover:text-accent mt-4 inline-flex items-center gap-2 text-sm transition-colors duration-200"
          >
            {t("browseAll")}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
