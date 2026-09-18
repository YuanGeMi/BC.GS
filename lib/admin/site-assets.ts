"use server";

import { requireVerifiedAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  SITE_ASSET_MAX_BYTES,
  SITE_BRANDING_BUCKET,
  extensionForLogoMime,
  isCasinoLogoMime,
  isFaviconMime,
  isSiteAssetKind,
  type SiteAssetKind,
} from "@/lib/supabase/storage";

export type UploadSiteAssetResult =
  | { ok: true; url: string; kind: SiteAssetKind }
  | {
      ok: false;
      error: "missingFile" | "invalidKind" | "invalidType" | "tooLarge" | "uploadFailed";
    };

/**
 * Upload site brand assets (logo / OG / favicon) to the public `site-branding` bucket.
 * Store the returned URL in SiteSetting.
 */
export async function uploadSiteAsset(
  formData: FormData,
): Promise<UploadSiteAssetResult> {
  await requireVerifiedAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size < 1) {
    return { ok: false, error: "missingFile" };
  }

  const kindRaw = formData.get("kind");
  const kind = typeof kindRaw === "string" ? kindRaw : "";
  if (!isSiteAssetKind(kind)) {
    return { ok: false, error: "invalidKind" };
  }

  if (kind === "favicon") {
    if (!isFaviconMime(file.type)) {
      return { ok: false, error: "invalidType" };
    }
  } else if (!isCasinoLogoMime(file.type)) {
    return { ok: false, error: "invalidType" };
  }

  if (file.size > SITE_ASSET_MAX_BYTES) {
    return { ok: false, error: "tooLarge" };
  }

  const ext = extensionForLogoMime(
    file.type as "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml",
  );
  const path = `${kind}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const supabase = createServiceClient();

  // Remove previous extensions for this kind so we don't leave stale files.
  const { data: existing } = await supabase.storage
    .from(SITE_BRANDING_BUCKET)
    .list("", { search: kind });
  const stale = (existing ?? [])
    .map((row) => row.name)
    .filter((name) => name === kind || name.startsWith(`${kind}.`));
  if (stale.length) {
    await supabase.storage.from(SITE_BRANDING_BUCKET).remove(stale);
  }

  const { error } = await supabase.storage
    .from(SITE_BRANDING_BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: true,
      cacheControl: "3600",
    });

  if (error) {
    console.error("[uploadSiteAsset]", error.message);
    return { ok: false, error: "uploadFailed" };
  }

  const { data } = supabase.storage
    .from(SITE_BRANDING_BUCKET)
    .getPublicUrl(path);

  return { ok: true, url: `${data.publicUrl}?v=${Date.now()}`, kind };
}
