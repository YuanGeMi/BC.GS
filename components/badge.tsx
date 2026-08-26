import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeProps = {
  children: ReactNode;
  className?: string;
  wrap?: boolean;
};

export function Badge({ children, className, wrap = false }: BadgeProps) {
  return (
    <span
      className={cn(
        "bg-accent-highlight/12 text-accent-highlight inline-flex items-center rounded-full px-2.5 py-0.5 text-left text-[11px] font-medium tracking-wide",
        wrap ? "max-w-full whitespace-normal" : "whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}
