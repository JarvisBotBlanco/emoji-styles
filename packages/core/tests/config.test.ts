import { describe, expect, it } from "vitest";
import { defineEmojiConfig } from "../src";

describe("project runtime config", () => {
  it("defines one reusable provider and fallback policy", () => {
    const config = defineEmojiConfig({
      provider: "fluent-animated",
      fallbacks: ["fluent-3d", "twemoji"],
      nativeFallback: false,
    });
    expect(config).toEqual({
      provider: "fluent-animated",
      fallbacks: ["fluent-3d", "twemoji"],
      nativeFallback: false,
    });
    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.fallbacks)).toBe(true);
  });

  it("rejects duplicate or malformed provider policies", () => {
    expect(() => defineEmojiConfig({ fallbacks: ["twemoji", "twemoji"] })).toThrow("duplicate");
    expect(() => defineEmojiConfig({ provider: "Bad Provider" })).toThrow("invalid");
  });
});
