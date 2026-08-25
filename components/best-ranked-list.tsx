import Image from "next/image";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { RatingStars } from "@/components/rating-stars";
import { cn } from "@/lib/utils";

export type RankedCasinoEntry = {
  rank: number;
  featured: boolean;
  name: string;
  slug: string;
  logoUrl?: string;
  rating: number;
  badges: string[];
  highlight: { label: string; value: string };
  lede?: string;
};

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
        width={56}
        height={56}
        className="h-14 w-14 rounded-lg object-contain"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="from-accent/20 to-accent/5 text-accent ring-accent/20 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br text-base font-semibold tracking-wide ring-1"
    >
      {initials || "BC"}
    </div>
  );
}

function RankedEntry({
  entry,
  editorsChoice,
  ctaLabel,
  rankLabel,
}: {
  entry: RankedCasinoEntry;
  editorsChoice: string;
  ctaLabel: string;
  rankLabel: string;
}) {
  const { rank, featured, name, slug, logoUrl, rating, badges, highlight, lede } =
    entry;

  return (
    <li>
      <article
        className={cn(
          "bg-card ring-text/8 rounded-xl p-5 ring-1 sm:p-6",
          featured &&
            "from-accent/[0.07] ring-accent/35 bg-gradient-to-br to-transparent shadow-[0_16px_40px_-24px_rgba(199,166,106,0.55)]",
        )}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex min-w-0 flex-1 items-start gap-4 sm:items-center sm:gap-5">
            <p
              className={cn(
                "font-display w-12 shrink-0 text-right text-4xl leading-none tracking-tight tabular-nums sm:w-14 sm:text-5xl",
                featured ? "text-accent" : "text-text/25",
              )}
              aria-label={rankLabel}
            >
              {rank}
            </p>

            <LogoMark name={name} logoUrl={logoUrl} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {featured ? <Badge>{editorsChoice}</Badge> : null}
                {!featured && badges[0] ? (
                  <p className="text-accent/80 text-[11px] font-medium tracking-[0.16em] uppercase">
                    {badges[0]}
                  </p>
                ) : null}
              </div>
              <h2 className="text-text mt-2 truncate text-lg font-semibold tracking-tight sm:text-xl">
                {name}
              </h2>
              <RatingStars rating={rating} showValue className="mt-1.5" />
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:w-[min(100%,22rem)] lg:shrink-0">
            <div className="min-w-0 sm:flex-1">
              {highlight.label ? (
                <p className="text-text/40 text-[11px] tracking-[0.14em] uppercase">
                  {highlight.label}
                </p>
              ) : null}
              <p className="text-text mt-1 text-sm font-medium sm:text-base">
                {highlight.value}
              </p>
            </div>
            <Button
              href={`/casinos/${slug}`}
              size="sm"
              className="w-full shrink-0 sm:w-auto"
            >
              {ctaLabel}
            </Button>
          </div>
        </div>

        {featured && lede ? (
          <p className="text-text/55 mt-5 max-w-2xl border-t border-text/8 pt-5 text-sm leading-relaxed">
            {lede}
          </p>
        ) : null}
      </article>
    </li>
  );
}

export function BestRankedList({
  entries,
  editorsChoice,
  ctaLabel,
  rankLabel,
}: {
  entries: RankedCasinoEntry[];
  editorsChoice: string;
  ctaLabel: string;
  rankLabel: (rank: number) => string;
}) {
  return (
    <ol className="space-y-4">
      {entries.map((entry) => (
        <RankedEntry
          key={entry.slug}
          entry={entry}
          editorsChoice={editorsChoice}
          ctaLabel={ctaLabel}
          rankLabel={rankLabel(entry.rank)}
        />
      ))}
    </ol>
  );
}
