"use client";

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

const errorCopy: Record<string, string> = {
  invalidSlug: "That page cannot be edited here.",
  englishRequired: "English title and markdown are required to publish.",
  missing: "Save the page as a draft first.",
  invalidStatus: "That status is not allowed.",
  invalidUrl: "Use an https URL.",
};

const localeLabel: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  th: "ไทย",
};

function toInput(page: AdminStaticPageEditorData): StaticPageSaveInput {
  return { translations: page.translations };
}

export function StaticPageEditor({ page }: { page: AdminStaticPageEditorData }) {
  const router = useRouter();
  const [form, setForm] = useState<StaticPageSaveInput>(() => toInput(page));
  const [locale, setLocale] = useState<Locale>("en");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canPublish = englishPageReady(form);
  const warnUnpublish = page.slug === "privacy" || page.slug === "terms";

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
          setError(errorCopy[result.error] ?? result.error);
          return;
        }
        setNotice("Published.");
        router.refresh();
        return;
      }

      const result = await updateStaticPage(page.slug, form);
      if (!result.ok) {
        setError(errorCopy[result.error] ?? result.error);
        return;
      }
      setNotice("Saved.");
      router.refresh();
    });
  }

  function unpublish() {
    startTransition(async () => {
      const result = await setStaticPageStatus(page.slug, "draft");
      if (!result.ok) {
        setError(errorCopy[result.error] ?? result.error);
        setConfirmUnpublish(false);
        return;
      }
      setConfirmUnpublish(false);
      setNotice("Unpublished. The public URL now 404s.");
      router.refresh();
    });
  }

  const translation = form.translations[locale];

  return (
    <div className="max-w-3xl pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
            Legal
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">
            {LEGAL_PAGE_LABELS[page.slug]}
          </h1>
          <p className="text-text/45 mt-2 text-xs tracking-[0.16em] uppercase">
            {page.exists ? page.status : "not saved"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => runSave("save")}
            className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
          {page.status !== "published" ? (
            <button
              type="button"
              disabled={isPending || !canPublish}
              onClick={() => runSave("publish")}
              className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
            >
              Publish
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
              Unpublish
            </button>
          )}
        </div>
      </header>

      {error ? <p className="text-accent mt-6 text-sm">{error}</p> : null}
      {notice ? <p className="text-text/55 mt-6 text-sm">{notice}</p> : null}
      {!canPublish ? (
        <p className="text-text/45 mt-6 max-w-2xl text-sm">
          Publishing needs an English title and markdown body.
        </p>
      ) : null}

      <div className="mt-10 flex gap-1 border-b border-text/10">
        {CONTENT_LOCALES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            className={cn(
              "-mb-px border-b px-3 py-2 text-sm",
              locale === item
                ? "border-accent text-accent"
                : "border-transparent text-text/45 hover:text-text",
            )}
          >
            {localeLabel[item]}
            {item === "en" ? (
              <span className="text-text/35 ml-2 text-[10px] tracking-wide uppercase">
                required
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            Title
          </span>
          <input
            value={translation.title}
            onChange={(event) => patchTranslation({ title: event.target.value })}
            className={adminInputClass}
          />
        </label>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            Markdown
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
            SEO title
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
            SEO description
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
          title="Unpublish this legal page?"
          body="The public URL will 404. Keep this unpublished only if you intend to take the policy down."
          confirmLabel="Unpublish"
          pending={isPending}
          onCancel={() => setConfirmUnpublish(false)}
          onConfirm={unpublish}
        />
      ) : null}
    </div>
  );
}
