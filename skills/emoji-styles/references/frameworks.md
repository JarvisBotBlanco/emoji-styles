# Framework integration

## React

Use `react-emoji-styles`, import its static stylesheet, and provide policy near the application root.

```tsx
import { Emoji, EmojiProvider, publicProviders } from "react-emoji-styles";
import "react-emoji-styles/styles.css";

<EmojiProvider provider={publicProviders.fluent3d} fallbacks={[publicProviders.twemoji]} nativeFallback={false}>
  <Emoji emoji="🚀" label="Deploy application" />
</EmojiProvider>
```

Use `EmojiToken` for product semantics and `EmojiText` for arbitrary strings containing complete grapheme sequences.

## Vue, Svelte, Angular, Astro, and vanilla HTML

Use the `emoji-styles-web` Web Component or the framework-agnostic core. Register `<styled-emoji>` once, then pass provider policy explicitly. Avoid framework-specific reimplementations of URL and fallback logic.

## SSR and CSP

- Emit complete initial markup on the server.
- Import static CSS; do not require runtime style injection.
- Use browser-native image loading as progressive enhancement.
- Verify no hydration mismatch with React 18 and 19.
- Keep provider asset origins compatible with `img-src`.
- Prefer local assets for the strictest content security policy.

## Tests

Test the configured primary provider, ordered fallbacks, terminal native policy, missing asset behavior, local path resolution, accessibility labels, reduced motion, SSR, and hydration.
