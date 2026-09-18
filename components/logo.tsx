import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { getSiteConfig } from "@/lib/site";
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

export async function Logo({
  className,
  size = "md",
  priority = false,
}: LogoProps) {
  const { siteName, logoUrl } = await getSiteConfig();
  const dims = sizeMap[size];
  const remote = /^https:\/\//i.test(logoUrl);

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center transition-opacity duration-200 hover:opacity-90",
        className,
      )}
      aria-label={`${siteName} home`}
    >
      {remote ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin may set any https logo host
        <img
          src={logoUrl}
          alt={siteName}
          width={dims.width}
          height={dims.height}
          className="object-contain"
          style={{ width: dims.width, height: dims.height }}
        />
      ) : (
        <Image
          src={logoUrl}
          alt={siteName}
          width={dims.width}
          height={dims.height}
          className="object-contain"
          style={{ width: dims.width, height: dims.height }}
          priority={priority}
        />
      )}
    </Link>
  );
}
