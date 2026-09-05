"use client";

import { useTranslations } from "next-intl";

import { InitialsAvatar } from "@/components/initials-avatar";
import { logout } from "@/lib/auth/actions";

type AccountControlsProps = {
  locale: string;
  name: string;
  initials: string;
};

export function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      aria-hidden
    >
      <path
        d="M6.5 3H4.2A1.2 1.2 0 0 0 3 4.2v7.6A1.2 1.2 0 0 0 4.2 13H6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 8h6.2M10.7 5.6 13.2 8l-2.5 2.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AccountControls({
  locale,
  name,
  initials,
}: AccountControlsProps) {
  const t = useTranslations("Nav");

  return (
    <div className="flex items-center gap-1.5">
      <span title={name} aria-label={name}>
        <InitialsAvatar
          initials={initials}
          size="sm"
          variant="monogram"
        />
      </span>
      <form action={logout.bind(null, locale)}>
        <button
          type="submit"
          aria-label={t("logout")}
          title={t("logout")}
          className="text-text/50 hover:text-accent inline-flex size-9 items-center justify-center rounded-full transition-colors"
        >
          <SignOutIcon className="size-5" />
        </button>
      </form>
    </div>
  );
}
