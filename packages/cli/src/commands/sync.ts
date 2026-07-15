import { mkdir, writeFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";
import { getEmojiMetadata, providers, resolveEmoji, toEmojiCodepointSequence, type EmojiProviderManifest } from "emoji-styles";
import { loadConfig } from "../config";
import { booleanFlag, stringFlag } from "../flags";
import { safeProjectPath, sha256, writeJson } from "../files";
import { scanEmoji } from "../project";
import type { CommandContext, CommandResult, ParsedFlags } from "../types";

export async function syncCommand(context: CommandContext, flags: ParsedFlags): Promise<CommandResult> {
  const loaded = await loadConfig(context.cwd, stringFlag(flags, "config"));
  const provider = providers[loaded.config.provider as keyof typeof providers];
  if (!provider || provider.id === "native") return { command: "sync", ok: false, applied: false, summary: `sync requires a built-in asset provider; received ${loaded.config.provider}.` };
  const usedOnly = booleanFlag(flags, "used-only");
  if (!usedOnly) return { command: "sync", ok: false, applied: false, summary: "The foundation release requires --used-only to prevent accidental bulk downloads." };
  if (loaded.config.policy?.allowRemoteAssets === false) return { command: "sync", ok: false, applied: false, summary: "Remote asset synchronization is disabled by project policy." };
  const used = await scanEmoji(context.cwd, loaded.config.source);
  const outputDirectory = safeProjectPath(context.cwd, stringFlag(flags, "output") ?? ".emoji-styles/assets");
  const proposed = [...used.keys()].map((emoji) => ({ emoji, codepoint: toEmojiCodepointSequence(emoji) }));
  const changes = [{ path: outputDirectory, action: "create" as const, description: `Sync ${proposed.length} used asset(s) from ${provider.id}@${provider.version}` }];
  if (!booleanFlag(flags, "yes")) return { command: "sync", ok: true, applied: false, summary: `Would sync ${proposed.length} used asset(s). Rerun with --yes to download and write a manifest.`, changes, data: { provider: provider.id, assets: proposed } };
  await mkdir(outputDirectory, { recursive: true });
  const assets: EmojiProviderManifest["assets"] = {};
  for (const emoji of used.keys()) {
    const resolution = await resolveEmoji(emoji, { provider });
    if (!resolution.selected) throw new Error(`${provider.id} cannot resolve ${emoji}`);
    const response = await fetchWithRetry(context.fetch, resolution.selected.url);
    if (!response.ok) throw new Error(`Failed to download ${emoji}: HTTP ${response.status}`);
    const contentType = response.headers.get("content-type")?.split(";", 1)[0] ?? "";
    const expected = resolution.selected.format === "svg" ? "image/svg+xml" : `image/${resolution.selected.format}`;
    if (!contentType || contentType !== expected && !(resolution.selected.format === "png" && contentType === "image/apng")) throw new Error(`Unexpected content type for ${emoji}: ${contentType || "missing"}`);
    const declaredSize = Number(response.headers.get("content-length") ?? 0);
    if (declaredSize > 5 * 1024 * 1024) throw new Error(`Asset for ${emoji} exceeds the 5 MB limit`);
    const data = new Uint8Array(await response.arrayBuffer());
    if (data.byteLength > 5 * 1024 * 1024) throw new Error(`Asset for ${emoji} exceeds the 5 MB limit`);
    const extension = resolution.selected.format;
    const filename = `${toEmojiCodepointSequence(emoji)}.${extension}`;
    await writeFile(resolve(outputDirectory, filename), data);
    assets[emoji] = { file: filename, sha256: sha256(data) };
  }
  const manifest: EmojiProviderManifest = {
    $schema: "https://emoji.style/schemas/emoji-provider.schema.json",
    id: `${provider.id}-local`, label: `${provider.label} Local`, version: provider.version ?? "unversioned",
    format: provider.formats?.[0] ?? extensionFormat([...Object.values(assets)][0]?.file), basePath: ".", generated: false,
    source: provider.source, license: provider.license, assets,
  };
  const manifestPath = resolve(outputDirectory, "emoji-provider.json");
  await writeJson(manifestPath, manifest);
  return { command: "sync", ok: true, applied: true, summary: `Synced ${Object.keys(assets).length} asset(s) and wrote ${relative(context.cwd, manifestPath)}.`, changes, data: { manifest } };
}

async function fetchWithRetry(fetcher: typeof fetch, url: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetcher(url, { redirect: "follow", signal: controller.signal });
      if (response.status < 500 || attempt === 1) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === 1) throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Asset download failed");
}

function extensionFormat(file?: string): "png" | "svg" | "webp" | "avif" {
  const extension = extname(file ?? "").slice(1);
  return extension === "svg" || extension === "webp" || extension === "avif" ? extension : "png";
}
