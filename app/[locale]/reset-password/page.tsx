import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Link } from "@/i18n/navigation";
import { getAuthUser } from "@/lib/auth/session";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.reset");

  return {
    title: t("seoTitle"),
    description: t("seoDescription"),
  };
}

export default async function ResetPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.reset");
  const user = await getAuthUser();

  return (
    <AuthFormShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={user ? t("description") : t("expired")}
    >
      {user ? (
        <ResetPasswordForm locale={locale} />
      ) : (
        <p className="text-text/55 text-sm">
          <Link
            href="/forgot-password"
            className="text-accent hover:text-accent-highlight font-medium transition-colors"
          >
            {t("requestAgain")}
          </Link>
        </p>
      )}
    </AuthFormShell>
  );
}
