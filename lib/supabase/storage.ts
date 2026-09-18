export const CASINO_LOGOS_BUCKET = "casino-logos";
export const SITE_BRANDING_BUCKET = "site-branding";

export const CASINO_LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const SITE_ASSET_MAX_BYTES = 2 * 1024 * 1024;

export const CASINO_LOGO_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const;

export type CasinoLogoMime = (typeof CASINO_LOGO_MIME_TYPES)[number];

export function isCasinoLogoMime(value: string): value is CasinoLogoMime {
  return (CASINO_LOGO_MIME_TYPES as readonly string[]).includes(value);
}

export function extensionForLogoMime(mime: CasinoLogoMime): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/svg+xml":
      return "svg";
  }
}

/** Folder segment for Storage paths — casino id or a draft key. */
export function sanitizeLogoFolder(value: string): string | null {
  const trimmed = value.trim();
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(trimmed)) return null;
  return trimmed;
}

export const SITE_ASSET_KINDS = ["logo", "og", "favicon"] as const;
export type SiteAssetKind = (typeof SITE_ASSET_KINDS)[number];

export function isSiteAssetKind(value: string): value is SiteAssetKind {
  return (SITE_ASSET_KINDS as readonly string[]).includes(value);
}

/** Favicons: raster only (broader browser tab support than SVG). */
export const FAVICON_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export function isFaviconMime(
  value: string,
): value is (typeof FAVICON_MIME_TYPES)[number] {
  return (FAVICON_MIME_TYPES as readonly string[]).includes(value);
}
