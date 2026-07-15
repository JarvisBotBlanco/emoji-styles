import { describe, expect, it } from "vitest";
import { createCdnProvider } from "../src/providers";
import { getEmojiUrl, getFallbackChain, hasEmoji } from "../src/url";

describe("emoji URL API", () => {
  it("builds provider URLs", () => {
    expect(getEmojiUrl("🚀", "noto")).toContain("/png/128/emoji_u1f680.png");
    expect(getEmojiUrl("🚀", "fluent-3d")).toContain("/assets/Rocket/3D/rocket_3d.png");
  });

  it("uses official Fluent paths when CLDR labels differ", () => {
    expect(getEmojiUrl("🌑", "fluent-color")).toContain(
      "/assets/New%20moon/Color/new_moon_color.svg",
    );
    expect(getEmojiUrl("🚄", "fluent-flat")).toContain(
      "/assets/High-speed%20train/Flat/high-speed_train_flat.svg",
    );
  });

  it("removes variation selectors from Twemoji paths", () => {
    expect(getEmojiUrl("❤️", "twemoji")).toContain("/2764.png");
  });

  it("returns null for unknown emojis", () => {
    expect(hasEmoji("not-an-emoji")).toBe(false);
    expect(getEmojiUrl("not-an-emoji", "noto")).toBeNull();
  });

  it("includes Twemoji as a fallback", () => {
    expect(getFallbackChain("🚀", "noto")[1]).toContain("twemoji");
  });

  it("keeps native rendering native without a CDN fallback", () => {
    expect(getEmojiUrl("🚀", "native")).toBeNull();
    expect(getFallbackChain("🚀", "native")).toEqual([]);
  });

  it("supports custom asset providers", () => {
    const provider = createCdnProvider({
      id: "company",
      label: "Company",
      baseUrl: "https://assets.example.com/emoji/v1",
      extension: "webp",
      visibility: "custom",
    });
    expect(getEmojiUrl("🚀", provider)).toBe(
      "https://assets.example.com/emoji/v1/rocket_1f680.webp",
    );
  });
});
