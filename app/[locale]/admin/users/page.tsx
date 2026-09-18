import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { UsersTable } from "@/components/admin/users-table";
import { listUsers } from "@/lib/admin/users";
import { requireAdmin } from "@/lib/auth/require-admin";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.users" });
  return { title: t("title") };
}

export default async function AdminUsersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tu = await getTranslations("Admin.users");
  // requireAdmin is cached per request; listUsers calls it again internally.
  const admin = await requireAdmin();
  const users = await listUsers();

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        {tu("eyebrow")}
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">{tu("title")}</h1>
      <p className="text-text/55 mt-3 mb-8 max-w-2xl text-sm leading-relaxed">
        {tu("lede")}
      </p>
      <UsersTable users={users} currentUserId={admin.id} />
    </section>
  );
}
