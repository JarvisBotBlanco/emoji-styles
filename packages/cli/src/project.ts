import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { tokenizeEmojiText } from "emoji-styles";
import { exists, readJson, safeProjectPath, walkFiles } from "./files";

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".html", ".vue", ".svelte", ".astro"]);

export interface ProjectInfo {
  packageManager: "pnpm" | "yarn" | "npm" | "bun" | "unknown";
  framework: string;
  ssr: boolean;
  packageJson: Record<string, unknown> | null;
}

export async function inspectProject(cwd: string): Promise<ProjectInfo> {
  const packagePath = resolve(cwd, "package.json");
  const packageJson = await exists(packagePath) ? await readJson<Record<string, unknown>>(packagePath) : null;
  const dependencies = {
    ...((packageJson?.dependencies as Record<string, string> | undefined) ?? {}),
    ...((packageJson?.devDependencies as Record<string, string> | undefined) ?? {}),
  };
  const packageManager = await exists(resolve(cwd, "pnpm-lock.yaml")) ? "pnpm"
    : await exists(resolve(cwd, "yarn.lock")) ? "yarn"
    : await exists(resolve(cwd, "bun.lockb")) || await exists(resolve(cwd, "bun.lock")) ? "bun"
    : await exists(resolve(cwd, "package-lock.json")) ? "npm"
    : "unknown";
  const candidates: Array<[string, boolean]> = [
    ["next", true], ["nuxt", true], ["@sveltejs/kit", true], ["astro", true],
    ["react", false], ["vue", false], ["svelte", false], ["@angular/core", false],
  ];
  const match = candidates.find(([dependency]) => dependency in dependencies);
  return { packageManager, framework: match?.[0] ?? "vanilla", ssr: match?.[1] ?? false, packageJson };
}

export async function scanEmoji(cwd: string, roots: readonly string[]): Promise<Map<string, string[]>> {
  const found = new Map<string, Set<string>>();
  for (const root of roots) {
    for (const path of await walkFiles(safeProjectPath(cwd, root), SOURCE_EXTENSIONS)) {
      const content = await readFile(path, "utf8");
      for (const token of tokenizeEmojiText(content)) {
        if (token.type !== "emoji") continue;
        const locations = found.get(token.value) ?? new Set<string>();
        locations.add(`${root}/${basename(path)}`);
        found.set(token.value, locations);
      }
    }
  }
  return new Map([...found].map(([emoji, paths]) => [emoji, [...paths].sort()]));
}
