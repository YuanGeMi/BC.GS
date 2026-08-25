import { getTranslations } from "next-intl/server";

import { Container } from "@/components/section";
import { localize, type MockCasino } from "@/data/mock-casinos";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const INDEX_SIZE = 8;

type Props = {
  locale: string;
  casinos: MockCasino[];
};

export async function HomeHeroIndex({ locale, casinos }: Props) {
  const t = await getTranslations("HomePage.hero");
  const ranked = [...casinos]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, INDEX_SIZE);

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
            {t("index.kicker")}
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
          {t("index.title", { count: ranked.length })}
        </h1>
        <p
          className={cn(
            "text-text/55 mt-4 max-w-xl text-sm leading-relaxed sm:text-base",
            "animate-[hero-fade_0.8s_ease-out_0.1s_both]",
          )}
        >
          {t("index.subtitle")}
        </p>

        <ol
          className={cn(
            "border-text/10 mt-10 border-t",
            "animate-[hero-fade_0.8s_ease-out_0.16s_both]",
          )}
        >
          {ranked.map((casino, index) => {
            const name = localize(casino.name, locale);
            const note =
              casino.highlights[0]
                ? localize(casino.highlights[0].value, locale)
                : casino.badges[0]
                  ? localize(casino.badges[0], locale)
                  : "";
            const lead = index === 0;

            return (
              <li key={casino.id} className="border-text/10 border-b">
                <Link
                  href={`/casinos/${casino.slug}`}
                  className={cn(
                    "group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-4 transition-colors duration-200 sm:grid-cols-[3rem_minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:gap-x-6",
                    lead && "py-6",
                  )}
                >
                  <span
                    className={cn(
                      "font-display tabular-nums",
                      lead
                        ? "text-accent text-2xl sm:text-3xl"
                        : "text-text/30 text-lg",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0">
                    <span
                      className={cn(
                        "text-text group-hover:text-accent-highlight block tracking-tight transition-colors duration-200",
                        lead
                          ? "font-display text-2xl leading-none sm:text-3xl"
                          : "text-sm font-semibold sm:text-base",
                      )}
                    >
                      {name}
                    </span>
                    {note ? (
                      <span className="text-text/45 mt-1 block text-xs sm:hidden">
                        {note}
                      </span>
                    ) : null}
                  </span>

                  {note ? (
                    <span className="text-text/45 hidden truncate text-sm sm:block">
                      {note}
                    </span>
                  ) : (
                    <span className="hidden sm:block" />
                  )}

                  <span
                    className={cn(
                      "text-accent shrink-0 tabular-nums",
                      lead
                        ? "font-display text-2xl leading-none sm:text-3xl"
                        : "text-sm sm:text-base",
                    )}
                  >
                    {casino.rating.toFixed(1)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/casinos"
            className="text-background bg-accent hover:bg-accent-highlight inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium tracking-wide transition-all duration-200 hover:scale-[1.02]"
          >
            {t("browseAll")}
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="#review-process"
            className="text-text/60 hover:text-accent text-sm transition-colors duration-200"
          >
            {t("methodLink")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
