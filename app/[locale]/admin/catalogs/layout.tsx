import { CatalogSubnav } from "@/components/admin/catalog-subnav";

export default function AdminCatalogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CatalogSubnav />
      {children}
    </>
  );
}
