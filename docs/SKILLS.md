# Codex skills

Emoji Styles includes two focused Codex skills:

| Skill | Responsibility |
| --- | --- |
| `$emoji-styles` | Install, configure, audit, migrate, test, and integrate deterministic emoji rendering |
| `$emoji-asset-creator` | Define, generate, normalize, review, package, and register coherent custom emoji artwork |

The source packages live under `skills/`. Repository discovery symlinks under `.agents/skills/` make both skills available when Codex opens this checkout. Codex officially scans `.agents/skills` from the working directory to the repository root and supports symlinked skill folders. See [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills.md).

If Codex was already open before checkout or update, start a new task or restart Codex when the skills do not appear immediately.

## Invoke explicitly

```text
Use $emoji-styles to audit this React app, disable OS-native fallback, and propose safe fixes.
```

```text
Use $emoji-asset-creator to create a coherent set for action.deploy, status.success, and status.warning, then package it as a local provider.
```

The descriptions also allow implicit activation when a request clearly matches a skill. Explicit `$` invocation is useful for judge testing and repeatable demos.

## Install outside this repository

For local experimentation, invoke `$skill-installer` and ask it to install the skill from the public GitHub repository path:

```text
Use $skill-installer to install skills/emoji-styles from Blancochuy/emoji-styles.
```

```text
Use $skill-installer to install skills/emoji-asset-creator from Blancochuy/emoji-styles.
```

Codex detects newly installed skills automatically; restart it if a new skill does not appear. OpenAI recommends packaging reusable skills as a plugin for broader distribution. That distribution layer is intentionally separate from these validated source skills and will be handled with the later MCP/plugin work.

## Dependencies

The skills require:

- Python 3 for small CLI wrappers;
- Node.js 18 or newer;
- the `emoji-styles` binary, either installed in `PATH`, available under local `node_modules/.bin`, or built at `packages/cli/dist/cli.js` in this monorepo.

Set `EMOJI_STYLES_CLI` to an explicit command when testing a custom build:

```bash
EMOJI_STYLES_CLI="node /path/to/packages/cli/dist/cli.js" \
  python3 skills/emoji-styles/scripts/validate_project.py .
```

Image generation is not implemented inside the asset creator skill. The active agent may use any authorized image-generation capability, while the skill's scripts route all technical asset processing through the deterministic Emoji Styles CLI.

## Validation

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py skills/emoji-styles
python3 /path/to/skill-creator/scripts/quick_validate.py skills/emoji-asset-creator
pnpm --filter emoji-styles-scripts test
```

Repository tests validate frontmatter, UI metadata, package size, required resources, Python syntax, and `--help` behavior. Forward tests additionally run both skills against clean temporary projects and exercise the asset workflow through provider packaging.
