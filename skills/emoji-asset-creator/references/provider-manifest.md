# Provider packaging

Keep normalized runtime assets under one provider directory:

```text
custom-emoji/<provider-id>/
├── assets/
├── emoji-provider.json
├── provider.ts
├── theme.ts
├── LICENSE.md
├── PROVENANCE.json
└── README.md
```

Use one raster format per provider. Unicode assets use codepoint sequence filenames; token-only assets use stable semantic identifiers.

## Mapping file

```json
[
  {
    "file": "action.deploy.webp",
    "emoji": "🚀",
    "token": "action.deploy",
    "label": "Deploy application"
  }
]
```

Every mapping requires an exact file and either an emoji, token, or both. Preserve a Unicode fallback for semantic tokens.

## Package command

```bash
emoji-styles assets build ./custom-emoji/acme/assets \
  --output ./custom-emoji/acme \
  --id acme \
  --mapping ./custom-emoji/acme/mapping.json \
  --provenance ./custom-emoji/acme/provenance-input.json
```

Preview first, then add `--yes`. Existing output requires `--force` as well. Inspect the generated manifest, module, theme, notice, and provenance before registering.

The manifest must use safe relative paths, exact dimensions and hashes, one normalized emoji grapheme per Unicode key, a provider version, asset source, and truthful license fields. Never add API keys or local absolute paths.
