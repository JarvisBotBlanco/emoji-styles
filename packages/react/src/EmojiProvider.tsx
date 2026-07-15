"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  publicProviders,
  type EmojiAssetProvider,
  type EmojiProviderRef,
  type EmojiStylesConfig,
  type EmojiStyle,
  type EmojiTheme,
} from "emoji-styles";

export interface EmojiContextValue {
  defaultProvider: EmojiProviderRef;
  fallbacks?: readonly EmojiProviderRef[];
  nativeFallback?: boolean;
  theme?: EmojiTheme;
  locale?: string;
  providers?: Readonly<Record<string, EmojiAssetProvider>>;
}
const EmojiContext = createContext<EmojiContextValue>({ defaultProvider: publicProviders.twemoji });
export function useEmojiContext() { return useContext(EmojiContext); }

export interface EmojiProviderProps {
  /** Project-level runtime policy, typically imported from emoji-styles.config.ts/json. */
  config?: EmojiStylesConfig;
  provider?: EmojiProviderRef;
  fallbacks?: readonly EmojiProviderRef[];
  /** Append native OS emoji after the configured provider chain. Defaults to true. */
  nativeFallback?: boolean;
  theme?: EmojiTheme;
  locale?: string;
  /** Registry used by serialized themes that reference custom providers by id. */
  providers?: Readonly<Record<string, EmojiAssetProvider>>;
  /** @deprecated Prefer provider for new integrations. */
  defaultStyle?: EmojiStyle;
  children: ReactNode;
}
export function EmojiProvider({ config, provider, fallbacks, nativeFallback, theme, locale, providers, defaultStyle, children }: EmojiProviderProps) {
  const configProvider = typeof config?.provider === "string"
    ? providers?.[config.provider] ?? config.provider as EmojiProviderRef
    : config?.provider as EmojiProviderRef | undefined;
  const configFallbacks = useMemo(() => config?.fallbacks?.map((fallback) =>
    typeof fallback === "string"
      ? providers?.[fallback] ?? fallback as EmojiProviderRef
      : fallback as EmojiProviderRef
  ), [config?.fallbacks, providers]);
  const themeProvider = typeof theme?.defaultProvider === "string"
    ? providers?.[theme.defaultProvider] ?? theme.defaultProvider as EmojiProviderRef
    : theme?.defaultProvider;
  const themeFallbacks = useMemo(() => theme?.fallbacks?.map((fallback) =>
    typeof fallback === "string"
      ? providers?.[fallback] ?? fallback as EmojiProviderRef
      : fallback as EmojiProviderRef
  ), [theme?.fallbacks, providers]);
  const value = useMemo<EmojiContextValue>(() => ({
    defaultProvider: provider ?? defaultStyle ?? configProvider ?? themeProvider ?? publicProviders.twemoji,
    fallbacks: fallbacks ?? configFallbacks ?? themeFallbacks,
    nativeFallback: nativeFallback ?? config?.nativeFallback ?? theme?.nativeFallback,
    theme,
    locale,
    providers,
  }), [provider, fallbacks, nativeFallback, config?.nativeFallback, configProvider, configFallbacks, themeFallbacks, theme, locale, providers, defaultStyle, themeProvider]);
  return <EmojiContext.Provider value={value}>{children}</EmojiContext.Provider>;
}
