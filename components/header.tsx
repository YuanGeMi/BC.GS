"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";

import { AccountControls, SignOutIcon } from "@/components/account-menu";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Logo } from "@/components/logo";
import { Link, usePathname } from "@/i18n/navigation";
import { logout } from "@/lib/auth/actions";
import { MAIN_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-5" aria-hidden>
      <span
        className={cn(
          "bg-text absolute left-0 block h-px w-full transition-all duration-200",
          open ? "top-1.5 rotate-45" : "top-0",
        )}
      />
      <span
        className={cn(
          "bg-text absolute top-1.5 left-0 block h-px w-full transition-opacity duration-200",
          open ? "opacity-0" : "opacity-100",
        )}
      />
      <span
        className={cn(
          "bg-text absolute left-0 block h-px w-full transition-all duration-200",
          open ? "top-1.5 -rotate-45" : "top-3",
        )}
      />
    </span>
  );
}

type HeaderProps = {
  locale: string;
  user: { name: string; initials: string } | null;
};

export function Header({ locale, user }: HeaderProps) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-text/8 bg-background/85 sticky top-0 z-50 w-full min-w-0 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo size="md" priority />

        <nav
          aria-label={t("primary")}
          className="hidden items-center gap-7 md:flex"
        >
          {MAIN_NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              (item.labelKey === "bestOf" && pathname.startsWith("/best/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm tracking-wide transition-colors duration-200",
                  isActive
                    ? "text-accent-highlight"
                    : "text-text/70 hover:text-text",
                )}
              >
                {t(item.labelKey)}
                <span
                  aria-hidden
                  className={cn(
                    "bg-accent absolute -bottom-1 left-0 h-px transition-all duration-200",
                    isActive ? "w-full opacity-100" : "w-0 opacity-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 md:gap-4">
          <div className="hidden md:block">
            <Suspense fallback={null}>
              <LocaleSwitcher />
            </Suspense>
          </div>

          {user ? (
            <AccountControls
              locale={locale}
              name={user.name}
              initials={user.initials}
            />
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                href="/login"
                className="text-text/55 hover:text-text text-[11px] font-medium tracking-[0.08em] transition-colors md:text-sm md:tracking-wide"
              >
                {t("login")}
              </Link>
              <Link
                href="/signup"
                className="bg-accent text-background hover:bg-accent-highlight inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.06em] transition-colors md:h-9 md:rounded-md md:px-3 md:text-sm md:tracking-wide"
              >
                {t("signup")}
              </Link>
            </div>
          )}

          <button
            type="button"
            className="text-text/60 hover:text-text inline-flex size-9 items-center justify-center transition-colors md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            onClick={() => setOpen((value) => !value)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-text/8 bg-background overflow-hidden border-t transition-[max-height,opacity] duration-300 ease-out md:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 border-t-0 opacity-0",
        )}
      >
        <nav
          aria-label={t("mobile")}
          className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6"
        >
          {MAIN_NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              (item.labelKey === "bestOf" && pathname.startsWith("/best/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm transition-colors duration-200",
                  isActive
                    ? "bg-card text-accent-highlight"
                    : "text-text/75 hover:bg-card hover:text-text",
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}

          <div className="border-text/8 mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t px-3 pt-4">
            <Suspense fallback={null}>
              <LocaleSwitcher />
            </Suspense>
            {user ? (
              <>
                <span aria-hidden className="text-text/25 text-xs">
                  |
                </span>
                <form action={logout.bind(null, locale)}>
                  <button
                    type="submit"
                    className="text-text/50 hover:text-accent inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide transition-colors"
                  >
                    <SignOutIcon className="size-3.5" />
                    {t("logout")}
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
