# Asset specification

Create `custom-emoji/<provider-id>/asset-spec.json` before image generation.

```json
{
  "providerId": "acme-gothic",
  "version": "1.0.0",
  "style": {
    "description": "Clean gothic iconography with soft 3D depth",
    "perspective": "front three-quarter",
    "lighting": "soft upper-left",
    "outline": "none",
    "background": "transparent",
    "detailLevel": "medium",
    "materials": ["matte black", "dark silver"],
    "accentPolicy": "one purple accent per asset"
  },
  "canvas": {
    "width": 512,
    "height": 512,
    "safeArea": 0.76
  },
  "output": {
    "format": "webp",
    "width": 256,
    "height": 256,
    "transparent": true
  },
  "tokens": [
    {
      "token": "action.deploy",
      "emoji": "🚀",
      "label": "Deploy application",
      "subject": "Launching rocket"
    }
  ]
}
```

## Defaults

- Start with a 512×512 generation canvas and normalize to 256×256.
- Use `safeArea: 0.76` unless the existing design system demonstrates another measurable standard.
- Require transparent background for runtime assets.
- Prefer WebP for compact local packs and PNG when tooling compatibility matters more.
- Keep one consistent perspective, light direction, material system, and edge treatment.
- Include a Unicode fallback and an accessible label for every semantic token.
- Record whether animation is allowed. Use a separate frame-preserving workflow for animation.

Do not infer brand colors, ownership, or accessibility meaning from an image alone. Record assumptions in the final report.
