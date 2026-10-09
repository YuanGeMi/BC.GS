/**
 * Telegram `setMyProfilePhoto` with `InputProfilePhotoStatic`: a static photo in
 * JPG format, uploaded as a new multipart file. Multipart photos are capped at
 * 10 MB; width + height must not exceed 10000 and the side ratio at most 20.
 * Pure helpers, safe to import in the browser.
 */
export const BOT_AVATAR_MAX_BYTES = 10 * 1024 * 1024;
export const BOT_AVATAR_MAX_DIMENSION_SUM = 10_000;
export const BOT_AVATAR_MAX_RATIO = 20;

export type SniffedImageType = "jpeg" | "png";

/** Real type from the first bytes, ignoring the file name and declared MIME type. */
export function sniffImageType(bytes: Uint8Array): SniffedImageType | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpeg";
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (
    bytes.length >= 8 &&
    png.every((value, index) => bytes[index] === value)
  ) {
    return "png";
  }
  return null;
}

/** Width and height from the JPEG start-of-frame segment, or null if it can't be found. */
export function jpegDimensions(
  bytes: Uint8Array,
): { width: number; height: number } | null {
  if (sniffImageType(bytes) !== "jpeg") return null;
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    // Fill bytes and markers without a length field.
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      offset += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return null;
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2) return null;
    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isStartOfFrame) {
      if (offset + 9 > bytes.length) return null;
      const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
      const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
      return width > 0 && height > 0 ? { width, height } : null;
    }
    offset += 2 + length;
  }
  return null;
}

export function botAvatarDimensionsOk(width: number, height: number): boolean {
  if (width < 1 || height < 1) return false;
  if (width + height > BOT_AVATAR_MAX_DIMENSION_SUM) return false;
  return (
    Math.max(width, height) / Math.min(width, height) <= BOT_AVATAR_MAX_RATIO
  );
}
