import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { SignupForm } from "@/components/auth/signup-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.signup");

  return {
    title: t("seoTitle"),
    description: t("seoDescription"),
  };
}

export default async function SignupPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.signup");

  return (
    <AuthFormShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <SignupForm locale={locale} />
    </AuthFormShell>
  );
}
