"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { AdminConfirm } from "@/components/admin/admin-confirm";
import {
  CONTENT_LOCALES,
  emptyCategorySaveInput,
  englishNameReady,
  type CategoryCasinoDraft,
  type CategorySaveInput,
  type CategoryTranslationDraft,
  type Locale,
} from "@/lib/admin/category-input";
import {
  createCategory,
  deleteCategory,
  saveAndPublishCategory,
  setCategoryStatus,
  updateCategory,
  type AdminCategoryCasinoOption,
  type AdminCategoryEditorData,
} from "@/lib/admin/categories";
import {
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/lib/admin/fields";
import { cn } from "@/lib/utils";

function toInput(category?: AdminCategoryEditorData | null): CategorySaveInput {
  if (!category) return emptyCategorySaveInput();
  return {
    slug: category.slug,
    translations: category.translations,
    casinos: category.casinos,
  };
}

function emptyNotes(): Record<Locale, string> {
  return { en: "", zh: "", th: "" };
}

export function CategoryEditor({
  category,
  casinos,
}: {
  category?: AdminCategoryEditorData | null;
  casinos: AdminCategoryCasinoOption[];
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [form, setForm] = useState<CategorySaveInput>(() => toInput(category));
  const [locale, setLocale] = useState<Locale>("en");
  const [addCasinoId, setAddCasinoId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isNew = !category;
  const byId = useMemo(
    () => new Map(casinos.map((row) => [row.id, row])),
    [casinos],
  );

  useEffect(() => {
    setForm(toInput(category));
  }, [category]);

  const attached = new Set(form.casinos.map((row) => row.casinoId));
  const available = casinos.filter((row) => !attached.has(row.id));
  const duplicateRanks = hasDuplicateRanks(form.casinos);
  const canPublish = englishNameReady(form);

  function err(code: string) {
    return t.has(`errors.${code}`) ? t(`errors.${code}`) : code;
  }

  function patch(next: Partial<CategorySaveInput>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function patchTranslation(next: Partial<CategoryTranslationDraft>) {
    setForm((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [locale]: { ...current.translations[locale], ...next },
      },
    }));
  }

  function patchCasino(casinoId: string, next: Partial<CategoryCasinoDraft>) {
    setForm((current) => ({
      ...current,
      casinos: current.casinos.map((row) =>
        row.casinoId === casinoId ? { ...row, ...next } : row,
      ),
    }));
  }

  function addCasino() {
    if (!addCasinoId || attached.has(addCasinoId)) return;
    const nextRank = String(form.casinos.length + 1);
    patch({
      casinos: [
        ...form.casinos,
        { casinoId: addCasinoId, rank: nextRank, notes: emptyNotes() },
      ],
    });
    setAddCasinoId("");
  }

  function runSave(kind: "save" | "publish") {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      if (isNew) {
        const result = await createCategory(form);
        if (!result.ok) {
          setError(err(result.error));
          return;
        }
        router.push(`/admin/categories/${result.id}`);
        router.refresh();
        return;
      }

      if (kind === "publish") {
        const result = await saveAndPublishCategory(category.id, form);
        if (!result.ok) {
          setError(err(result.error));
          return;
        }
        setNotice(t("categories.editor.published"));
        router.refresh();
        return;
      }

      const result = await updateCategory(category.id, form);
      if (!result.ok) {
        setError(err(result.error));
        return;
      }
      setNotice(t("categories.editor.saved"));
      router.refresh();
    });
  }

  const translation = form.translations[locale];

  return (
    <div className="max-w-4xl pb-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
            {t("categories.eyebrow")}
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">
            {isNew
              ? t("categories.editor.newTitle")
              : form.translations.en.name.trim() ||
                form.slug ||
                t("categories.title")}
          </h1>
          {!isNew ? (
            <p className="text-text/45 mt-2 text-xs tracking-[0.16em] uppercase">
              {t(`status.${category.status}`)}
            </p>
          ) : (
            <p className="text-text/45 mt-2 text-sm">
              {t("categories.editor.startsDraft")}
            </p>
          )}
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
          {!isNew && category.status !== "published" ? (
            <button
              type="button"
              disabled={isPending || !canPublish}
              onClick={() => runSave("publish")}
              className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
            >
              {t("actions.publish")}
            </button>
          ) : null}
          {!isNew && category.status === "published" ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await setCategoryStatus(category.id, "draft");
                  if (!result.ok) {
                    setError(err(result.error));
                    return;
                  }
                  setNotice(t("categories.editor.unpublished"));
                  router.refresh();
                })
              }
              className="ring-text/20 hover:ring-accent/50 h-10 px-4 text-sm ring-1"
            >
              {t("actions.unpublish")}
            </button>
          ) : null}
        </div>
      </header>

      {error ? <p className="text-accent mt-6 text-sm">{error}</p> : null}
      {notice ? <p className="text-text/55 mt-6 text-sm">{notice}</p> : null}
      {!canPublish ? (
        <p className="text-text/45 mt-6 max-w-2xl text-sm">
          {t("categories.editor.publishNeeds")}
        </p>
      ) : null}

      <section className="mt-12 space-y-5">
        <h2 className="font-display text-2xl tracking-tight italic">
          {t("categories.editor.facts")}
        </h2>
        <label className="block">
          <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
            {t("categories.editor.slug")}
          </span>
          <input
            value={form.slug}
            onChange={(event) => patch({ slug: event.target.value })}
            className={adminInputClass}
            autoCapitalize="none"
            spellCheck={false}
          />
          <span className="text-text/40 mt-1.5 block text-xs">
            {t("categories.editor.publicUrl", { slug: form.slug || "slug" })}
          </span>
        </label>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl tracking-tight italic">
          {t("categories.editor.voice")}
        </h2>
        <div className="border-text/10 mt-5 flex gap-1 border-b">
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
              {t("categories.editor.name")}
            </span>
            <input
              value={translation.name}
              onChange={(event) =>
                patchTranslation({ name: event.target.value })
              }
              className={adminInputClass}
            />
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("categories.editor.description")}
            </span>
            <textarea
              value={translation.description}
              onChange={(event) =>
                patchTranslation({ description: event.target.value })
              }
              className={adminTextareaClass}
            />
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("categories.editor.methodology")}
            </span>
            <textarea
              value={translation.methodology}
              onChange={(event) =>
                patchTranslation({ methodology: event.target.value })
              }
              className={adminTextareaClass}
            />
          </label>
          <label className="block">
            <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
              {t("categories.editor.seoTitle")}
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
              {t("categories.editor.seoDescription")}
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
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl tracking-tight italic">
          {t("categories.editor.casinos")}
        </h2>
        <p className="text-text/45 mt-2 max-w-2xl text-sm">
          {t("categories.editor.rankingHelp")}
        </p>
        {duplicateRanks ? (
          <p className="text-accent/80 mt-3 text-sm">
            {t("categories.editor.rankDuplicate")}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <select
            value={addCasinoId}
            onChange={(event) => setAddCasinoId(event.target.value)}
            className={`${adminSelectClass} max-w-xs`}
          >
            <option value="">{t("categories.editor.addCasino")}</option>
            {available.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
                {row.status === "draft" ? ` (${t("status.draft")})` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addCasino}
            disabled={!addCasinoId}
            className="ring-text/20 hover:ring-accent/50 h-11 px-4 text-sm ring-1 disabled:opacity-40"
          >
            {t("actions.add")}
          </button>
        </div>

        <ol className="mt-8 space-y-6">
          {form.casinos.map((row, index) => {
            const meta = byId.get(row.casinoId);
            return (
              <li key={row.casinoId} className="border-text/10 border-t pt-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm">
                      {meta?.label ?? row.casinoId}
                      {meta?.status === "draft" ? (
                        <span className="text-text/35 ml-2 text-[11px] tracking-wide uppercase">
                          {t("status.draft")}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        casinos: form.casinos.filter(
                          (item) => item.casinoId !== row.casinoId,
                        ),
                      })
                    }
                    className="text-text/45 hover:text-accent text-xs"
                  >
                    {t("categories.editor.remove")}
                  </button>
                </div>
                <label className="mt-3 block max-w-[8rem]">
                  <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
                    {t("categories.editor.rank")}
                  </span>
                  <input
                    value={row.rank}
                    onChange={(event) =>
                      patchCasino(row.casinoId, { rank: event.target.value })
                    }
                    className={adminInputClass}
                    inputMode="numeric"
                    placeholder={String(index + 1)}
                  />
                </label>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {CONTENT_LOCALES.map((item) => (
                    <label key={item} className="block">
                      <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
                        {t("categories.editor.note")} ·{" "}
                        {t(`contentLocale.${item}`)}
                      </span>
                      <textarea
                        value={row.notes[item]}
                        onChange={(event) =>
                          patchCasino(row.casinoId, {
                            notes: { ...row.notes, [item]: event.target.value },
                          })
                        }
                        className={cn(adminTextareaClass, "min-h-24")}
                      />
                    </label>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {!isNew ? (
        <section className="border-text/10 mt-16 border-t pt-8">
          <h2 className="font-display text-2xl tracking-tight italic">
            {t("categories.editor.remove")}
          </h2>
          <p className="text-text/45 mt-3 max-w-xl text-sm leading-relaxed">
            {t("categories.editor.removeHelp")}
          </p>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-accent hover:text-accent-highlight mt-4 text-sm"
          >
            {t("actions.deleteCategory")}
          </button>
        </section>
      ) : null}

      {confirmDelete && category ? (
        <AdminConfirm
          title={t("categories.editor.deleteTitle")}
          body={t("categories.editor.deleteBody")}
          confirmLabel={t("actions.delete")}
          pending={isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            startTransition(async () => {
              const result = await deleteCategory(category.id);
              if (!result.ok) {
                setError(err(result.error));
                setConfirmDelete(false);
                return;
              }
              router.push("/admin/categories");
              router.refresh();
            })
          }
        />
      ) : null}
    </div>
  );
}

function hasDuplicateRanks(rows: CategoryCasinoDraft[]) {
  const ranks = rows.map((row) => row.rank.trim()).filter(Boolean);
  return ranks.length !== new Set(ranks).size;
}
