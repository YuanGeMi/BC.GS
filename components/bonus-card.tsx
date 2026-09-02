import Image from "next/image";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export type BonusCardProps = {
  casinoName: string;
  logoUrl?: string;
  title: string;
  bonusValue: string;
  badge?: string;
  ctaLabel: string;
  ctaHref?: string;
  className?: string;
};

function LogoMark({
  casinoName,
  logoUrl,
}: {
  casinoName: string;
  logoUrl?: string;
}) {
  const initials = casinoName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${casinoName} logo`}
        width={40}
        height={40}
        className="h-10 w-10 rounded-md object-contain"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="from-accent/20 to-accent/5 text-accent ring-accent/20 flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br text-xs font-semibold tracking-wide ring-1"
    >
      {initials || "BC"}
    </div>
  );
}

export function BonusCard({
  casinoName,
  logoUrl,
  title,
  bonusValue,
  badge,
  ctaLabel,
  ctaHref = "#",
  className,
}: BonusCardProps) {
  return (
    <article
      className={cn(
        "bg-card group ring-text/8 hover:ring-accent/25 rounded-xl ring-1 transition-all duration-300 ease-out",
        "sm:flex sm:flex-col sm:p-5 sm:shadow-[0_8px_30px_-18px_rgba(0,0,0,0.65)] sm:hover:-translate-y-1 sm:hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      <div className="flex items-center gap-3 p-3 sm:hidden">
        <LogoMark casinoName={casinoName} logoUrl={logoUrl} />
        <div className="min-w-0 flex-1">
          <p className="text-text/50 truncate text-[11px] font-medium tracking-[0.12em] uppercase">
            {casinoName}
          </p>
          <h3 className="text-text mt-0.5 truncate text-sm font-semibold tracking-tight">
            {title}
          </h3>
          <p className="text-accent mt-0.5 text-sm font-semibold tracking-tight">
            {bonusValue}
          </p>
        </div>
        <Button
          href={ctaHref}
          variant="secondary"
          size="sm"
          className="shrink-0 px-3"
        >
          {ctaLabel}
        </Button>
      </div>

      <div className="hidden sm:flex sm:h-full sm:flex-col">
        <div className="mb-4 flex items-center gap-3">
          <LogoMark casinoName={casinoName} logoUrl={logoUrl} />
          <p className="text-text/55 truncate text-xs font-medium tracking-[0.12em] uppercase">
            {casinoName}
          </p>
        </div>

        {badge ? (
          <div className="mb-3">
            <Badge>{badge}</Badge>
          </div>
        ) : null}

        <h3 className="text-text mb-2 text-base leading-snug font-semibold tracking-tight">
          {title}
        </h3>

        <p className="text-accent mb-5 text-2xl font-semibold tracking-tight">
          {bonusValue}
        </p>

        <div className="mt-auto">
          <Button href={ctaHref} variant="secondary" size="sm" className="w-full">
            {ctaLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
