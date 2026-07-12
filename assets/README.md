# Local emoji assets

This directory is reserved for reproducible copies of openly licensed emoji artwork. Generated provider directories are intentionally ignored until their source, version, checksum manifest, and notices have passed review.

The first supported pipeline targets Twemoji 15.1.0:

```bash
pnpm assets:check
pnpm assets:sync
```

`assets:check` validates configuration without downloading files. `assets:sync` downloads only codepoints present in the core catalog, applies strictly lossless optimization, and writes `assets/twemoji/manifest.json` with SHA-256 checksums and format metadata.

Optimization is conservative:

- static PNG files are recompressed losslessly;
- animated GIF and WebP candidates retain frame count, delays, and loop metadata;
- APNG files are detected from their `acTL` chunk and preserved byte-for-byte;
- candidates are rejected when animation metadata changes or output size does not improve.

Do not place Apple, Samsung, or other proprietary artwork here without written redistribution permission and an update to `LICENSE_POLICY.md`.
