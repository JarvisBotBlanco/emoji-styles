import { execFile } from "node:child_process";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

interface FluentMetadata {
  unicode: string;
}

const args = process.argv.slice(2).filter((argument) => argument !== "--");
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(args[0] ?? "");
const outputPath = resolve(repositoryRoot, args[1] ?? "packages/core/src/fluent-animated-data.ts");
const upstreamRevision = "daa0365c09795789ed2bc6e8b228c97736cb6669";
const execFileAsync = promisify(execFile);

if (!args[0]) {
  throw new Error(
    "Usage: tsx scripts/generate-fluent-animated-index.ts <fluentui-emoji-animated checkout> [output]",
  );
}

const { stdout: checkedOutRevision } = await execFileAsync(
  "git",
  ["-C", sourceRoot, "rev-parse", "HEAD"],
  { encoding: "utf8" },
);
if (checkedOutRevision.trim() !== upstreamRevision) {
  throw new Error(
    `Expected microsoft/fluentui-emoji-animated@${upstreamRevision}, found ${checkedOutRevision.trim()}`,
  );
}

const assetsRoot = join(sourceRoot, "assets");
const folders = (await readdir(assetsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

const entries: Array<readonly [string, string, string, boolean]> = [];

for (const folder of folders) {
  const directory = join(assetsRoot, folder);
  const metadata = JSON.parse(
    await readFile(join(directory, "metadata.json"), "utf8"),
  ) as FluentMetadata;
  const directoryEntries = await readdir(directory, { withFileTypes: true });
  const hasSkinTones = directoryEntries.some(
    (entry) => entry.isDirectory() && entry.name === "Default",
  );
  const defaultDirectory = hasSkinTones
    ? join(directory, "Default", "animated")
    : join(directory, "animated");
  const files = (await readdir(defaultDirectory)).filter((file) => file.endsWith(".png"));

  if (files.length !== 1) {
    throw new Error(`${folder}: expected one animated PNG, found ${files.length}`);
  }

  const suffix = hasSkinTones ? "_animated_default.png" : "_animated.png";
  const file = basename(files[0]);
  if (!file.endsWith(suffix)) {
    throw new Error(`${folder}: unexpected animated filename ${file}`);
  }

  entries.push([
    metadata.unicode.toLowerCase().trim().replace(/\s+/g, "-").replace(/-fe0f/g, ""),
    folder,
    file.slice(0, -suffix.length),
    hasSkinTones,
  ]);
}

const rendered = `/**
 * Generated from microsoft/fluentui-emoji-animated metadata.
 * Source revision: ${upstreamRevision}
 * Run: pnpm --filter emoji-styles-scripts generate:fluent-animated -- <checkout>
 */
export const fluentAnimatedAssetNames: Record<
  string,
  readonly [folder: string, basename: string, hasSkinTones: boolean]
> = {
${entries.map(([unicode, folder, file, hasSkinTones]) => `  ${JSON.stringify(unicode)}: [${JSON.stringify(folder)}, ${JSON.stringify(file)}, ${hasSkinTones}],`).join("\n")}
};
`;

await writeFile(outputPath, rendered);
console.log(`Wrote ${entries.length} Fluent Animated families to ${outputPath}`);
