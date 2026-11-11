export const MAX_CHART_BYTES = 10 * 1024 * 1024;

/** Trust the file signature, not the browser's MIME type or filename. */
export function chartMediaType(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export function validateChart(bytes: Uint8Array) {
  if (bytes.length === 0 || bytes.length > MAX_CHART_BYTES) throw new Error("Attach a non-empty chart image no larger than 10 MB.");
  const mediaType = chartMediaType(bytes);
  if (!mediaType) throw new Error("Upload your chart as a PNG, JPEG or WebP image so it can be assessed.");
  return mediaType;
}