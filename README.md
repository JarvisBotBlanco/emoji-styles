<div align="center">

# Emoji Styles

**A multi-provider emoji library for React — 8 providers, automatic fallbacks, lazy loading, and framework-agnostic core.**

[![npm version](https://img.shields.io/npm/v/emoji-styles?color=cb3837&label=emoji-styles&logo=npm)](https://www.npmjs.com/package/emoji-styles)
[![npm version](https://img.shields.io/npm/v/react-emoji-styles?color=cb3837&label=react-emoji-styles&logo=npm)](https://www.npmjs.com/package/react-emoji-styles)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e.svg)](./LICENSE)
[![CI](https://github.com/JarvisBotBlanco/emoji-styles/actions/workflows/ci.yml/badge.svg)](https://github.com/JarvisBotBlanco/emoji-styles/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/badge/bundle%20size-<2%20kB%20gzip-10b981)](./packages/core)

[Features](#features) · [Providers](#providers) · [Quick Start](#quick-start) · [API](#api-reference) · [Framework Examples](#framework-examples) · [Development](#development)

</div>

---

<!-- TODO: Add a screenshot or animated GIF showing the same emoji rendered across multiple providers side by side -->

## What is Emoji Styles?

Emoji Styles gives you a single, typed API to render Unicode emoji through **8 interchangeable visual providers** — from Apple's design to Google's, Microsoft Teams' 3D style, Samsung, animated variants, Twemoji, and native Unicode. A built-in fallback chain ensures every emoji renders even when an image source is unavailable. A React component, hooks, and a framework-agnostic core let you use it anywhere.

## Features

- ✅ **8 emoji providers** — Microsoft Teams, Apple, Google, Samsung, Animated, Twemoji CDN, Twemoji Local, Native Unicode
- ✅ **Automatic fallback chain** — gracefully degrades through providers when images fail to load
- ✅ **IntersectionObserver lazy loading** — emoji load only when they enter the viewport, with skeleton placeholders
- ✅ **React component (`<Emoji>`)** — drop-in component with props for provider, size, alt text, and lazy loading
- ✅ **Hooks (`useEmoji`)** — get emoji URLs and metadata for custom UI
- ✅ **Provider system (`EmojiProvider`)** — set a default provider at the app level, override per-emoji
- ✅ **Framework-agnostic core** — URL generation, emoji data, and fallback logic work in Vue, Svelte, Angular, or vanilla JS
- ✅ **Self-hosted Twemoji assets** — bundle Twemoji PNGs with your app, no CDN dependency
- ✅ **TypeScript strict mode** — full type safety across all packages
- ✅ **ESM output** — works with modern bundlers (Vite, Webpack, esbuild)

## Providers

| Provider | Package Key | Style | Format | Description |
| --- | --- | --- | --- | --- |
| Microsoft Teams | `microsoft-teams` | 3D | PNG | Microsoft Teams' distinctive 3D emoji design |
| Apple | `apple` | Classic | PNG | Apple's iconic emoji set, as seen across iOS and macOS |
| Google | `google` | Material | PNG | Google's Material Design emoji with clean, modern styling |
| Samsung | `samsung` | Bold | PNG | Samsung's rich, colorful emoji rendering |
| Animated | `animated` | Animated | GIF | Animated Noto Color Emoji — emoji that move |
| Twemoji CDN | `twemoji` | Flat | PNG | Twitter/Twemoji assets loaded from jsDelivr CDN |
| Twemoji Local | `localTwemoji` | Flat | PNG | Twemoji assets bundled with your app (no external requests) |
| Native Unicode | `native` | System | N/A | Uses the user's OS-native emoji rendering |

```ts
import { publicProviders } from "react-emoji-styles";

// Use any provider directly
<Emoji emoji="🔥" provider={publicProviders.twemoji} />
<Emoji emoji="🚀" provider={publicProviders.microsoftTeams} />
```

## Quick Start

```bash
npm install react-emoji-styles
```

```tsx
import { Emoji, publicProviders } from "react-emoji-styles";

export function Celebration() {
  return <Emoji emoji="🎉" provider={publicProviders.twemoji} size="xl" alt="Celebration" />;
}
```

That's it. The `<Emoji>` component renders a Twemoji PNG image with proper alt text, automatic lazy loading, and fallback to native Unicode if the image fails.

### Set a default provider for your app

```tsx
import { Emoji, EmojiProvider, publicProviders } from "react-emoji-styles";

<EmojiProvider provider={publicProviders.twemoji}>
  <Emoji emoji="🔥" />  {/* Uses twemoji by default */}
  <Emoji emoji="✨" size={48} />
  <Emoji emoji="🚀" provider={publicProviders.google} />  {/* Override per-emoji */}
</EmojiProvider>
```

## Advanced Usage

### Custom providers

Build your own provider for proprietary emoji assets:

```ts
import { createCdnProvider } from "emoji-styles";

const companyProvider = createCdnProvider({
  id: "company-emoji",
  label: "Company Assets",
  baseUrl: "https://assets.example.com/emoji/v1",
  extension: "png",
  visibility: "custom",
});

getEmojiUrl("🚀", companyProvider);
```

### Fallback chain

Configure providers to try multiple sources automatically:

```ts
import { createFallbackProvider, publicProviders } from "react-emoji-styles";

const safeProvider = createFallbackProvider([
  publicProviders.localTwemoji,  // Try local first (fast, no network)
  publicProviders.twemoji,        // Then CDN
  "native",                        // Then native Unicode as last resort
]);

<Emoji emoji="🔥" provider={safeProvider} />
```

### Lazy loading with skeleton placeholders

Lazy loading is **enabled by default**. Emoji images load only when they scroll into the viewport:

```tsx
<Emoji emoji="🚀" lazy={true} />   {/* Default behavior */}
<Emoji emoji="🚀" lazy={false} />  {/* Load immediately */}
```

While loading, a lightweight skeleton placeholder is rendered to prevent layout shift.

## Framework Examples

### React (recommended)

```tsx
import { Emoji, EmojiProvider, publicProviders } from "react-emoji-styles";

function ChatMessage({ text }) {
  return (
    <EmojiProvider provider={publicProviders.twemoji}>
      <p>{text}</p>
    </EmojiProvider>
  );
}
```

### Vue

```vue
<script setup>
import { getEmojiUrl } from "emoji-styles";
</script>

<template>
  <img
    v-for="emoji in ['🚀', '🔥', '✨']"
    :key="emoji"
    :src="getEmojiUrl(emoji, 'twemoji')"
    :alt="emoji"
    width="32"
    height="32"
  />
</template>
```

### Svelte

```svelte
<script>
  import { getEmojiUrl } from "emoji-styles";

  const emojis = ["🚀", "🔥", "✨"];
</script>

{#each emojis as emoji}
  <img src={getEmojiUrl(emoji, "twemoji")} alt={emoji} width="32" height="32" />
{/each}
```

### Angular

```typescript
import { Component } from "@angular/core";
import { getEmojiUrl } from "emoji-styles";

@Component({
  selector: "app-emoji",
  template: `
    <img *ngFor="let emoji of emojis" [src]="getUrl(emoji)" [alt]="emoji" width="32" height="32" />
  `,
})
export class EmojiComponent {
  emojis = ["🚀", "🔥", "✨"];
  getUrl(e: string) {
    return getEmojiUrl(e, "twemoji");
  }
}
```

## API Reference

### `<Emoji>` Component

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `emoji` | `string` | *(required)* | Unicode emoji character to render |
| `provider` | `EmojiAssetProvider` | app default | Asset provider to use for this emoji |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| number` | `"md"` | Preset size (`xs`=12px to `3xl`=48px) or exact pixel value |
| `alt` | `string` | `"Emoji: {emoji}"` | Accessible alt text for the image |
| `className` | `string` | `""` | Additional CSS class on the container |
| `lazy` | `boolean` | `true` | Use IntersectionObserver for viewport-based loading |
| `fallback` | `boolean` | `true` | Render native emoji if image fails to load |

### `useEmoji` Hook

```ts
const { url, exists } = useEmoji("🚀", publicProviders.twemoji);
```

Returns an object with:
- **`url`** — the resolved image URL, or `null` if no provider handles the emoji
- **`exists`** — boolean indicating whether the emoji is available in the provider's catalog

### Core Functions

```ts
import { getEmojiUrl, hasEmoji, getEmojiData, getAvailableEmojis } from "emoji-styles";

getEmojiUrl("🚀", "twemoji");          // "https://cdn.jsdelivr.net/.../1f680.png"
hasEmoji("🚀");                         // true
getEmojiData("🚀");                     // { unicode, name, ... }
getAvailableEmojis();                   // All mapped emoji entries
```

## Packages

| Package | Purpose |
| --- | --- |
| [`emoji-styles`](./packages/core) | Framework-agnostic: URL generation, emoji data, provider abstraction, fallback logic |
| [`react-emoji-styles`](./packages/react) | React: `<Emoji>`, `<EmojiProvider>`, `<EmojiGrid>`, `useEmoji` hook |
| [`emoji-styles-assets-twemoji`](./packages/assets-twemoji) | Self-hosted Twemoji PNG assets with local provider |

## Development

Requirements: Node.js 18+ and pnpm 10.

```bash
# Install dependencies
pnpm install

# Type checking
pnpm typecheck

# Run tests
pnpm test

# Build all packages
pnpm build

# Verify emoji assets are present
pnpm assets:check

# Start the dev server (Vite demo app)
pnpm dev
```

The workspace contains:
- `packages/core` — framework-agnostic emoji logic
- `packages/react` — React bindings
- `demo/` — Vite-powered demo application

## License

Source code is available under the [MIT License](./LICENSE).

Emoji artwork is provided by external services and may have separate licenses or usage terms. See [LICENSE_POLICY.md](./LICENSE_POLICY.md) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

## Acknowledgments

Built with ❤️ during **OpenAI Build Week**.

- **Codex** was used to build the core architecture, URL generation system, and automatic fallback chain
- **Codex** was used to optimize the React component's IntersectionObserver-based lazy loading and skeleton placeholder system
- **GPT-5.6** helped design the provider abstraction layer that makes adding new emoji sources straightforward

---

<p align="center">
  <img src="https://em-content.zobj.net/source/microsoft-teams/400/rocket_1f680.png" alt="Microsoft Teams" width="48" />
  <img src="https://em-content.zobj.net/source/apple/453/rocket_1f680.png" alt="Apple" width="48" />
  <img src="https://em-content.zobj.net/source/google/350/rocket_1f680.png" alt="Google" width="48" />
  <img src="https://em-content.zobj.net/source/samsung/320/rocket_1f680.png" alt="Samsung" width="48" />
  <img src="https://em-content.zobj.net/source/animated-noto-color-emoji/461/rocket_1f680.gif" alt="Animated" width="48" />
  <img src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/72x72/1f680.png" alt="Twemoji" width="48" />
</p>
