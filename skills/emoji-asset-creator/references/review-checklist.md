# Review checklist

## Style anchor gate

- [ ] Subject communicates the requested meaning.
- [ ] Silhouette is recognizable at 24 px and 48 px.
- [ ] Perspective matches the specification.
- [ ] Lighting direction and contrast are clear.
- [ ] Materials and accent policy match the specification.
- [ ] Composition is centered within the safe area.
- [ ] Background is truly transparent.
- [ ] No text, letters, logos, borders, frames, or extra objects appear.
- [ ] No visible content or shadow touches the edge.
- [ ] Reference use and generation provenance are recorded.

Do not generate the set until every anchor item passes or the user explicitly approves a documented exception.

## Set gate

- [ ] Every requested emoji/token has exactly one canonical asset.
- [ ] Filenames are codepoint sequences or semantic tokens.
- [ ] All assets share dimensions, format, alpha, and safe-area policy.
- [ ] No duplicate, corrupt, missing, or unmapped assets remain.
- [ ] Contact sheet is reviewed on light and dark backgrounds.
- [ ] Perspective, lighting, material, visual weight, and detail are coherent.
- [ ] Manifest hashes and dimensions match runtime files.
- [ ] Unicode fallback and accessible labels exist.
- [ ] `LICENSE.md` and `PROVENANCE.json` are truthful and complete.
- [ ] `emoji-styles doctor`, `emoji-styles test`, project tests, typecheck, and build pass.

Keep the contact sheet outside the runtime provider package.
