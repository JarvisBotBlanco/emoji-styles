# Accessibility and licensing

## Accessibility

- Give meaningful emoji images a concise label derived from product meaning, not appearance alone.
- Mark purely decorative output decorative so assistive technology does not announce noise.
- Label emoji-only buttons and links independently from the image `alt` value.
- Preserve the original Unicode grapheme as fallback when an image fails.
- Keep ZWJ, skin-tone, flag, keycap, and variation-selector sequences intact.
- Verify server markup and hydration when using SSR.
- Respect reduced motion for animated providers and provide a static fallback.

## Licensing

Separate source-code licensing from artwork licensing. For each artwork provider record:

- provider and asset version;
- source URL or repository revision;
- license name and attribution requirements;
- ownership when assets are proprietary;
- provenance and generator/model when generated;
- modifications performed by the pipeline.

A hash proves integrity only. It does not establish authorship, ownership, trademark permission, training-data rights, or redistribution rights.

Never copy artwork from a website merely because it is publicly viewable. Never infer that static and animated collections share identical terms without checking their authoritative source.
