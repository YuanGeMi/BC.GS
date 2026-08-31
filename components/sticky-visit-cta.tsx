"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import type { TrackAffiliateClickInput } from "@/lib/track-affiliate-click";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label: string;
  name: string;
  trackClick?: TrackAffiliateClickInput;
};

export function StickyVisitCta({ href, label, name, trackClick }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 420);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "border-text/10 bg-background/90 pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-text/70 min-w-0 truncate text-sm">
          <span className="text-text font-medium">{name}</span>
        </p>
        <Button href={href} size="sm" className="shrink-0" trackClick={trackClick}>
          {label}
        </Button>
      </div>
    </div>
  );
}
