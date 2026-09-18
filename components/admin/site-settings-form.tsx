"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";

import { uploadSiteAsset } from "@/lib/admin/site-assets";
import { updateSiteSettings } from "@/lib/admin/static-pages";
import { adminInputClass } from "@/lib/admin/fields";
import type { SiteAssetKind } from "@/lib/supabase/storage";

export function SiteSettingsForm({
  siteName: initialSiteName,
  logoUrl: initialLogoUrl,
  ogImageUrl: initialOgImageUrl,
  faviconUrl: initialFaviconUrl,
  seoTitleDefault: initialSeoTitle,
  seoDescriptionDefault: initialSeoDescription,
  telegramChannelUrl,
  discordChannelUrl,
}: {
  siteName: string;
  logoUrl: string;
  ogImageUrl: string;
  faviconUrl: string;
  seoTitleDefault: string;
  seoDescriptionDefault: string;
  telegramChannelUrl: string;
  discordChannelUrl: string;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [siteName, setSiteName] = useState(initialSiteName);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [ogImageUrl, setOgImageUrl] = useState(initialOgImageUrl);
  const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl);
  const [seoTitleDefault, setSeoTitleDefault] = useState(initialSeoTitle);
  const [seoDescriptionDefault, setSeoDescriptionDefault] = useState(
    initialSeoDescription,
  );
  const [telegramUrl, setTelegramUrl] = useState(telegramChannelUrl);
  const [discordUrl, setDiscordUrl] = useState(discordChannelUrl);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadingKind, setUploadingKind] = useState<SiteAssetKind | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  function uploadAsset(kind: SiteAssetKind, file: File) {
    setError(null);
    setNotice(null);
    setUploadingKind(kind);
    startTransition(async () => {
      const body = new FormData();
      body.set("file", file);
      body.set("kind", kind);
      const result = await uploadSiteAsset(body);
      if (!result.ok) {
        setUploadingKind(null);
        setError(t(`pages.assetErrors.${result.error}`));
        return;
      }

      const nextLogo = result.kind === "logo" ? result.url : logoUrl;
      const nextOg = result.kind === "og" ? result.url : ogImageUrl;
      const nextFavicon = result.kind === "favicon" ? result.url : faviconUrl;
      if (result.kind === "logo") setLogoUrl(result.url);
      else if (result.kind === "og") setOgImageUrl(result.url);
      else setFaviconUrl(result.url);

      const saved = await updateSiteSettings({
        siteName,
        logoUrl: nextLogo,
        ogImageUrl: nextOg,
        faviconUrl: nextFavicon,
        seoTitleDefault,
        seoDescriptionDefault,
        telegramChannelUrl: telegramUrl,
        discordChannelUrl: discordUrl,
      });
      setUploadingKind(null);
      if (!saved.ok) {
        setError(t("errors.invalidLogoUrl"));
        return;
      }
      setNotice(t("pages.assetUploaded"));
      router.refresh();
    });
  }

  return (
    <form
      className="mt-6 max-w-xl space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setNotice(null);
        startTransition(async () => {
          const result = await updateSiteSettings({
            siteName,
            logoUrl,
            ogImageUrl,
            faviconUrl,
            seoTitleDefault,
            seoDescriptionDefault,
            telegramChannelUrl: telegramUrl,
            discordChannelUrl: discordUrl,
          });
          if (!result.ok) {
            if (result.error === "invalidLogoUrl") {
              setError(t("errors.invalidLogoUrl"));
            } else if (result.error === "invalidSiteName") {
              setError(t("errors.invalidSiteName"));
            } else {
              setError(t("errors.invalidUrl"));
            }
            return;
          }
          setNotice(t("pages.settingsSaved"));
          router.refresh();
        });
      }}
    >
      <label className="block">
        <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
          {t("pages.siteName")}
        </span>
        <input
          value={siteName}
          onChange={(event) => setSiteName(event.target.value)}
          className={adminInputClass}
          placeholder="BC.GS"
          autoCapitalize="none"
          spellCheck={false}
        />
      </label>
      <p className="text-text/40 text-xs">{t("pages.siteNameHelp")}</p>

      <div className="block space-y-2">
        <span className="text-text/45 block text-[11px] tracking-[0.16em] uppercase">
          {t("pages.logoUrl")}
        </span>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="border-text/10 bg-text/5 size-14 shrink-0 border object-contain p-1"
            />
          ) : (
            <div className="border-text/10 bg-text/5 text-text/35 flex size-14 shrink-0 items-center justify-center border text-[10px] tracking-wide uppercase">
              {t("pages.assetEmpty")}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <input
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
              className={adminInputClass}
              placeholder="/brand/logo-mark-bc.png"
              autoCapitalize="none"
              spellCheck={false}
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-text/55 hover:text-accent inline-flex cursor-pointer items-center gap-2 text-xs tracking-wide uppercase">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="sr-only"
                  disabled={isPending || uploadingKind !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) uploadAsset("logo", file);
                  }}
                />
                <span className="border-text/15 hover:border-accent/40 border px-3 py-1.5">
                  {uploadingKind === "logo"
                    ? t("pages.assetUploading")
                    : t("pages.logoUpload")}
                </span>
              </label>
            </div>
            <p className="text-text/40 text-xs">{t("pages.logoUrlHelp")}</p>
          </div>
        </div>
      </div>

      <div className="block space-y-2">
        <span className="text-text/45 block text-[11px] tracking-[0.16em] uppercase">
          {t("pages.faviconUrl")}
        </span>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {faviconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={faviconUrl}
              alt=""
              className="border-text/10 bg-text/5 size-10 shrink-0 border object-contain p-1"
            />
          ) : (
            <div className="border-text/10 bg-text/5 text-text/35 flex size-10 shrink-0 items-center justify-center border text-[10px] tracking-wide uppercase">
              {t("pages.assetEmpty")}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <input
              value={faviconUrl}
              onChange={(event) => setFaviconUrl(event.target.value)}
              className={adminInputClass}
              placeholder="/icon.png"
              autoCapitalize="none"
              spellCheck={false}
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-text/55 hover:text-accent inline-flex cursor-pointer items-center gap-2 text-xs tracking-wide uppercase">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  disabled={isPending || uploadingKind !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) uploadAsset("favicon", file);
                  }}
                />
                <span className="border-text/15 hover:border-accent/40 border px-3 py-1.5">
                  {uploadingKind === "favicon"
                    ? t("pages.assetUploading")
                    : t("pages.faviconUpload")}
                </span>
              </label>
            </div>
            <p className="text-text/40 text-xs">{t("pages.faviconUrlHelp")}</p>
          </div>
        </div>
      </div>

      <div className="block space-y-2">
        <span className="text-text/45 block text-[11px] tracking-[0.16em] uppercase">
          {t("pages.ogImageUrl")}
        </span>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {ogImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ogImageUrl}
              alt=""
              className="border-text/10 bg-text/5 h-14 w-24 shrink-0 border object-cover"
            />
          ) : (
            <div className="border-text/10 bg-text/5 text-text/35 flex h-14 w-24 shrink-0 items-center justify-center border text-[10px] tracking-wide uppercase">
              {t("pages.assetEmpty")}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <input
              value={ogImageUrl}
              onChange={(event) => setOgImageUrl(event.target.value)}
              className={adminInputClass}
              placeholder="/brand/og.png"
              autoCapitalize="none"
              spellCheck={false}
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-text/55 hover:text-accent inline-flex cursor-pointer items-center gap-2 text-xs tracking-wide uppercase">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="sr-only"
                  disabled={isPending || uploadingKind !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) uploadAsset("og", file);
                  }}
                />
                <span className="border-text/15 hover:border-accent/40 border px-3 py-1.5">
                  {uploadingKind === "og"
                    ? t("pages.assetUploading")
                    : t("pages.ogUpload")}
                </span>
              </label>
            </div>
            <p className="text-text/40 text-xs">{t("pages.ogImageUrlHelp")}</p>
          </div>
        </div>
      </div>

      <label className="block">
        <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
          {t("pages.seoTitleDefault")}
        </span>
        <input
          value={seoTitleDefault}
          onChange={(event) => setSeoTitleDefault(event.target.value)}
          className={adminInputClass}
          maxLength={120}
        />
      </label>
      <p className="text-text/40 text-xs">{t("pages.seoTitleDefaultHelp")}</p>

      <label className="block">
        <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
          {t("pages.seoDescriptionDefault")}
        </span>
        <textarea
          value={seoDescriptionDefault}
          onChange={(event) => setSeoDescriptionDefault(event.target.value)}
          className={`${adminInputClass} min-h-24`}
          maxLength={320}
          rows={3}
        />
      </label>
      <p className="text-text/40 text-xs">{t("pages.seoDescriptionDefaultHelp")}</p>

      <label className="block">
        <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
          {t("pages.telegram")}
        </span>
        <input
          value={telegramUrl}
          onChange={(event) => setTelegramUrl(event.target.value)}
          className={adminInputClass}
          placeholder="https://t.me/…"
          autoCapitalize="none"
          spellCheck={false}
        />
      </label>
      <p className="text-text/40 text-xs">{t("pages.telegramHelpLong")}</p>

      <label className="block">
        <span className="text-text/45 mb-1.5 block text-[11px] tracking-[0.16em] uppercase">
          {t("pages.discord")}
        </span>
        <input
          value={discordUrl}
          onChange={(event) => setDiscordUrl(event.target.value)}
          className={adminInputClass}
          placeholder="https://discord.gg/…"
          autoCapitalize="none"
          spellCheck={false}
        />
      </label>
      <p className="text-text/40 text-xs">{t("pages.discordHelpLong")}</p>

      {error ? <p className="text-accent text-sm">{error}</p> : null}
      {notice ? <p className="text-text/55 text-sm">{notice}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="bg-accent text-background hover:bg-accent-highlight h-10 px-4 text-sm font-medium disabled:opacity-40"
      >
        {isPending ? t("actions.saving") : t("actions.saveSettings")}
      </button>
    </form>
  );
}
