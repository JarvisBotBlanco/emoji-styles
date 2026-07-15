# OpenAI Build Week baseline

This document separates the repository state verified at the start of the Build Week hardening plan from work completed afterward. It is an engineering record, not a substitute for the `/feedback` session ID or the project description required by the submission form.

## Snapshot

| Field | Verified value |
| --- | --- |
| Baseline date | 2026-07-15 (America/Monterrey) |
| Baseline commit | `a2c4ea0c474aad0a54ef0081ed4f89e8c77b79a3` |
| Baseline branch | `master` |
| Repository | `https://github.com/Blancochuy/emoji-styles` |
| Earliest commit visible in Git | `4602b0b9b7a9856cb104df8072c6bb7d4a6bc179`, 2026-07-12 01:14:48 UTC |

The Git history available in this clone does not establish an earlier pre-event version. Before submission, the owner must confirm the official event start time and the commit that should be treated as the challenge boundary. Likewise, model and session attribution cannot be inferred from Git: the final submission must use Codex `/feedback` to capture the actual session ID and verify the GPT-5.6 requirement.

## What exists at the baseline

- A pnpm monorepo with a framework-agnostic ESM core, React bindings, a local Twemoji asset package, a Vite demo, asset tooling, and GitHub Actions CI.
- Typed public providers for Fluent Emoji, Noto Emoji, Twemoji, and native Unicode, plus CDN and semantic mapped-provider factories.
- React components and hooks for single emoji, text tokenization, context defaults, fallbacks, lazy loading, and grids.
- A generated catalog of 893 entries and a validated local Twemoji bundle containing 892 PNG assets.
- Licensing boundaries and notices for code and third-party artwork.

The baseline packages are versioned `0.1.0` but deliberately remain `private: true`; none is published to npm.

## Reproducible validation

All commands below were run from a clean checkout of the baseline commit using Node.js 24.4.1 and pnpm 10.13.1.

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Pass; pnpm reported ignored build scripts for `esbuild` and `sharp` |
| Unit tests | `pnpm test` | Pass; 33 tests across core, React, assets, and scripts |
| Type checking | `pnpm typecheck` | Pass |
| Production builds | `pnpm build` | Pass |
| Asset integrity | `pnpm assets:check` | Pass; 892 catalog assets validated |
| Clean consumer install | Install the three generated tarballs with React 18.3.1 into an empty npm project | Pass; all public package entry points import successfully |
| Consumer audit | `npm install` in the clean fixture | Pass; 0 reported vulnerabilities |
| Workspace audit | `pnpm audit --prod` | Inconclusive; the registry returned HTTP 410 for pnpm's audit endpoint |

Baseline output sizes:

| Artifact | Uncompressed build output | Packed tarball |
| --- | ---: | ---: |
| `emoji-styles` | 87.33 KB JavaScript; 4.53 KB declarations | 25 KB |
| `react-emoji-styles` | 13.72 KB JavaScript; 2.52 KB declarations | 5.3 KB |
| `emoji-styles-assets-twemoji` | 822 B JavaScript; 404 B declarations | 753 KB, including 892 PNGs |
| Demo | 239.18 KB JavaScript; 29.08 KB CSS | Not packaged |

The package names `emoji-styles`, `react-emoji-styles`, and `emoji-styles-assets-twemoji` returned npm registry `404 Not Found` on the snapshot date. This indicates that they were not published then, but name availability must be checked again immediately before publishing.

## Baseline risks and gaps

### P0 — Unicode sequence coverage

The tokenizer preserves extended grapheme clusters, but the generated metadata and built-in provider path do not cover important multi-codepoint sequences. The generator takes only `entry.unified.split("-")[0]` for the character key and explicitly excludes flags and keycaps. A clean consumer probe produced:

| Sequence | Tokenized as one emoji | Present in catalog | Built-in Twemoji URL |
| --- | --- | --- | --- |
| `😀` | Yes | Yes | Yes |
| `❤️` | Yes | Yes | Yes |
| `👍🏽` | Yes | No | No |
| `👨‍💻` | Yes | No | No |
| `👨‍👩‍👧‍👦` | Yes | No | No |
| `🇲🇽` | Yes | No | No |
| `1️⃣` | Yes | No | No |

This is the first implementation priority because the product promise depends on deterministic rendering of real-world emoji sequences, not only single code points.

### P0 — Publication readiness

- All three packages are private and cannot be published as configured.
- Tarballs install correctly together and workspace dependencies become versioned `0.1.0` dependencies, but the package tarballs contain no package-level README.
- Registry name availability, npm ownership, provenance, release automation, and a dry-run publish still need verification.

### P1 — SSR and strict CSP behavior

- Server rendering does not access the browser globals directly and completes without throwing.
- With default lazy loading, SSR returns only a skeleton and no image. With `lazy={false}`, it returns an image at opacity zero plus the skeleton, so useful no-JavaScript rendering is not yet guaranteed.
- `Emoji` and `EmojiGrid` create `<style>` elements at runtime for skeleton keyframes. Sites with a strict `style-src` policy may reject this unless they allow inline styles or supply a nonce. No CSP-safe stylesheet export exists yet.
- There is no explicit server-render/hydration regression suite.

### P1 — Distribution and maintenance

- The generated catalog is embedded in the core bundle; data cannot yet be installed or updated independently.
- CI validates React 18 and 19, but clean tarball installation and SSR behavior are not CI jobs.
- `pnpm install` requires an explicit project decision for ignored dependency build scripts.
- `demo/src/template:` is an empty tracked file and should be removed during the next cleanup touching the demo.
- A first-party CLI, framework adapters beyond React, MCP integration, and Codex skill are not present at baseline. They are future scope, not baseline regressions.

## Phase 1 acceptance target

The next phase should stay focused on Unicode correctness:

1. Preserve complete normalized codepoint sequences in generated keys and metadata.
2. Add fixtures for skin tones, variation selectors, ZWJ professions and families, flags, and keycaps.
3. Make built-in URL resolution and the local Twemoji manifest agree on supported sequences.
4. Keep grapheme tokenization deterministic and define normalization behavior explicitly.
5. Re-run the complete baseline suite and the clean-consumer probe before starting publication or new adapters.

No package publication, provider expansion, CLI, MCP server, or landing-page redesign belongs in Phase 1 unless it is required to prove this Unicode contract.
