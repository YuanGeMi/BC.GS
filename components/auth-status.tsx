"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";

import { AccountControls, SignOutIcon } from "@/components/account-menu";
import { Link } from "@/i18n/navigation";
import { logout } from "@/lib/auth/actions";
import {
  displayNameFromAuthMetadata,
  formatReviewDisplayName,
  publicReviewName,
  reviewInitials,
} from "@/lib/reviews/display-name";
import { createClient } from "@/lib/supabase/client";

type HeaderUser = {
  name: string;
  initials: string;
};

function headerUserFromAuth(user: User | null): HeaderUser | null {
  if (!user?.email) return null;

  const fullName = publicReviewName(
    displayNameFromAuthMetadata(user.user_metadata),
    user.email,
  );

  return {
    name: formatReviewDisplayName(fullName),
    initials: reviewInitials(fullName),
  };
}

type AuthStatusProps = {
  locale: string;
  /** Extra controls shown in the mobile drawer when logged in. */
  mobile?: boolean;
};

export function AuthStatus({ locale, mobile = false }: AuthStatusProps) {
  const t = useTranslations("Nav");
  const [user, setUser] = useState<HeaderUser | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    void supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setUser(headerUserFromAuth(data.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(headerUserFromAuth(session?.user ?? null));
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (mobile) {
    if (user === undefined) {
      return null;
    }

    if (!user) {
      return null;
    }

    return (
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
    );
  }

  if (user === undefined) {
    return (
      <div
        aria-hidden
        className="bg-text/8 h-7 w-[7.25rem] animate-pulse rounded-md md:h-9 md:w-24"
      />
    );
  }

  if (user) {
    return (
      <AccountControls
        locale={locale}
        name={user.name}
        initials={user.initials}
      />
    );
  }

  return (
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
  );
}
