import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type LogoProps = {
  className?: string;
  size?: "sm" | "md";
  priority?: boolean;
};

const sizeMap = {
  sm: { width: 40, height: 30 },
  md: { width: 40, height: 31 },
} as const;

export function Logo({ className, size = "md", priority = false }: LogoProps) {
  const dims = sizeMap[size];

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center transition-opacity duration-200 hover:opacity-90",
        className,
      )}
      aria-label="BC.GS home"
    >
      <Image
        src="/brand/logo-mark-bc.png"
        alt="BC.GS"
        width={dims.width}
        height={dims.height}
        className="h-auto w-auto"
        priority={priority}
      />
    </Link>
  );
}
