import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, relative, resolve } from "node:path";
import { emojiData, toEmojiCodepointSequence, validateProviderManifest, type EmojiAssetFormat, type EmojiProviderManifest } from "emoji-styles";
import { booleanFlag, stringFlag } from "../flags";
import { exists, safeProjectPath, sha256, walkFiles, writeJson } from "../files";
import type { CommandContext, CommandResult, ParsedFlags } from "../types";

const FORMATS = new Set<EmojiAssetFormat>(["png", "svg", "webp", "avif"]);

export async function providerCreateCommand(context: CommandContext, directory: string, flags: ParsedFlags): Promise<CommandResult> {
  const input = safeProjectPath(context.cwd, directory);
  const files = await walkFiles(input, new Set([".png", ".svg", ".webp", ".avif"]));
  if (!files.length) return { command: "provider create", ok: false, applied: false, summary: `No supported image assets found in ${directory}.` };
  const formats = new Set(files.map((file) => extname(file).slice(1) as EmojiAssetFormat));
  if (formats.size !== 1) return { command: "provider create", ok: false, applied: false, summary: "A provider must use one asset format. Normalize mixed inputs before creating the provider." };
  const format = [...formats][0];
  if (!FORMATS.has(format)) return { command: "provider create", ok: false, applied: false, summary: `Unsupported asset format: ${format}` };
  if (format === "svg" && !booleanFlag(flags, "allow-svg")) return { command: "provider create", ok: false, applied: false, summary: "Arbitrary SVG input is rejected by default. Sanitize it first or explicitly pass --allow-svg." };
  const reverse = new Map<string, string>();
  for (const emoji of Object.keys(emojiData)) {
    const codepoint = toEmojiCodepointSequence(emoji);
    reverse.set(codepoint, emoji);
    reverse.set(codepoint.replace(/-fe0f/g, ""), emoji);
  }
  const assets: EmojiProviderManifest["assets"] = {};
  const unmatched: string[] = [];
  for (const file of files) {
    const contents = await readFile(file);
    if (contents.byteLength > 5 * 1024 * 1024) return { command: "provider create", ok: false, applied: false, summary: `${relative(input, file)} exceeds the 5 MB asset limit.` };
    const stem = basename(file, extname(file)).toLowerCase().replace(/^emoji[_-]u?/, "").replace(/_/g, "-").replace(/-fe0f/g, "");
    const emoji = reverse.get(stem);
    if (!emoji) { unmatched.push(relative(input, file)); continue; }
    assets[emoji] = { file: relative(input, file).split("\\").join("/"), sha256: sha256(contents) };
  }
  if (!Object.keys(assets).length) return { command: "provider create", ok: false, applied: false, summary: "No filenames matched Unicode codepoint conventions such as 1f680.png or emoji_u1f680.png.", data: { unmatched } };
  const id = stringFlag(flags, "id") ?? "custom-local";
  const licenseName = stringFlag(flags, "license");
  const ownership = stringFlag(flags, "ownership");
  if (!licenseName && !ownership) return { command: "provider create", ok: false, applied: false, summary: "Declare --license or --ownership before creating a provider." };
  const manifest: EmojiProviderManifest = {
    $schema: "https://emoji.style/schemas/emoji-provider.schema.json", id,
    label: stringFlag(flags, "label") ?? id.split(/[-_.]/).map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`).join(" "),
    version: stringFlag(flags, "version") ?? "1.0.0", format, basePath: ".", generated: false,
    source: stringFlag(flags, "source") ?? "local-assets",
    license: { name: licenseName ?? "Proprietary", ...(ownership ? { ownership } : {}) }, assets,
  };
  const validation = validateProviderManifest(manifest);
  if (!validation.valid) return { command: "provider create", ok: false, applied: false, summary: validation.errors.join("; ") };
  const manifestPath = resolve(input, "emoji-provider.json");
  const modulePath = resolve(input, "provider.ts");
  const manifestExists = await exists(manifestPath);
  const moduleExists = await exists(modulePath);
  const changes = [
    { path: manifestPath, action: manifestExists ? "update" as const : "create" as const, description: `Write a hashed manifest for ${Object.keys(assets).length} asset(s)` },
    { path: modulePath, action: moduleExists ? "update" as const : "create" as const, description: "Write a typed provider module" },
  ];
  if (!booleanFlag(flags, "yes")) return { command: "provider create", ok: true, applied: false, summary: `Mapped ${Object.keys(assets).length} asset(s); ${unmatched.length} unmatched. Rerun with --yes to write provider files.`, changes, data: { manifest, unmatched } };
  if ((manifestExists || moduleExists) && !booleanFlag(flags, "force")) return { command: "provider create", ok: false, applied: false, summary: "Provider files already exist. Use --force with --yes to replace them.", changes };
  await writeJson(manifestPath, manifest);
  await writeFile(modulePath, renderProviderModule(), "utf8");
  return { command: "provider create", ok: true, applied: true, summary: `Created ${id} with ${Object.keys(assets).length} hashed asset(s).`, changes, data: { manifest, unmatched } };
}

function renderProviderModule(): string {
  return `import { createManifestProvider, type EmojiProviderManifest } from "emoji-styles";\nimport manifest from "./emoji-provider.json" with { type: "json" };\n\nexport const emojiProvider = createManifestProvider(manifest as EmojiProviderManifest);\n`;
}
