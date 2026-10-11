import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { requireAdmin } from "@/lib/auth/require-admin";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.account" });
  return { title: t("title") };
}

export default async function AdminAccountPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin.account");
  const admin = await requireAdmin();

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">{t("title")}</h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">
        {t("lede", { email: admin.email })}
      </p>
      <ChangePasswordForm email={admin.email} />
    </section>
  );
}
