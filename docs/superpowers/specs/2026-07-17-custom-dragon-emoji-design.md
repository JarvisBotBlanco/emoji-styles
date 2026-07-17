# Custom Dragon Emoji Design

## Goal

Add one original Chinese flying dragon emoji to the landing page as an independent local provider, following the same deterministic asset workflow used by `agent-core`.

## Public identity

- Provider ID: `custom-dragon`
- Display name: `Chinese Dragon`
- Semantic token: `dragon.emoji`
- Unicode fallback and mapping: `🐉`
- Runtime asset: `assets/1f409.webp`
- Provider fallback: `publicProviders.fluent3d`

The provider remains separate from `custom-emoji` and every other Custom Emoji Lab example. Existing assets and providers are not replaced.

## Visual system

The anchor is one original Chinese dragon in flight. Its serpentine body forms a compact S-shaped silhouette, with a dominant head in front three-quarter view. The expression is fierce and intimidating. Jade-green scales and a darker green underside form the primary palette; crimson-red horns are the sole strong accent; intense golden eyes reinforce the face.

Claws and flowing whiskers remain connected visually to the main silhouette. The dimensional illustrated treatment uses controlled medium-high detail on the head and simplified detail along the body so the subject remains recognizable at 48 px and 24 px. Soft dramatic light comes from the upper left, with strong value separation for both light and dark page backgrounds.

The asset contains exactly one dragon. It has no wings, fire, clouds, scenery, text, letters, logos, frames, detached effects, cast shadows, or secondary objects. It does not imitate a proprietary emoji vendor.

## Composition and output

- Generation canvas: 1024×1024
- Runtime dimensions: 256×256
- Runtime format: lossless WebP
- Safe area: 0.76
- Runtime background: fully transparent
- Edge treatment: crisp, without colored fringe
- Animation: not allowed

Because the subject is predominantly green, the built-in image generation workflow uses a perfectly flat `#ff00ff` chroma-key background only as an intermediate source. The chroma background is removed locally. No colored background is present in the runtime asset.

## Generation prompt

> Create one original standalone custom emoji representing a fierce Chinese flying dragon. Show a compact serpentine body arranged in a strong S-shaped silhouette, with the head dominant in a front three-quarter view. Use detailed jade-green scales, a darker green underside, crimson-red horns, sharp claws, flowing whiskers, and intense golden eyes. The dragon should feel intimidating and airborne while remaining readable at 24 px. Use polished dimensional illustration with controlled medium-high detail, dramatic soft upper-left lighting, crisp edges, and strong light-dark separation. Center the entire subject inside a 76% safe area. Exactly one dragon; no wings, fire, clouds, scenery, text, letters, logos, frames, cast shadows, or extra objects. Create it on a perfectly flat solid `#ff00ff` chroma-key background with no gradients or texture, and do not use magenta anywhere on the dragon.

## Provider package

Create `demo/src/custom-emoji/custom-dragon/` with:

- `asset-spec.json`
- `assets/1f409.webp`
- `mapping.json`
- `emoji-provider.json`
- `runtime.ts`
- `provider.ts`
- `theme.ts`
- `README.md`
- `PROVENANCE.json`
- `LICENSE.md`

The manifest records dimensions, format, SHA-256, generator information, source, ownership status, and license status. Since legal ownership cannot be inferred, both ownership and asset license remain `License status: user confirmation required`.

## Landing-page integration

Add a `Chinese Dragon` entry to `CUSTOM_EXAMPLES` in the Custom Emoji Lab. The card displays the generated asset and selects the independent `customDragonProvider`. Its detail panel shows `dragon.emoji`, `256×256 · WebP · local`, and a snippet using the provider. `agent-core` remains the initial selection.

## Validation

The style anchor must pass visual review at full size, 48 px, and 24 px. The final file must have an alpha channel, transparent corners, no magenta residue, one connected subject, no edge contact, and occupancy within the 76% safe area.

Run deterministic asset inspection, normalization, set validation, manifest generation, focused provider mapping and fallback tests, demo tests, TypeScript checking, and the production build. Browser validation covers card selection, asset rendering, responsive layout, and light/dark contrast where available.

## Provenance boundary

The image is generated with OpenAI's built-in image generation tool from this approved human direction without external reference images. Provenance records chroma-key removal, transparent-bound cropping, centering, resizing, and lossless WebP conversion. The workflow records evidence but does not claim legal clearance.
