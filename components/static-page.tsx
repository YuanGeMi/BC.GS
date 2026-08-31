import { getTranslations } from "next-intl/server";
import ReactMarkdown from "react-markdown";

import { Section } from "@/components/section";
import { Link } from "@/i18n/navigation";
import type { StaticPageView } from "@/lib/static-pages";
import { cn } from "@/lib/utils";

type Props = {
  locale: string;
  page: StaticPageView;
};

function formatUpdated(date: Date, locale: string) {
  const tag = locale === "zh" ? "zh-CN" : locale === "th" ? "th-TH" : "en-GB";

  return new Intl.DateTimeFormat(tag, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

const linkClassName =
  "text-accent hover:text-accent-highlight font-medium transition-colors duration-200";

export async function StaticPage({ locale, page }: Props) {
  const t = await getTranslations("LegalPage");

  return (
    <Section containerClassName="max-w-2xl">
      <p className="text-accent mb-3 text-xs font-medium tracking-[0.22em] uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="text-text text-3xl font-semibold tracking-tight md:text-4xl">
        {page.title}
      </h1>
      <p className="text-text/40 mt-3 text-sm">
        {t("lastUpdated", { date: formatUpdated(page.updatedAt, locale) })}
      </p>

      <div
        className={cn(
          "mt-12 space-y-10",
          "[&_h2:not(:first-child)]:mt-10",
          "[&_p+ul]:mt-4",
          "[&_p+a]:mt-5",
          "[&_p:has(+a)]:mb-0",
        )}
      >
        <ReactMarkdown
          components={{
            h2: ({ children }) => (
              <h2 className="text-text text-xl font-semibold tracking-tight">
                {children}
              </h2>
            ),
            p: ({ children }) => (
              <p className="text-text/70 text-base leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc space-y-2 pl-5">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="text-text/70 text-base leading-relaxed">{children}</li>
            ),
            a: ({ href, children }) => {
              if (!href) {
                return <span>{children}</span>;
              }

              const isInternal =
                href.startsWith("/") &&
                !href.startsWith("//") &&
                !href.startsWith("mailto:");

              if (isInternal) {
                return (
                  <Link href={href} className={linkClassName}>
                    {children}
                  </Link>
                );
              }

              const isMailto = href.startsWith("mailto:");
              const isExternal = href.startsWith("http://") || href.startsWith("https://");

              return (
                <a
                  href={href}
                  className={cn(
                    "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm",
                    "bg-transparent text-text ring-1 ring-inset ring-text/20",
                    "hover:ring-accent/50 hover:text-accent transition-colors duration-200",
                  )}
                  {...(isExternal && !isMailto
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {page.content}
        </ReactMarkdown>
      </div>
    </Section>
  );
}
