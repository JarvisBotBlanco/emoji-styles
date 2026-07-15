import type { EmojiProviderManifest } from "emoji-styles";

export const CONFIG_FILENAME = "emoji-styles.config.json";
export const CONFIG_SCHEMA_VERSION = 1;

export interface EmojiStylesConfig {
  schemaVersion: 1;
  provider: string;
  fallbacks: string[];
  nativeFallback?: boolean;
  source: string[];
  localAssets?: {
    directory: string;
    manifest: string;
  };
  semanticTokens?: string;
  policy?: {
    allowRemoteAssets?: boolean;
  };
}

export type CheckStatus = "pass" | "warn" | "fail";

export interface CliCheck {
  id: string;
  status: CheckStatus;
  message: string;
}

export interface ProposedChange {
  path: string;
  action: "create" | "update";
  description: string;
}

export interface CommandResult<T = unknown> {
  command: string;
  ok: boolean;
  applied?: boolean;
  summary: string;
  checks?: CliCheck[];
  changes?: ProposedChange[];
  data?: T;
}

export interface LoadedConfig {
  config: EmojiStylesConfig;
  path: string;
}

export interface LoadedManifest {
  manifest: EmojiProviderManifest;
  path: string;
}

export interface CommandContext {
  cwd: string;
  fetch: typeof globalThis.fetch;
}

export type FlagValue = string | boolean;
export type ParsedFlags = Record<string, FlagValue>;
