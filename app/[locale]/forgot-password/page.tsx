import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.forgot");

  return {
    title: t("seoTitle"),
    description: t("seoDescription"),
  };
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.forgot");

  return (
    <AuthFormShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <ForgotPasswordForm locale={locale} />
    </AuthFormShell>
  );
}
