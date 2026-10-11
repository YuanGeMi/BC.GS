"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { toast } from "@/components/admin/admin-toast";
import { exportAffiliateClickReport } from "@/lib/admin/clicks";

export function ClickExportButton({
  from,
  to,
  casinoId,
  locale,
}: {
  from: string;
  to: string;
  casinoId: string;
  locale: string;
}) {
  const t = useTranslations("Admin");
  const [isPending, startTransition] = useTransition();

  function download() {
    startTransition(async () => {
      try {
        const file = await exportAffiliateClickReport({
          from,
          to,
          casinoId: casinoId || undefined,
          locale: locale || undefined,
        });
        const blob = new Blob([file.csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.filename;
        link.click();
        URL.revokeObjectURL(url);
      } catch {
        toast.error(t("errors.exportFailed"));
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={download}
      className="ring-text/20 hover:ring-accent/50 h-11 px-4 text-sm ring-1 disabled:opacity-60"
    >
      {isPending ? t("actions.exporting") : t("actions.exportCsv")}
    </button>
  );
}
