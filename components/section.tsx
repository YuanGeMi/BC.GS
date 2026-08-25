import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

/** Consistent max-width and horizontal padding wrapper. */
export function Container({
  children,
  className,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export type SectionProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  as?: ElementType;
  id?: string;
};

/** Section spacing + container used across page layouts. */
export function Section({
  children,
  className,
  containerClassName,
  as: Tag = "section",
  id,
}: SectionProps) {
  return (
    <Tag id={id} className={cn("py-12 md:py-16 lg:py-20", className)}>
      <Container className={containerClassName}>{children}</Container>
    </Tag>
  );
}
