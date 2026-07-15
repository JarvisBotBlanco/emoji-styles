# Emoji Styles CLI

The CLI turns an emoji policy into reproducible project checks and local provider artifacts. Its foundation commands are deterministic and do not call an AI model.

## Run from the monorepo

```bash
pnpm --filter emoji-styles-cli build
node packages/cli/dist/cli.js help
```

The package currently uses the publish candidate name `emoji-styles-cli` and exposes the `emoji-styles` binary. The final public package name and `npx` command will be verified during the publication phase.

## Safe write model

Commands that can change a project first produce a preview. Add `--yes` only after reviewing the proposed files.

```bash
emoji-styles init --provider fluent-3d --fallback noto,twemoji --no-native-fallback
emoji-styles init --provider fluent-3d --fallback noto,twemoji --no-native-fallback --yes
```

An existing configuration is never replaced unless both `--yes` and `--force` are supplied.

## Configuration

`emoji-styles.config.json` is the project-level policy:

```json
{
  "schemaVersion": 1,
  "provider": "fluent-3d",
  "fallbacks": ["twemoji"],
  "nativeFallback": true,
  "source": ["src"],
  "policy": { "allowRemoteAssets": true }
}
```

`fallbacks` is the ordered provider chain. `nativeFallback` is a separate terminal policy: set it to `false` when the UI must never depend on the current OS glyph. Explicitly including `"native"` in `fallbacks` still opts into OS rendering.

The same file can be imported once by React or the universal web package, so runtime components and CLI checks share one policy. See [Project configuration](./CONFIGURATION.md).

`init` detects npm, pnpm, Yarn, or Bun and recognizes React, Next.js, Vue, Nuxt, Svelte, SvelteKit, Angular, and Astro projects.

## Validation

```bash
emoji-styles doctor
emoji-styles test
```

`doctor` validates configuration, dependencies, providers, fallback policy, local manifests, asset presence, hashes, licensing metadata, and SSR/CSP guidance. `test` scans configured sources, resolves every used emoji, and verifies local assets and checksums.

## Local asset sync

The foundation release intentionally requires `--used-only`:

```bash
emoji-styles sync --used-only
emoji-styles sync --used-only --output public/emoji --yes
```

Sync validates HTTP status and image content type, writes normalized Unicode filenames, records SHA-256 hashes, and preserves provider version, source, and license metadata.

## License reports

```bash
emoji-styles licenses --format markdown --output THIRD_PARTY_NOTICES.md
emoji-styles licenses --format json --output emoji-licenses.json
```

Without `--output`, the report is printed and no file is changed.

## Create a provider

Use Unicode codepoint filenames such as `1f680.png` or `emoji_u1f680.png`. A provider uses one normalized image format.

```bash
emoji-styles provider create ./public/product-emoji --id product --ownership "Example Inc."
emoji-styles provider create ./public/product-emoji --id product --ownership "Example Inc." --yes
```

The command maps supported filenames, hashes every asset, validates the manifest and generates a typed `provider.ts`. Image resizing and optimization belong to the dedicated asset-pipeline phase; mixed formats are rejected instead of being modified implicitly.

## Structured output

Every command supports `--json` for CI and agent workflows:

```bash
emoji-styles doctor --json
```

Results use stable check IDs, `ok`, `summary`, optional `checks`, and explicit `applied` state.

## Security boundaries

Write targets must stay inside the project. Asset downloads require explicit approval, respect the remote-assets policy, time out, retry once, enforce image MIME types and a 5 MB limit, and record hashes. Custom provider input also has a 5 MB per-file limit. Arbitrary SVG input is rejected unless explicitly opted in after sanitization.
