import type { ParsedFlags } from "./types";

export interface ParsedArguments {
  positionals: string[];
  flags: ParsedFlags;
}

export function parseArguments(args: readonly string[]): ParsedArguments {
  const positionals: string[] = [];
  const flags: ParsedFlags = {};
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (!value.startsWith("--")) {
      positionals.push(value);
      continue;
    }
    const [rawName, inlineValue] = value.slice(2).split("=", 2);
    if (rawName.startsWith("no-")) {
      flags[rawName.slice(3)] = false;
      continue;
    }
    if (inlineValue !== undefined) {
      flags[rawName] = inlineValue;
      continue;
    }
    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      flags[rawName] = next;
      index++;
    } else {
      flags[rawName] = true;
    }
  }
  return { positionals, flags };
}

export function stringFlag(flags: ParsedFlags, name: string): string | undefined {
  const value = flags[name];
  return typeof value === "string" ? value : undefined;
}

export function booleanFlag(flags: ParsedFlags, name: string): boolean {
  return flags[name] === true;
}

export function listFlag(flags: ParsedFlags, name: string): string[] | undefined {
  return stringFlag(flags, name)?.split(",").map((value) => value.trim()).filter(Boolean);
}
