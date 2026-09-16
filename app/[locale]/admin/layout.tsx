import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  return {
    title: {
      default: "Desk",
      template: "%s · Desk",
    },
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const admin = await requireAdmin();

  return (
    <AdminShell email={admin.email} locale={locale}>
      {children}
    </AdminShell>
  );
}
