import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { UsersTable } from "@/components/admin/users-table";
import { listUsers } from "@/lib/admin/users";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Users",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminUsersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [admin, users] = await Promise.all([requireAdmin(), listUsers()]);

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        Access
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">Users</h1>
      <p className="text-text/55 mt-3 mb-8 max-w-2xl text-sm leading-relaxed">
        Accounts are created on the public site. Promote an editor here;
        demote anyone except the last remaining admin.
      </p>
      <UsersTable users={users} currentUserId={admin.id} />
    </section>
  );
}
