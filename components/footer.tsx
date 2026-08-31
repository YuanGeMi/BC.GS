import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { MAIN_NAV } from "@/lib/nav";

const LEGAL_LINKS = [
  { href: "/privacy", labelKey: "privacy" as const },
  { href: "/terms", labelKey: "terms" as const },
  { href: "/responsible-gambling", labelKey: "responsibleGambling" as const },
];

export async function Footer() {
  const tNav = await getTranslations("Nav");
  const tFooter = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-text/8 bg-card/40 mt-auto w-full min-w-0 border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo size="sm" />
            <p className="text-text/50 mt-3 text-sm leading-relaxed">
              {tFooter("tagline")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="text-text/40 mb-3 text-xs font-medium tracking-[0.16em] uppercase">
                {tFooter("explore")}
              </p>
              <ul className="space-y-2.5">
                {MAIN_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-text/70 hover:text-accent text-sm transition-colors duration-200"
                    >
                      {tNav(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-text/40 mb-3 text-xs font-medium tracking-[0.16em] uppercase">
                {tFooter("legal")}
              </p>
              <ul className="space-y-2.5">
                {LEGAL_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-text/70 hover:text-accent text-sm transition-colors duration-200"
                    >
                      {tFooter(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-text/8 mt-10 border-t pt-6">
          <p className="text-text/40 text-xs tracking-wide">
            {tFooter("copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
