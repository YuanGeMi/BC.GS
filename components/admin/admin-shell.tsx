"use client";

import { logoutEverywhere } from "@/lib/auth/logout-everywhere";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  email: string;
  locale: string;
  children: React.ReactNode;
};

export function AdminShell({ email, locale, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="bg-background flex min-h-dvh min-w-0">
      <aside className="border-text/10 hidden w-56 shrink-0 flex-col border-r md:flex">
        <Link href="/admin" className="border-text/10 border-b px-5 py-6">
          <p className="text-accent/80 text-[10px] font-medium tracking-[0.28em] uppercase">
            BC.GS
          </p>
          <p className="font-display mt-1 text-2xl tracking-tight italic">Desk</p>
        </Link>
        <AdminNav pathname={pathname} className="flex-1 px-3 py-4" />
        <AdminAccount email={email} locale={locale} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-text/10 flex items-center justify-between gap-3 border-b px-4 py-3 md:hidden">
          <Link href="/admin">
            <p className="font-display text-lg italic">Desk</p>
          </Link>
          <form action={logoutEverywhere.bind(null, locale)}>
            <button
              type="submit"
              className="text-text/45 hover:text-accent text-[11px] tracking-wide uppercase"
            >
              Log out
            </button>
          </form>
        </div>
        <div className="border-text/10 overflow-x-auto border-b md:hidden">
          <AdminNav
            pathname={pathname}
            className="flex gap-1 px-3 py-2"
            horizontal
          />
        </div>
        <div className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">{children}</div>
      </div>
    </div>
  );
}

function AdminNav({
  pathname,
  className,
  horizontal = false,
}: {
  pathname: string;
  className?: string;
  horizontal?: boolean;
}) {
  return (
    <nav aria-label="Admin" className={className}>
      {ADMIN_NAV.map((item) => {
        const current =
          item.href.startsWith("/admin/catalogs")
            ? pathname.startsWith("/admin/catalogs")
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block px-2 py-2 text-[13px] tracking-wide transition-colors",
              horizontal && "whitespace-nowrap",
              current
                ? "text-accent"
                : "text-text/55 hover:text-text",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AdminAccount({ email, locale }: { email: string; locale: string }) {
  return (
    <div className="border-text/10 border-t px-5 py-4">
      <p className="text-text/70 truncate text-xs">{email}</p>
      <form action={logoutEverywhere.bind(null, locale)} className="mt-2">
        <button
          type="submit"
          className="text-text/40 hover:text-accent text-[11px] tracking-[0.14em] uppercase transition-colors"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
