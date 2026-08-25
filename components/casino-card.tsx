"use client";

import Image from "next/image";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { useCardStyle } from "@/components/card-style-provider";
import { RatingStars } from "@/components/rating-stars";
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
        width={48}
        height={48}
        className="h-12 w-12 rounded-md object-contain"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="from-accent/20 to-accent/5 text-accent ring-accent/20 flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br text-sm font-semibold tracking-wide ring-1"
    >
      {initials || "BC"}
    </div>
  );
}

function RowCard({
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
        "group border-text/10 hover:bg-card/50 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 border-b py-5 transition-colors duration-200 sm:grid-cols-[6.5rem_minmax(0,1.3fr)_minmax(0,2fr)_auto] sm:items-center sm:gap-x-6",
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
          className="text-text/70 hover:text-accent inline-flex items-center gap-1.5 text-sm transition-colors duration-200"
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

function TileCard({
  name,
  logoUrl,
  rating,
  highlights,
  badges = [],
  ctaLabel = "Read review",
  ctaHref = "#",
  className,
}: CasinoCardProps) {
  return (
    <article
      className={cn(
        "bg-card group ring-text/8 hover:ring-accent/25 flex flex-col rounded-xl p-5 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.65)] ring-1 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <LogoMark name={name} logoUrl={logoUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="text-text truncate text-base font-semibold tracking-tight">
            {name}
          </h3>
          <RatingStars rating={rating} showValue size="sm" className="mt-1.5" />
        </div>
      </div>

      {badges.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <Badge key={badge}>{badge}</Badge>
          ))}
        </div>
      ) : null}

      <dl className="border-text/8 mb-5 space-y-2 border-t pt-4">
        {highlights.slice(0, 3).map((item) => (
          <div
            key={item.label}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <dt className="text-text/45 shrink-0">{item.label}</dt>
            <dd className="text-text/90 text-right font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto">
        <Button href={ctaHref} variant="primary" size="sm" className="w-full">
          {ctaLabel}
        </Button>
      </div>
    </article>
  );
}

export function CasinoCard(props: CasinoCardProps) {
  const { style } = useCardStyle();

  if (style === "card") {
    return <TileCard {...props} />;
  }

  return <RowCard {...props} />;
}

export function CasinoCardList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { style } = useCardStyle();

  return (
    <div
      className={cn(
        style === "card"
          ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          : "border-text/10 border-t",
        style === "card" && className,
      )}
    >
      {children}
    </div>
  );
}
