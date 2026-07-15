import { resolve } from "node:path";
import { CONFIG_FILENAME, type CommandContext, type CommandResult, type EmojiStylesConfig, type ParsedFlags } from "../types";
import { booleanFlag, listFlag, stringFlag } from "../flags";
import { defaultConfig } from "../config";
import { exists, safeProjectPath, writeJson } from "../files";
import { inspectProject } from "../project";

export async function initCommand(context: CommandContext, flags: ParsedFlags): Promise<CommandResult> {
  const project = await inspectProject(context.cwd);
  const path = safeProjectPath(context.cwd, stringFlag(flags, "config") ?? CONFIG_FILENAME);
  const alreadyExists = await exists(path);
  const localDirectory = stringFlag(flags, "local-assets");
  const semanticTokens = stringFlag(flags, "semantic-tokens");
  const config: EmojiStylesConfig = defaultConfig({
    provider: stringFlag(flags, "provider") ?? (localDirectory ? "custom-local" : "fluent-3d"),
    fallbacks: listFlag(flags, "fallback") ?? ["twemoji"],
    nativeFallback: flags["native-fallback"] !== false,
    source: listFlag(flags, "source") ?? ["src"],
    ...(localDirectory ? { localAssets: { directory: localDirectory, manifest: `${localDirectory.replace(/\/$/, "")}/emoji-provider.json` } } : {}),
    ...(semanticTokens ? { semanticTokens } : {}),
  });
  const changes = [{ path, action: alreadyExists ? "update" as const : "create" as const, description: "Write the Emoji Styles project policy" }];
  if (!booleanFlag(flags, "yes")) {
    return {
      command: "init", ok: true, applied: false,
      summary: `Detected ${project.framework}${project.ssr ? " (SSR)" : ""} with ${project.packageManager}. Review the proposed configuration and rerun with --yes to apply.`,
      changes, data: { project: publicProject(project), config, install: installSuggestion(project.packageManager, project.framework), example: integrationExample(project.framework) },
    };
  }
  if (alreadyExists && !booleanFlag(flags, "force")) {
    return { command: "init", ok: false, applied: false, summary: `${CONFIG_FILENAME} already exists. Use --force with --yes to replace it.`, changes };
  }
  await writeJson(path, config);
  return { command: "init", ok: true, applied: true, summary: `Created ${CONFIG_FILENAME}.`, changes, data: { project: publicProject(project), config, install: installSuggestion(project.packageManager, project.framework), example: integrationExample(project.framework) } };
}

function publicProject(project: Awaited<ReturnType<typeof inspectProject>>) {
  return { packageManager: project.packageManager, framework: project.framework, ssr: project.ssr };
}

function integrationExample(framework: string): string {
  if (framework === "react" || framework === "next") return 'import config from "../emoji-styles.config.json";\nimport "react-emoji-styles/styles.css";\nimport { Emoji, EmojiProvider } from "react-emoji-styles";\n\n<EmojiProvider config={config}><Emoji emoji="🚀" label="Launch" /></EmojiProvider>';
  return 'import config from "../emoji-styles.config.json";\nimport "emoji-styles-web/styles.css";\nimport { configureEmojiStyles, defineStyledEmoji } from "emoji-styles-web";\n\nconfigureEmojiStyles(config);\ndefineStyledEmoji();\n// <styled-emoji emoji="🚀" label="Launch"></styled-emoji>';
}

function installSuggestion(manager: string, framework: string): string {
  const packages = framework === "react" || framework === "next" ? "emoji-styles react-emoji-styles" : "emoji-styles emoji-styles-web";
  if (manager === "pnpm") return `pnpm add ${packages}`;
  if (manager === "yarn") return `yarn add ${packages}`;
  if (manager === "bun") return `bun add ${packages}`;
  return `npm install ${packages}`;
}
