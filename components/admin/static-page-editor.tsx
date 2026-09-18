"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState, useTransition } from "react";

import { AdminConfirm } from "@/components/admin/admin-confirm";
import {
  saveAndPublishStaticPage,
  setStaticPageStatus,
  updateStaticPage,
  type AdminStaticPageEditorData,
} from "@/lib/admin/static-pages";
import {
  CONTENT_LOCALES,
  englishPageReady,
  type Locale,
  type StaticPageSaveInput,
  type StaticPageTranslationDraft,
} from "@/lib/admin/static-page-input";
import { adminInputClass, adminTextareaClass } from "@/lib/admin/fields";
import { LEGAL_PAGE_LABELS } from "@/lib/static-pages";
import { cn } from "@/lib/utils";

function toInput(page: AdminStaticPageEditorData): StaticPageSaveInput {
  return { translations: page.translations };
}

export function StaticPageEditor({
  page,
}: {
  page: AdminStaticPageEditorData;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [form, setForm] = useState<StaticPageSaveInput>(() => toInput(page));
  const [locale, setLocale] = useState<Locale>("en");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canPublish = englishPageReady(form);
  const warnUnpublish = page.slug === "privacy" || page.slug === "terms";

  function err(code: string) {
    return t.has(`errors.${code}`) ? t(`errors.${code}`) : code;
  }

  useEffect(() => {
    setForm(toInput(page));
  }, [page]);

  function patchTranslation(next: Partial<StaticPageTranslationDraft>) {
    setForm((current) => ({
      translations: {
        ...current.translations,
        [locale]: { ...current.translations[locale], ...next },
      },
    }));
  }

  function runSave(kind: "save" | "publish") {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      if (kind === "publish") {
        const result = await saveAndPublishStaticPage(page.slug, form);
        if (!result.ok) {
          setError(err(result.error));
          return;
        }
        setNotice(t("pages.editor.published"));
        router.refresh();
        return;
      }

      const result = await updateStaticPage(page.slug, form);
      if (!result.ok) {
        setError(err(result.error));
        return;
      }
      setNotice(t("pages.editor.saved"));
      router.refresh();
    });
  }

  function unpublish() {
    startTransition(async () => {
      const result = await setStaticPageStatus(page.slug, "draft");
      if (!result.ok) {
        setError(err(result.error));
        setConfirmUnpublish(false);
        return;
      }
      setConfirmUnpublish(false);
      setNotice(t("pages.editor.unpublishedNotice"));
      router.refresh();
    });
  }

  const translation = form.translations[locale];

  return (
    <div className="max-w-3xl pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
            {t("pages.eyebrow")}
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">
            {LEGAL_PAGE_LABELS[page.slug]}
          </h1>
          <p className="text-text/45 mt-2 text-xs tracking-[0.16em] uppercase">
            {page.exists
              ? t(`status.${page.status}`)
              : t("pages.editor.notSaved")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => runSave("save")}
            className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1"
          >
            {isPending ? t("actions.saving") : t("actions.save")}
          </button>
          {page.status !== "published" ? (
            <button
              type="button"
              disabled={isPending || !canPublish}
              onClick={() => runSave("publish")}
              className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
            >
              {t("actions.publish")}
            </button>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                warnUnpublish ? setConfirmUnpublish(true) : unpublish()
              }
              className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1"
            >
              {t("actions.unpublish")}
            </button>
          )}
        </div>
      </header>

      {error ? <p className="text-accent mt-6 text-sm">{error}</p> : null}
      {notice ? <p className="text-text/55 mt-6 text-sm">{notice}</p> : null}
      {!canPublish ? (
        <p className="text-text/45 mt-6 max-w-2xl text-sm">
          {t("pages.editor.publishNeeds")}
        </p>
      ) : null}

      <div className="border-text/10 mt-10 flex gap-1 border-b">
        {CONTENT_LOCALES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            className={cn(
              "-mb-px border-b px-3 py-2 text-sm",
              locale === item
                ? "border-accent text-accent"
                : "text-text/45 hover:text-text border-transparent",
            )}
          >
            {t(`contentLocale.${item}`)}
            {item === "en" ? (
              <span className="text-text/35 ml-2 text-[10px] tracking-wide uppercase">
                {t("common.required")}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            {t("pages.editor.titleField")}
          </span>
          <input
            value={translation.title}
            onChange={(event) =>
              patchTranslation({ title: event.target.value })
            }
            className={adminInputClass}
          />
        </label>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            {t("pages.editor.markdown")}
          </span>
          <textarea
            value={translation.content}
            onChange={(event) =>
              patchTranslation({ content: event.target.value })
            }
            className={cn(adminTextareaClass, "min-h-80 font-mono text-[13px]")}
          />
        </label>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            {t("pages.editor.seoTitle")}
          </span>
          <input
            value={translation.seoTitle}
            onChange={(event) =>
              patchTranslation({ seoTitle: event.target.value })
            }
            className={adminInputClass}
          />
        </label>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            {t("pages.editor.seoDescription")}
          </span>
          <textarea
            value={translation.seoDescription}
            onChange={(event) =>
              patchTranslation({ seoDescription: event.target.value })
            }
            className={cn(adminTextareaClass, "min-h-24")}
          />
        </label>
      </div>

      {confirmUnpublish ? (
        <AdminConfirm
          title={t("pages.editor.unpublishTitle")}
          body={t("pages.editor.unpublishBody")}
          confirmLabel={t("actions.unpublish")}
          pending={isPending}
          onCancel={() => setConfirmUnpublish(false)}
          onConfirm={unpublish}
        />
      ) : null}
    </div>
  );
}
