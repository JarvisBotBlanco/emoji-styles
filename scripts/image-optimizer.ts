import sharp from "sharp";

export type ImageFormat = "png" | "apng" | "gif" | "webp" | "unknown";

export interface OptimizedImage {
  data: Buffer;
  sourceFormat: ImageFormat;
  outputFormat: Exclude<ImageFormat, "apng" | "unknown"> | "apng" | "unknown";
  animated: boolean;
  frames: number;
  loop?: number;
  delays?: number[];
  sourceBytes: number;
  outputBytes: number;
  lossless: true;
  optimized: boolean;
  reason: string;
}

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function pngHasAnimation(buffer: Buffer): boolean {
  if (buffer.length < PNG_SIGNATURE.length || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return false;
  }

  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    if (type === "acTL") return true;
    if (type === "IDAT" || type === "IEND") return false;
    offset += 12 + length;
  }
  return false;
}

function webpHasAnimation(buffer: Buffer): boolean {
  if (buffer.length < 16) return false;
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return false;
  }
  return buffer.includes(Buffer.from("ANIM")) || buffer.includes(Buffer.from("ANMF"));
}

export function detectImageFormat(buffer: Buffer): ImageFormat {
  if (buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return pngHasAnimation(buffer) ? "apng" : "png";
  const gifHeader = buffer.toString("ascii", 0, 6);
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") return "gif";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "webp";
  }
  return "unknown";
}

function sameNumbers(left?: number[], right?: number[]): boolean {
  if (!left && !right) return true;
  if (!left || !right || left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

export async function optimizeImage(input: Buffer): Promise<OptimizedImage> {
  const sourceFormat = detectImageFormat(input);
  const sourceBytes = input.length;

  if (sourceFormat === "unknown") {
    return unchanged(input, sourceFormat, false, 1, "Unsupported image signature");
  }

  // Sharp/libvips does not expose APNG as a documented multi-page input. Passing
  // it through an ordinary PNG encoder could silently retain only the first frame.
  if (sourceFormat === "apng") {
    return unchanged(input, sourceFormat, true, 1, "APNG preserved byte-for-byte");
  }

  const readAnimated = sourceFormat === "gif" || (sourceFormat === "webp" && webpHasAnimation(input));
  const metadata = await sharp(input, { animated: readAnimated }).metadata();
  const frames = metadata.pages ?? 1;
  const animated = frames > 1 || readAnimated;
  const loop = animated ? metadata.loop ?? 0 : undefined;
  const delays = animated ? metadata.delay : undefined;

  let candidate: Buffer;
  let outputFormat: "png" | "webp";

  if (sourceFormat === "png") {
    candidate = await sharp(input).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
    outputFormat = "png";
  } else {
    candidate = await sharp(input, { animated }).webp({
      lossless: true,
      effort: 6,
      minSize: animated,
      loop,
      delay: delays,
    }).toBuffer();
    outputFormat = "webp";
  }

  const candidateMetadata = await sharp(candidate, { animated }).metadata();
  const candidateFrames = candidateMetadata.pages ?? 1;
  const candidateLoop = animated ? candidateMetadata.loop ?? 0 : undefined;
  const candidateDelays = animated ? candidateMetadata.delay : undefined;

  if (
    candidateFrames !== frames ||
    candidateLoop !== loop ||
    !sameNumbers(candidateDelays, delays)
  ) {
    return unchanged(input, sourceFormat, animated, frames, "Rejected: animation metadata changed", loop, delays);
  }

  if (candidate.length >= input.length) {
    return unchanged(input, sourceFormat, animated, frames, "Original is smaller or equal", loop, delays);
  }

  return {
    data: candidate,
    sourceFormat,
    outputFormat,
    animated,
    frames,
    loop,
    delays,
    sourceBytes,
    outputBytes: candidate.length,
    lossless: true,
    optimized: true,
    reason: "Lossless candidate is smaller",
  };
}

function unchanged(
  data: Buffer,
  format: ImageFormat,
  animated: boolean,
  frames: number,
  reason: string,
  loop?: number,
  delays?: number[],
): OptimizedImage {
  return {
    data,
    sourceFormat: format,
    outputFormat: format,
    animated,
    frames,
    loop,
    delays,
    sourceBytes: data.length,
    outputBytes: data.length,
    lossless: true,
    optimized: false,
    reason,
  };
}
