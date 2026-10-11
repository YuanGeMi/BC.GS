import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { getAuthUser } from "@/lib/auth/session";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth.account");

  return {
    title: t("seoTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getAuthUser();
  const email = user?.email?.trim();
  if (!email) {
    redirect(`/${locale}/login?next=${encodeURIComponent("/account")}`);
  }
  const t = await getTranslations("Auth.account");

  return (
    <AuthFormShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description", { email })}
    >
      <ChangePasswordForm email={email} />
    </AuthFormShell>
  );
}
