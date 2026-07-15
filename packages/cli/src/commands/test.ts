import { dirname, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { createManifestProvider, providers, resolveEmoji, validateEmojiTheme, type EmojiProviderRef } from "emoji-styles";
import { loadConfig, loadManifest, validateConfig } from "../config";
import { exists, safeProjectPath, sha256 } from "../files";
import { stringFlag } from "../flags";
import { scanEmoji } from "../project";
import type { CliCheck, CommandContext, CommandResult, ParsedFlags } from "../types";

export async function testCommand(context: CommandContext, flags: ParsedFlags): Promise<CommandResult> {
  const loaded = await loadConfig(context.cwd, stringFlag(flags, "config"));
  const checks: CliCheck[] = validateConfig(loaded.config);
  if (checks.some((check) => check.status === "fail")) return { command: "test", ok: false, summary: "Configuration validation failed.", checks };
  const loadedManifest = await loadManifest(context.cwd, loaded.config);
  const customProvider = loadedManifest ? createManifestProvider(loadedManifest.manifest) : null;
  const resolveRef = (id: string): EmojiProviderRef => customProvider?.id === id ? customProvider : id as EmojiProviderRef;
  const primary = resolveRef(loaded.config.provider);
  const configuredFallbacks = loaded.config.fallbacks;
  const fallbackIds = loaded.config.nativeFallback === false || configuredFallbacks.includes("native")
    ? configuredFallbacks
    : [...configuredFallbacks, "native"];
  const fallbacks = fallbackIds.map(resolveRef);
  const used = await scanEmoji(context.cwd, loaded.config.source);
  checks.push({ id: "usage/scan", status: "pass", message: `Found ${used.size} unique emoji in configured source roots` });
  for (const emoji of used.keys()) {
    const result = await resolveEmoji(emoji, { provider: primary, fallbacks });
    const resolved = Boolean(result.selected || result.nativeFallback);
    checks.push({ id: "resolution/used-emoji", status: resolved ? "pass" : "fail", message: resolved ? `${emoji} resolves through ${result.selected?.providerId ?? "native"}` : `${emoji} does not resolve through the configured fallback chain` });
  }
  if (loadedManifest) {
    const root = safeProjectPath(context.cwd, resolve(dirname(loadedManifest.path), loadedManifest.manifest.basePath));
    for (const [emoji, asset] of Object.entries(loadedManifest.manifest.assets)) {
      const path = resolve(root, asset.file);
      if (!await exists(path)) checks.push({ id: "asset/present", status: "fail", message: `Missing ${asset.file} for ${emoji}` });
      else if (!asset.sha256) checks.push({ id: "asset/hash", status: "warn", message: `${asset.file} has no checksum` });
      else checks.push({ id: "asset/hash", status: sha256(await readFile(path)) === asset.sha256 ? "pass" : "fail", message: `${asset.file} checksum ${sha256(await readFile(path)) === asset.sha256 ? "matches" : "does not match"}` });
    }
  }
  if (loaded.config.semanticTokens) {
    try {
      const theme = JSON.parse(await readFile(safeProjectPath(context.cwd, loaded.config.semanticTokens), "utf8")) as unknown;
      const validation = validateEmojiTheme(theme);
      checks.push({ id: "semantic/theme", status: validation.valid ? "pass" : "fail", message: validation.valid ? "Semantic emoji theme is valid" : validation.errors.join("; ") });
    } catch (error) {
      checks.push({ id: "semantic/theme", status: "fail", message: error instanceof Error ? error.message : String(error) });
    }
  }
  for (const id of [loaded.config.provider, ...loaded.config.fallbacks]) {
    const provider = customProvider?.id === id ? customProvider : providers[id as keyof typeof providers];
    if (provider && provider.id !== "native") checks.push({ id: "license/provider", status: provider.license ? "pass" : "fail", message: provider.license ? `${provider.id}: ${provider.license.name}` : `${provider.id} has no license metadata` });
  }
  const failed = checks.filter((check) => check.status === "fail").length;
  return { command: "test", ok: failed === 0, summary: failed ? `${failed} deterministic validation(s) failed.` : `${used.size} used emoji and all configured assets passed validation.`, checks, data: { used: [...used.keys()] } };
}
