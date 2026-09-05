import { cn } from "@/lib/utils";

export type InitialsAvatarProps = {
  initials: string;
  size?: "sm" | "md";
  variant?: "solid" | "monogram";
  className?: string;
};

const sizeClasses = {
  sm: "size-8 text-[12px]",
  md: "size-10 text-[14px]",
} as const;

export function InitialsAvatar({
  initials,
  size = "md",
  variant = "solid",
  className,
}: InitialsAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full",
        sizeClasses[size],
        variant === "solid"
          ? "bg-accent/15 text-accent ring-accent/25 ring-2 ring-inset"
          : "text-accent ring-accent/70 ring-2 ring-inset",
        className,
      )}
    >
      <span className="font-display font-semibold leading-none tracking-[0.06em] translate-y-px">
        {initials}
      </span>
    </span>
  );
}
