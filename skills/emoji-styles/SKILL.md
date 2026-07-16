---
name: emoji-styles
description: Integrate, configure, audit, migrate, and validate deterministic emoji rendering with Emoji Styles. Use when Codex needs to install Emoji Styles, detect a project framework, configure providers or fallbacks, replace raw emoji with semantic tokens, fix emoji accessibility, inspect licensing, add emoji-related CI, or diagnose inconsistent OS emoji rendering.
---

# Emoji Styles

Apply one explicit emoji policy across source code, runtime rendering, tests, and CI. Use the repository CLI for deterministic analysis; do not infer provider coverage, licensing, or asset ownership.

## Workflow

1. Inspect the project before editing.
   - Detect package manager, framework, source roots, SSR, CSP, tests, and existing Emoji Styles packages.
   - Read `emoji-styles.config.json`, semantic themes, provider manifests, and license notices when present.
   - Read [references/configuration.md](references/configuration.md) when creating or changing policy.
   - Copy [assets/emoji-styles.config.json](assets/emoji-styles.config.json) only as a starting template; adapt it to the inspected project.
2. Build the relevant workspace packages when working in the Emoji Styles monorepo:

   ```bash
   pnpm --filter emoji-styles-data build
   pnpm --filter emoji-styles build
   pnpm --filter @emoji-styles/asset-pipeline build
   pnpm --filter emoji-styles-cli build
   ```

3. Run a read-only baseline:

   ```bash
   python3 skills/emoji-styles/scripts/run_audit.py .
   python3 skills/emoji-styles/scripts/validate_project.py .
   ```

   Prefer JSON or SARIF for automation. Never execute target source files during audit.
4. Summarize findings by severity, rule ID, file, and line. Separate deterministic failures from optional product improvements.
5. Propose the smallest coherent change. Read:
   - [references/migration.md](references/migration.md) for raw emoji and semantic-token migrations;
   - [references/accessibility-and-licensing.md](references/accessibility-and-licensing.md) for labels, decorative output, provenance, and redistribution boundaries;
   - [references/frameworks.md](references/frameworks.md) for React, Web Components, SSR, and CSP integration.
6. Preview mutating CLI commands. Apply only after the preview is understood:

   ```bash
   emoji-styles fix ./src --dry-run
   emoji-styles fix ./src --yes
   ```

   Treat unsafe semantic suggestions as human decisions. Never auto-invent a token meaning or accessibility label from appearance alone.
7. Show the code diff, then run focused tests and the project build. Re-run `audit`, `doctor`, and `test` after changes.
8. Report changed policy, provider chain, native fallback state, accessibility behavior, license status, validation commands, and unresolved warnings.

## Decision rules

- Use an image provider when screenshots must match across macOS, Windows, Linux, and CI.
- Use native rendering only when OS-specific glyphs are an intentional product choice.
- Keep `fallbacks` ordered and configure `nativeFallback` separately.
- Preserve original Unicode as accessible or terminal fallback unless the product explicitly forbids native output.
- Prefer semantic tokens for product intent such as `status.warning` or `action.deploy`; keep ordinary expressive content as Unicode/provider rendering.
- Require exact manifests and hashes for reviewed local assets.
- Never add a provider without recording its artwork license and source.
- Route custom visual creation to `$emoji-asset-creator`; this skill handles code integration, not image generation.

## Safety

- Keep write targets inside the project.
- Preview before mutating files and preserve unrelated user changes.
- Do not weaken CSP, accessibility, SSR, or fallback behavior to silence a check.
- Do not claim that a checksum grants redistribution rights.
- Do not invent provider URLs, assets, model provenance, or ownership terms.
- Do not publish packages, push branches, or change external systems unless the user explicitly requests it.
