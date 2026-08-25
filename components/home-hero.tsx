import { getTranslations } from "next-intl/server";

import { HomeHeroFinder } from "@/components/home-hero-finder";
import { HomeHeroIndex } from "@/components/home-hero-index";
import { HomeHeroSwitch } from "@/components/home-hero-switch";
import { RatingStars } from "@/components/rating-stars";
import { Container } from "@/components/section";
import { localize, type MockCasino } from "@/data/mock-casinos";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  locale: string;
  cover: MockCasino;
  desk: MockCasino[];
  casinos: MockCasino[];
};

export async function HomeHero({ locale, cover, desk, casinos }: HomeHeroProps) {
  return (
    <HomeHeroSwitch
      masthead={<HomeHeroMasthead locale={locale} cover={cover} desk={desk} />}
      finder={<HomeHeroFinder locale={locale} casinos={casinos} />}
      index={<HomeHeroIndex locale={locale} casinos={casinos} />}
    />
  );
}

async function HomeHeroMasthead({
  locale,
  cover,
  desk,
}: Omit<HomeHeroProps, "casinos">) {
  const t = await getTranslations("HomePage.hero");
  const coverName = localize(cover.name, locale);
  const coverLede = cover.coverLede
    ? localize(cover.coverLede, locale)
    : t("coverFallback");

  return (
    <section className="border-text/10 relative overflow-hidden border-b">
      {/* Quiet paper grain — editorial, not SaaS glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"
      />

      <Container className="relative">
        {/* Masthead strip — publication, not product landing */}
        <div
          className={cn(
            "border-text/10 flex flex-col gap-2 border-b py-5 sm:flex-row sm:items-end sm:justify-between",
            "animate-[hero-fade_0.7s_ease-out_both]",
          )}
        >
          <div>
            <p className="font-display text-accent text-3xl leading-none tracking-tight sm:text-4xl">
              BC.GS
            </p>
            <p className="text-text/45 mt-2 max-w-sm text-sm leading-snug">
              {t("masthead")}
            </p>
          </div>
          <p className="text-text/40 text-[11px] font-medium tracking-[0.18em] uppercase">
            {t("updated")}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 lg:gap-0">
          {/* Cover story */}
          <div
            className={cn(
              "border-text/10 py-10 sm:py-14 lg:col-span-7 lg:border-r lg:pr-10 lg:py-16",
              "animate-[hero-fade_0.8s_ease-out_0.08s_both]",
            )}
          >
            <p className="text-accent mb-6 text-[11px] font-medium tracking-[0.2em] uppercase">
              {t("coverKicker")}
            </p>

            <div className="flex items-start gap-5 sm:gap-8">
              <div className="shrink-0">
                <p className="font-display text-accent text-6xl leading-none tracking-tight tabular-nums sm:text-7xl lg:text-8xl">
                  {cover.rating.toFixed(1)}
                </p>
                <RatingStars
                  rating={cover.rating}
                  size="sm"
                  className="mt-3"
                />
              </div>

              <div className="min-w-0 pt-1 sm:pt-2">
                <h1 className="font-display text-text text-3xl leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
                  {coverName}
                </h1>
                <p className="text-text/60 mt-4 max-w-md text-sm leading-relaxed sm:text-base">
                  {coverLede}
                </p>
              </div>
            </div>

            <dl className="border-text/10 mt-10 grid max-w-lg grid-cols-1 gap-3 border-t pt-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-text/10">
              {cover.highlights.slice(0, 3).map((item) => (
                <div key={localize(item.label, locale)} className="sm:px-4 first:sm:pl-0 last:sm:pr-0">
                  <dt className="text-text/40 text-[11px] tracking-[0.14em] uppercase">
                    {localize(item.label, locale)}
                  </dt>
                  <dd className="text-text mt-1 text-sm font-medium">
                    {localize(item.value, locale)}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10">
              <Link
                href={`/casinos/${cover.slug}`}
                className="text-background bg-accent hover:bg-accent-highlight inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium tracking-wide transition-all duration-200 hover:scale-[1.02]"
              >
                {t("coverCta")}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* Desk rail */}
          <aside
            className={cn(
              "border-text/10 border-t py-10 lg:col-span-5 lg:border-t-0 lg:py-16 lg:pl-10",
              "animate-[hero-fade_0.8s_ease-out_0.18s_both]",
            )}
          >
            <p className="text-text/40 mb-6 text-[11px] font-medium tracking-[0.2em] uppercase">
              {t("deskLabel")}
            </p>

            <ol className="divide-text/10 divide-y">
              {desk.map((item, index) => {
                const name = localize(item.name, locale);

                return (
                  <li key={item.id}>
                    <Link
                      href={`/casinos/${item.slug}`}
                      className="group hover:bg-card/40 -mx-2 flex items-center gap-4 rounded-md px-2 py-4 transition-colors duration-200"
                      style={{
                        animationDelay: `${220 + index * 70}ms`,
                      }}
                    >
                      <span className="text-text/30 font-display w-7 shrink-0 text-lg tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-text group-hover:text-accent-highlight truncate text-sm font-semibold tracking-tight transition-colors duration-200">
                          {name}
                        </p>
                        <p className="text-text/40 mt-0.5 text-xs">
                          {localize(item.highlights[0]?.value ?? { en: "" }, locale)}
                        </p>
                      </div>
                      <span className="text-accent shrink-0 text-sm tabular-nums">
                        {item.rating.toFixed(1)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>

            <div className="border-text/10 mt-8 space-y-3 border-t pt-6">
              <Link
                href="/casinos"
                className="text-text/70 hover:text-accent group flex items-center justify-between text-sm transition-colors duration-200"
              >
                <span>{t("browseAll")}</span>
                <span
                  aria-hidden
                  className="translate-x-0 transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
              <Link
                href="#review-process"
                className="text-text/70 hover:text-accent group flex items-center justify-between text-sm transition-colors duration-200"
              >
                <span>{t("methodLink")}</span>
                <span
                  aria-hidden
                  className="translate-x-0 transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
