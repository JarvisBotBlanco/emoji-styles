import type { EmojiAssetProvider, EmojiProviderRef } from "./types";

export type EmojiConfigProviderRef = EmojiProviderRef | string;

/** Runtime subset shared by project config files and framework adapters. */
export interface EmojiStylesConfig {
  provider?: EmojiConfigProviderRef;
  fallbacks?: readonly EmojiConfigProviderRef[];
  nativeFallback?: boolean;
}

function providerId(ref: EmojiConfigProviderRef): string {
  return typeof ref === "string" ? ref : ref.id;
}

function validProvider(ref: unknown): ref is EmojiConfigProviderRef {
  if (typeof ref === "string") return /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(ref);
  return Boolean(ref && typeof ref === "object" && typeof (ref as EmojiAssetProvider).id === "string");
}

/**
 * Validate and freeze the runtime policy exported by `emoji-styles.config.ts`.
 * Extra CLI-only fields remain structurally compatible when a JSON config is imported.
 */
export function defineEmojiConfig<T extends EmojiStylesConfig>(config: T): Readonly<T> {
  if (!config || typeof config !== "object") throw new Error("Emoji Styles config must be an object");
  if (config.provider !== undefined && !validProvider(config.provider)) {
    throw new Error("Emoji Styles config provider is invalid");
  }
  if (config.fallbacks !== undefined && !Array.isArray(config.fallbacks)) {
    throw new Error("Emoji Styles config fallbacks must be an array");
  }
  const ids = new Set<string>();
  for (const fallback of config.fallbacks ?? []) {
    if (!validProvider(fallback)) throw new Error("Emoji Styles config contains an invalid fallback provider");
    const id = providerId(fallback);
    if (ids.has(id)) throw new Error(`Emoji Styles config contains duplicate fallback: ${id}`);
    ids.add(id);
  }
  if (config.nativeFallback !== undefined && typeof config.nativeFallback !== "boolean") {
    throw new Error("Emoji Styles config nativeFallback must be boolean");
  }
  return Object.freeze({
    ...config,
    ...(config.fallbacks ? { fallbacks: Object.freeze([...config.fallbacks]) } : {}),
  });
}
