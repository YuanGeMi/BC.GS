import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthFormShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthFormShell({
  eyebrow,
  title,
  description,
  children,
}: AuthFormShellProps) {
  return (
    <section className="mx-auto w-full max-w-md px-4 py-14 sm:px-6 lg:py-20">
      <p className="text-accent mb-3 text-center text-xs font-medium tracking-[0.22em] uppercase">
        {eyebrow}
      </p>
      <h1 className="text-text text-center text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-text/60 mt-3 text-center text-sm leading-relaxed">
        {description}
      </p>
      <div
        className={cn(
          "bg-card/35 ring-text/8 mt-8 rounded-lg p-5 ring-1",
          "sm:p-6",
        )}
      >
        {children}
      </div>
    </section>
  );
}
