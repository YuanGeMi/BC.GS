import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function NotFoundCopy() {
  const t = await getTranslations("NotFound");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
      <p className="text-accent font-display text-sm tracking-[0.2em] uppercase">
        404
      </p>
      <h1 className="font-display mt-4 text-4xl tracking-tight text-balance">
        {t("title")}
      </h1>
      <p className="text-text/60 mt-3 max-w-md text-sm leading-relaxed">
        {t("body")}
      </p>
      <Link
        href="/"
        className="text-accent hover:text-accent-highlight mt-8 text-sm font-medium"
      >
        {t("home")}
      </Link>
    </div>
  );
}
