import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createManifestProvider, providers, validateEmojiTheme, validateProvider, validateProviderManifest } from "emoji-styles";
import { loadConfig, loadManifest, validateConfig } from "../config";
import { exists, safeProjectPath, sha256 } from "../files";
import { inspectProject } from "../project";
import type { CliCheck, CommandContext, CommandResult, ParsedFlags } from "../types";
import { stringFlag } from "../flags";

export async function doctorCommand(context: CommandContext, flags: ParsedFlags): Promise<CommandResult> {
  const checks: CliCheck[] = [];
  let loaded;
  try {
    loaded = await loadConfig(context.cwd, stringFlag(flags, "config"));
    checks.push({ id: "config/file", status: "pass", message: `Loaded ${loaded.path}` });
  } catch (error) {
    checks.push({ id: "config/file", status: "fail", message: error instanceof Error ? error.message : String(error) });
    return finish(checks);
  }
  checks.push(...validateConfig(loaded.config));
  if (checks.some((check) => check.status === "fail")) return finish(checks);
  const project = await inspectProject(context.cwd);
  const dependencies = {
    ...((project.packageJson?.dependencies as Record<string, string> | undefined) ?? {}),
    ...((project.packageJson?.devDependencies as Record<string, string> | undefined) ?? {}),
  };
  checks.push({ id: "dependency/core", status: dependencies["emoji-styles"] ? "pass" : "warn", message: dependencies["emoji-styles"] ? `emoji-styles ${dependencies["emoji-styles"]}` : "emoji-styles is not declared in this project's dependencies" });
  for (const source of loaded.config.source) checks.push({ id: "source/root", status: await exists(resolve(context.cwd, source)) ? "pass" : "fail", message: await exists(resolve(context.cwd, source)) ? `Source root exists: ${source}` : `Source root not found: ${source}` });
  const primary = providers[loaded.config.provider as keyof typeof providers];
  if (primary) {
    const validation = validateProvider(primary);
    checks.push({ id: "provider/primary", status: validation.valid ? "pass" : "fail", message: validation.valid ? `${primary.id}@${primary.version} is valid` : validation.errors.join("; ") });
    if (loaded.config.policy?.allowRemoteAssets === false && !primary.local) checks.push({ id: "policy/remote", status: "fail", message: `${primary.id} uses remote assets but policy forbids them` });
  } else if (!loaded.config.localAssets) {
    checks.push({ id: "provider/primary", status: "fail", message: `Unknown provider: ${loaded.config.provider}` });
  }
  for (const fallback of loaded.config.fallbacks) {
    checks.push({ id: `provider/fallback/${fallback}`, status: providers[fallback as keyof typeof providers] ? "pass" : "fail", message: providers[fallback as keyof typeof providers] ? `Fallback ${fallback} is available` : `Unknown fallback provider: ${fallback}` });
  }
  try {
    const loadedManifest = await loadManifest(context.cwd, loaded.config);
    if (loadedManifest) {
      const validation = validateProviderManifest(loadedManifest.manifest);
      checks.push({ id: "manifest/schema", status: validation.valid ? "pass" : "fail", message: validation.valid ? `${loadedManifest.manifest.id}@${loadedManifest.manifest.version} manifest is valid` : validation.errors.join("; ") });
      const providerValidation = validateProvider(createManifestProvider(loadedManifest.manifest));
      checks.push({ id: "provider/primary", status: loadedManifest.manifest.id === loaded.config.provider && providerValidation.valid ? "pass" : "fail", message: loadedManifest.manifest.id === loaded.config.provider ? `${loadedManifest.manifest.id}@${loadedManifest.manifest.version} is valid` : `Configured provider ${loaded.config.provider} does not match manifest ${loadedManifest.manifest.id}` });
      const assetRoot = safeProjectPath(context.cwd, resolve(dirname(loadedManifest.path), loadedManifest.manifest.basePath));
      for (const [emoji, asset] of Object.entries(loadedManifest.manifest.assets)) {
        const path = resolve(assetRoot, asset.file);
        if (!await exists(path)) checks.push({ id: "manifest/asset", status: "fail", message: `Missing asset for ${emoji}: ${asset.file}` });
        else if (asset.sha256 && sha256(await readFile(path)) !== asset.sha256) checks.push({ id: "manifest/hash", status: "fail", message: `Checksum mismatch for ${emoji}: ${asset.file}` });
      }
      if (!loadedManifest.manifest.license) checks.push({ id: "license/manifest", status: "warn", message: "Local provider has no license metadata" });
    }
  } catch (error) {
    checks.push({ id: "manifest/load", status: "fail", message: error instanceof Error ? error.message : String(error) });
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
  checks.push({ id: "ssr/csp", status: project.ssr ? "pass" : "warn", message: project.ssr ? "SSR framework detected; use the package static stylesheet for CSP-safe rendering" : "No SSR framework detected" });
  return finish(checks);
}

function finish(checks: CliCheck[]): CommandResult {
  const failed = checks.filter((check) => check.status === "fail").length;
  const warnings = checks.filter((check) => check.status === "warn").length;
  return { command: "doctor", ok: failed === 0, summary: failed ? `${failed} check(s) failed and ${warnings} warning(s) reported.` : `All required checks passed with ${warnings} warning(s).`, checks };
}
