export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_IMAGE_MAX_PIXELS = 24_000_000;
export const PROFILE_IMAGE_MIN_EDGE = 320;
export const PROFILE_IMAGE_BLUR_THRESHOLD = 45;

export type SupportedImageType = "image/jpeg" | "image/png" | "image/webp";

export function detectImageType(bytes: Uint8Array): SupportedImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function validateImageDimensions(width: number, height: number): string | null {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < PROFILE_IMAGE_MIN_EDGE || height < PROFILE_IMAGE_MIN_EDGE) {
    return `Choose an image at least ${PROFILE_IMAGE_MIN_EDGE} × ${PROFILE_IMAGE_MIN_EDGE} pixels.`;
  }
  if (width * height > PROFILE_IMAGE_MAX_PIXELS) {
    return "That image has too many pixels. Choose one smaller than 24 megapixels.";
  }
  return null;
}

export function calculateBlurScore(pixels: Uint8Array | Uint8ClampedArray, width: number, height: number): number {
  const step = Math.max(1, Math.floor(Math.max(width, height) / 320));
  let count = 0;
  let sum = 0;
  let sumSquares = 0;
  const luminance = (x: number, y: number) => {
    const offset = (y * width + x) * 4;
    return pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114;
  };
  for (let y = step; y < height - step; y += step) {
    for (let x = step; x < width - step; x += step) {
      const laplacian =
        luminance(x - step, y) + luminance(x + step, y) +
        luminance(x, y - step) + luminance(x, y + step) - 4 * luminance(x, y);
      sum += laplacian;
      sumSquares += laplacian * laplacian;
      count += 1;
    }
  }
  if (count === 0) return 0;
  const mean = sum / count;
  return sumSquares / count - mean * mean;
}