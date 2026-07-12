import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { detectImageFormat, optimizeImage } from "../image-optimizer";

function pngChunk(type: string, data = Buffer.alloc(0)): Buffer {
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write(type, 4, 4, "ascii");
  data.copy(chunk, 8);
  return chunk;
}

describe("image optimizer", () => {
  it("detects APNG from its animation control chunk", () => {
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const apng = Buffer.concat([signature, pngChunk("acTL", Buffer.alloc(8)), pngChunk("IEND")]);
    expect(detectImageFormat(apng)).toBe("apng");
  });

  it("preserves APNG byte-for-byte", async () => {
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const apng = Buffer.concat([signature, pngChunk("acTL", Buffer.alloc(8)), pngChunk("IEND")]);
    const result = await optimizeImage(apng);
    expect(result.optimized).toBe(false);
    expect(result.animated).toBe(true);
    expect(result.data.equals(apng)).toBe(true);
  });

  it("keeps static PNG pixels identical after lossless optimization", async () => {
    const source = await sharp({
      create: { width: 12, height: 12, channels: 4, background: "#14b8a6" },
    }).png({ compressionLevel: 0 }).toBuffer();
    const result = await optimizeImage(source);
    const before = await sharp(source).raw().toBuffer();
    const after = await sharp(result.data).raw().toBuffer();

    expect(result.sourceFormat).toBe("png");
    expect(result.outputFormat).toBe("png");
    expect(after.equals(before)).toBe(true);
    expect(result.outputBytes).toBeLessThanOrEqual(result.sourceBytes);
  });

  it("preserves animation timing and looping when optimizing GIF", async () => {
    const redFrame = await sharp({
      create: { width: 3, height: 3, channels: 4, background: "#ef4444" },
    }).png().toBuffer();
    const tealFrame = await sharp({
      create: { width: 3, height: 3, channels: 4, background: "#14b8a6" },
    }).png().toBuffer();

    const source = await sharp([redFrame, tealFrame], { join: { animated: true } })
      .gif({ delay: [70, 130], loop: 2 })
      .toBuffer();
    const result = await optimizeImage(source);

    expect(result.sourceFormat).toBe("gif");
    expect(result.animated).toBe(true);
    expect(result.frames).toBe(2);
    expect(result.delays).toEqual([70, 130]);
    expect(result.loop).toBe(2);

    const outputMetadata = await sharp(result.data, { animated: true }).metadata();
    expect(outputMetadata.pages).toBe(2);
    expect(outputMetadata.delay).toEqual([70, 130]);
    expect(outputMetadata.loop).toBe(2);
  });

  it("leaves unknown files unchanged", async () => {
    const source = Buffer.from("not-an-image");
    const result = await optimizeImage(source);
    expect(result.outputFormat).toBe("unknown");
    expect(result.data.equals(source)).toBe(true);
  });
});
