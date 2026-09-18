import { getTranslations } from "next-intl/server";

import { CatalogOptionsEditor } from "@/components/admin/catalog-options-editor";
import type { CatalogKind } from "@/lib/admin/catalog-kinds";
import { listCatalogItems } from "@/lib/admin/catalog-list";

export async function OptionCatalogScreen({ kind }: { kind: CatalogKind }) {
  const items = await listCatalogItems(kind);
  const t = await getTranslations("Admin.catalogs");

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">
        {t(`kinds.${kind}.title`)}
      </h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">{t("lede")}</p>
      <CatalogOptionsEditor kind={kind} items={items} />
    </section>
  );
}
