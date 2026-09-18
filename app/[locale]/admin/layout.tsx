import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminShell } from "@/components/admin/admin-shell";
import { adminPerfStart } from "@/lib/admin/perf-log";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getSiteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const perf = adminPerfStart("admin.layout.generateMetadata");
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin.meta" });
  perf.end();

  return {
    title: {
      default: t("desk"),
      template: t("deskTemplate"),
    },
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({ children, params }: Props) {
  const perf = adminPerfStart("admin.layout");
  const { locale } = await params;
  setRequestLocale(locale);
  perf.mark("setRequestLocale");
  const [admin, site] = await Promise.all([requireAdmin(), getSiteConfig()]);
  perf.mark("requireAdmin");
  perf.end(`email=${admin.email}`);

  return (
    <AdminShell
      email={admin.email}
      locale={locale}
      siteName={site.siteName}
      logoUrl={site.logoUrl}
    >
      {children}
    </AdminShell>
  );
}
