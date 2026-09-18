"use server";

import { requireVerifiedAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  CASINO_LOGOS_BUCKET,
  CASINO_LOGO_MAX_BYTES,
  extensionForLogoMime,
  isCasinoLogoMime,
  sanitizeLogoFolder,
} from "@/lib/supabase/storage";

export type UploadCasinoLogoResult =
  | { ok: true; url: string }
  | {
      ok: false;
      error:
        | "missingFile"
        | "invalidFolder"
        | "invalidType"
        | "tooLarge"
        | "uploadFailed";
    };

/**
 * Upload a casino logo to the public `casino-logos` bucket.
 * Returns a public HTTPS URL to store on Casino.logoUrl.
 */
export async function uploadCasinoLogo(
  formData: FormData,
): Promise<UploadCasinoLogoResult> {
  await requireVerifiedAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size < 1) {
    return { ok: false, error: "missingFile" };
  }

  const folderRaw = formData.get("folder");
  const folder =
    typeof folderRaw === "string" ? sanitizeLogoFolder(folderRaw) : null;
  if (!folder) return { ok: false, error: "invalidFolder" };

  if (!isCasinoLogoMime(file.type)) {
    return { ok: false, error: "invalidType" };
  }

  if (file.size > CASINO_LOGO_MAX_BYTES) {
    return { ok: false, error: "tooLarge" };
  }

  const ext = extensionForLogoMime(file.type);
  const path = `${folder}/logo.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const supabase = createServiceClient();
  const { error } = await supabase.storage
    .from(CASINO_LOGOS_BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: true,
      cacheControl: "3600",
    });

  if (error) {
    console.error("[uploadCasinoLogo]", error.message);
    return { ok: false, error: "uploadFailed" };
  }

  const { data } = supabase.storage
    .from(CASINO_LOGOS_BUCKET)
    .getPublicUrl(path);

  // Bust CDN/browser cache when replacing the same object key.
  const url = `${data.publicUrl}?v=${Date.now()}`;
  return { ok: true, url };
}
