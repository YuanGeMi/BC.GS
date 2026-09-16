import { CatalogOptionsEditor } from "@/components/admin/catalog-options-editor";
import { CATALOG_KIND_META, type CatalogKind } from "@/lib/admin/catalog-kinds";
import { listCatalogItems } from "@/lib/admin/catalog-list";

export async function OptionCatalogScreen({ kind }: { kind: CatalogKind }) {
  const items = await listCatalogItems(kind);
  const meta = CATALOG_KIND_META[kind];

  return (
    <section>
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        Catalog
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">{meta.title}</h1>
      <p className="text-text/55 mt-3 max-w-xl text-sm">
        English is required. Chinese and Thai are optional. Slug stays locked
        after create so public filters stay stable.
      </p>
      <CatalogOptionsEditor kind={kind} items={items} />
    </section>
  );
}
