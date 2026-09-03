import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type CasinoCardHighlight = {
  label: string;
  value: string;
};

export type CasinoCardProps = {
  name: string;
  logoUrl?: string;
  rating: number;
  highlights: CasinoCardHighlight[];
  badges?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
};

export function CasinoCard({
  name,
  rating,
  highlights,
  badges,
  ctaLabel,
  ctaHref,
  className,
}: CasinoCardProps) {
  const score = rating.toFixed(1);
  const facts = highlights.slice(0, 3);
  const kicker = badges?.[0];

  return (
    <article
      className={cn(
        "group border-text/10 hover:bg-card/50 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 border-b py-5 pr-2 transition-colors duration-200 sm:grid-cols-[6.5rem_minmax(0,1.3fr)_minmax(0,2fr)_auto] sm:items-center sm:gap-x-6 sm:pr-3",
        className,
      )}
    >
      <div className="row-span-2 flex items-baseline gap-1 sm:row-span-1">
        <p className="font-display text-accent text-[2.35rem] leading-none tracking-tight tabular-nums sm:text-4xl">
          {score}
        </p>
        <p className="text-text/40 text-sm tabular-nums">/5</p>
      </div>

      <div className="min-w-0">
        {kicker ? (
          <p className="text-accent/80 mb-1 text-[11px] font-medium tracking-[0.16em] uppercase">
            {kicker}
          </p>
        ) : null}
        <h3 className="text-text truncate text-lg font-semibold tracking-tight">
          {name}
        </h3>
        {badges && badges.length > 1 ? (
          <p className="text-text/40 mt-1 truncate text-xs">
            {badges.slice(1).join(" · ")}
          </p>
        ) : null}
      </div>

      <dl className="col-span-2 mt-4 grid grid-cols-3 gap-3 sm:col-span-1 sm:mt-0">
        {facts.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="text-text/35 truncate text-[10px] tracking-[0.12em] uppercase">
              {item.label}
            </dt>
            <dd className="text-text mt-1 truncate text-sm">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="col-start-2 mt-4 sm:col-start-auto sm:mt-0 sm:justify-self-end">
        <Link
          href={ctaHref ?? "#"}
          className="text-text/70 hover:text-accent inline-flex items-center gap-1.5 pe-0.5 text-sm transition-colors duration-200"
        >
          {ctaLabel}
          <span
            aria-hidden
            className="translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

export function CasinoCardList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-text/10 border-t", className)}>{children}</div>
  );
}
