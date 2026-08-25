import { getTranslations } from "next-intl/server";

import { Button } from "@/components/button";
import { Section } from "@/components/section";
import { localize } from "@/data/mock-casinos";
import type { LegalDocument } from "@/data/legal-content";

type Props = {
  locale: string;
  document: LegalDocument;
};

function formatUpdated(isoDate: string, locale: string) {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

export async function LegalPage({ locale, document }: Props) {
  const t = await getTranslations("LegalPage");
  const title = localize(document.title, locale);

  return (
    <Section containerClassName="max-w-2xl">
      <p className="text-accent mb-3 text-xs font-medium tracking-[0.22em] uppercase">
        {localize(document.eyebrow, locale)}
      </p>
      <h1 className="text-text text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h1>
      <p className="text-text/60 mt-4 text-base leading-relaxed">
        {localize(document.description, locale)}
      </p>
      <p className="text-text/40 mt-3 text-sm">
        {t("lastUpdated", { date: formatUpdated(document.lastUpdated, locale) })}
      </p>

      <div className="mt-12 space-y-10">
        {document.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="text-text text-xl font-semibold tracking-tight">
              {localize(section.heading, locale)}
            </h2>
            <div className="mt-3 space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={localize(paragraph, locale)}
                  className="text-text/70 text-base leading-relaxed"
                >
                  {localize(paragraph, locale)}
                </p>
              ))}
            </div>
            {section.list ? (
              <ul className="mt-4 list-disc space-y-2 pl-5">
                {section.list.map((item) => (
                  <li
                    key={localize(item, locale)}
                    className="text-text/70 text-base leading-relaxed"
                  >
                    {localize(item, locale)}
                  </li>
                ))}
              </ul>
            ) : null}
            {section.links ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {section.links.map((link) => (
                  <Button
                    key={link.href}
                    href={link.href}
                    variant="secondary"
                    size="sm"
                  >
                    {localize(link.label, locale)}
                  </Button>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </Section>
  );
}
