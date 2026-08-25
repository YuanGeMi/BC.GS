"use client";

import type { ReactNode } from "react";

import { useHeroStyle } from "@/components/hero-style-provider";

type Props = {
  masthead: ReactNode;
  finder: ReactNode;
  index: ReactNode;
};

export function HomeHeroSwitch({ masthead, finder, index }: Props) {
  const { style } = useHeroStyle();

  if (style === "finder") return finder;
  if (style === "index") return index;
  return masthead;
}
