# Local emoji assets

This directory is reserved for reproducible copies of openly licensed emoji artwork. Generated provider directories are intentionally ignored until their source, version, checksum manifest, and notices have passed review.

The first supported pipeline targets Twemoji 15.1.0:

```bash
pnpm assets:check
pnpm assets:sync
```

`assets:check` validates configuration without downloading files. `assets:sync` downloads only codepoints present in the core catalog and writes `assets/twemoji/manifest.json` with SHA-256 checksums.

Do not place Apple, Samsung, or other proprietary artwork here without written redistribution permission and an update to `LICENSE_POLICY.md`.
