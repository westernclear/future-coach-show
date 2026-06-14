export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_IMAGE_MAX_PIXELS = 12_000_000;
export const PROFILE_IMAGE_MIN_EDGE = 320;
export const PROFILE_IMAGE_BLUR_THRESHOLD = 45;
export const PROFILE_IMAGE_DECODE_TIMEOUT_MS = 2_500;

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
    return "That image has too many pixels. Choose one smaller than 12 megapixels.";
  }
  return null;
}

export function readEncodedImageDimensions(bytes: Uint8Array, type: SupportedImageType): { width: number; height: number } | null {
  if (type === "image/png" && bytes.length >= 24) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (type === "image/jpeg") {
    let offset = 2;
    while (offset + 8 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1];
      if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
      const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
      if (length < 2 || offset + length + 2 > bytes.length) return null;
      if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
        return {
          height: (bytes[offset + 5] << 8) | bytes[offset + 6],
          width: (bytes[offset + 7] << 8) | bytes[offset + 8],
        };
      }
      offset += length + 2;
    }
  }
  if (type === "image/webp" && bytes.length >= 30) {
    const chunk = String.fromCharCode(...bytes.slice(12, 16));
    if (chunk === "VP8X") {
      return {
        width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16),
        height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16),
      };
    }
    if (chunk === "VP8 " && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
      return { width: (bytes[26] | (bytes[27] << 8)) & 0x3fff, height: (bytes[28] | (bytes[29] << 8)) & 0x3fff };
    }
    if (chunk === "VP8L" && bytes[20] === 0x2f) {
      const bits = bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
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