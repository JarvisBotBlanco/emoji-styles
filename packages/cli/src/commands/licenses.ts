import { dirname, resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { providers, type ProviderLicense } from "emoji-styles";
import { loadConfig, loadManifest } from "../config";
import { stringFlag } from "../flags";
import type { CommandContext, CommandResult, ParsedFlags } from "../types";
import { mkdir } from "node:fs/promises";
import { safeProjectPath } from "../files";

interface LicenseEntry {
  provider: string;
  version: string;
  source?: string;
  license: ProviderLicense | null;
}

export async function licensesCommand(context: CommandContext, flags: ParsedFlags): Promise<CommandResult> {
  const loaded = await loadConfig(context.cwd, stringFlag(flags, "config"));
  const loadedManifest = await loadManifest(context.cwd, loaded.config);
  const ids = [...new Set([loaded.config.provider, ...loaded.config.fallbacks])];
  const entries: LicenseEntry[] = ids.map((id) => {
    if (loadedManifest?.manifest.id === id) return { provider: id, version: loadedManifest.manifest.version, source: loadedManifest.manifest.source, license: loadedManifest.manifest.license ?? null };
    const provider = providers[id as keyof typeof providers];
    return { provider: id, version: provider?.version ?? "unknown", source: provider?.source, license: provider?.license ?? null };
  });
  const format = stringFlag(flags, "format") ?? "terminal";
  if (!new Set(["terminal", "json", "markdown"]).has(format)) return { command: "licenses", ok: false, summary: `Unsupported format: ${format}` };
  const content = format === "json" ? `${JSON.stringify({ schemaVersion: 1, providers: entries }, null, 2)}\n` : renderMarkdown(entries);
  const output = stringFlag(flags, "output");
  if (output) {
    const path = safeProjectPath(context.cwd, output);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, "utf8");
  }
  const missing = entries.filter((entry) => entry.provider !== "native" && !entry.license);
  return { command: "licenses", ok: missing.length === 0, applied: Boolean(output), summary: missing.length ? `${missing.length} provider(s) have no license metadata.` : `Generated attribution for ${entries.length} provider(s).`, data: { entries, content, output } };
}

function renderMarkdown(entries: LicenseEntry[]): string {
  const sections = entries.map((entry) => {
    const license = entry.license;
    return [`## ${entry.provider}@${entry.version}`, "", `- License: ${license?.name ?? "Not declared"}`, entry.source ? `- Source: ${entry.source}` : null, license?.url ? `- License URL: ${license.url}` : null, license?.attribution ? `- Attribution: ${license.attribution}` : null, license?.ownership ? `- Ownership: ${license.ownership}` : null].filter((line): line is string => line !== null).join("\n");
  });
  return `# Third-party emoji notices\n\n${sections.join("\n\n")}\n`;
}
