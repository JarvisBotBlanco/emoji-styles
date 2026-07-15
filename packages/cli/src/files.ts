import { createHash } from "node:crypto";
import { access, readFile, readdir, stat, writeFile, mkdir } from "node:fs/promises";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";

export async function exists(path: string): Promise<boolean> {
  return access(path).then(() => true, () => false);
}

export async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function sha256(data: Uint8Array | string): string {
  return createHash("sha256").update(data).digest("hex");
}

export async function walkFiles(root: string, extensions?: ReadonlySet<string>): Promise<string[]> {
  if (!await exists(root)) return [];
  const rootStat = await stat(root);
  if (rootStat.isFile()) return !extensions || extensions.has(extname(root).toLowerCase()) ? [root] : [];
  const output: string[] = [];
  const visit = async (directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === "build") continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (!extensions || extensions.has(extname(entry.name).toLowerCase())) output.push(path);
    }
  };
  await visit(root);
  return output.sort();
}

export function projectPath(cwd: string, path: string): string {
  return resolve(cwd, path);
}

export function safeProjectPath(cwd: string, path: string): string {
  const output = resolve(cwd, path);
  const relation = relative(resolve(cwd), output);
  if (relation === ".." || relation.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) || isAbsolute(relation)) {
    throw new Error(`Path must stay inside the project: ${path}`);
  }
  return output;
}

export function displayPath(cwd: string, path: string): string {
  const value = relative(cwd, path);
  return value || ".";
}
