import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Emoji,
  EmojiProvider,
  getAvailableEmojis,
  getEmojiData,
  providers,
} from "react-emoji-styles";
import type { EmojiAssetProvider, EmojiSize } from "react-emoji-styles";
import { localTwemojiProvider } from "emoji-styles-assets-twemoji";

// ─── Constants ───

const nativeProvider: EmojiAssetProvider = {
  id: "native",
  label: "Native Unicode",
  visibility: "custom",
  getUrl: () => null,
};

const STYLES: { key: string; label: string; emoji: string; provider: EmojiAssetProvider }[] = [
  { key: "microsoft-teams", label: "Microsoft Teams", emoji: "🏢", provider: providers["microsoft-teams"] },
  { key: "apple", label: "Apple", emoji: "", provider: providers.apple },
  { key: "google", label: "Google", emoji: "🔵", provider: providers.google },
  { key: "samsung", label: "Samsung", emoji: "📱", provider: providers.samsung },
  { key: "animated", label: "Animated", emoji: "✨", provider: providers.animated },
  { key: "twemoji-local", label: "Twemoji Local", emoji: "📦", provider: localTwemojiProvider },
  { key: "twemoji-cdn", label: "Twemoji CDN", emoji: "☁️", provider: providers.twemoji },
  { key: "native", label: "Native", emoji: "Aa", provider: nativeProvider },
];

type SizeOption = { label: string; value: EmojiSize; px: number };
const SIZES: SizeOption[] = [
  { label: "xs", value: "xs", px: 12 },
  { label: "sm", value: "sm", px: 16 },
  { label: "md", value: "md", px: 20 },
  { label: "lg", value: "lg", px: 24 },
  { label: "xl", value: "xl", px: 32 },
  { label: "2xl", value: "2xl", px: 40 },
  { label: "3xl", value: "3xl", px: 48 },
];

const EMOJI_BATCH_SIZE = 180;

// ─── Hero floating emojis ───

const HERO_FLOATING_EMOJIS = [
  { emoji: "🚀", provider: providers["microsoft-teams"], style: { top: "12%", left: "5%", fontSize: "56px", animationDelay: "0s" } },
  { emoji: "❤️", provider: providers.apple, style: { top: "18%", right: "8%", fontSize: "48px", animationDelay: "1.2s" } },
  { emoji: "🔥", provider: providers.google, style: { bottom: "20%", left: "8%", fontSize: "52px", animationDelay: "2.4s" } },
  { emoji: "✨", provider: providers.samsung, style: { top: "8%", right: "22%", fontSize: "40px", animationDelay: "0.6s" } },
  { emoji: "🎉", provider: providers.animated, style: { bottom: "15%", right: "5%", fontSize: "44px", animationDelay: "1.8s" } },
  { emoji: "🌈", provider: localTwemojiProvider, style: { top: "35%", left: "2%", fontSize: "36px", animationDelay: "3s" } },
  { emoji: "💡", provider: providers.twemoji, style: { bottom: "30%", right: "18%", fontSize: "38px", animationDelay: "0.9s" } },
  { emoji: "⚡", provider: providers.apple, style: { top: "50%", left: "12%", fontSize: "32px", animationDelay: "2s" } },
];

// ─── Feature cards ───

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
    title: "Multi-Provider",
    description: "Switch between 8 emoji styles with a single prop. Teams, Apple, Google, Samsung, and more.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Smart Fallback",
    description: "Automatic fallback chain when an emoji fails to load. Always renders something.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Lazy Loading",
    description: "IntersectionObserver-based loading with skeleton placeholders. Zero layout shift.",
  },
];

// ─── Framework code examples ───

const FRAMEWORK_EXAMPLES = [
  {
    id: "react",
    label: "React",
    code: `import { Emoji, EmojiProvider, providers } from 'react-emoji-styles';

<EmojiProvider provider={providers.apple}>
  <Emoji emoji="🚀" size="lg" />
</EmojiProvider>`,
  },
  {
    id: "vue",
    label: "Vue",
    code: `<template>
  <EmojiProvider :provider="appleProvider">
    <Emoji emoji="🚀" size="lg" />
  </EmojiProvider>
</template>

<script setup>
import { Emoji, EmojiProvider } from 'react-emoji-styles/vue';
import { providers } from 'react-emoji-styles';
const appleProvider = providers.apple;
</script>`,
  },
  {
    id: "svelte",
    label: "Svelte",
    code: `<script>
  import { Emoji, EmojiProvider } from 'react-emoji-styles/svelte';
  import { providers } from 'react-emoji-styles';
</script>

<EmojiProvider provider={providers.apple}>
  <Emoji emoji="🚀" size="lg" />
</EmojiProvider>`,
  },
  {
    id: "angular",
    label: "Angular",
    code: `// component.ts
import { EmojiModule } from 'react-emoji-styles/angular';
import { providers } from 'react-emoji-styles';

@Component({
  standalone: true,
  imports: [EmojiModule],
  template: \`
    <emoji-provider [provider]="appleProvider">
      <emoji emoji="🚀" size="lg"></emoji>
    </emoji-provider>
  \`,
})`,
  },
];

// ─── Lazy Emoji Cell ───

function LazyEmojiCell({
  emoji,
  size,
  emojiProvider,
}: {
  emoji: string;
  size: number;
  emojiProvider: EmojiAssetProvider;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const prevStyleRef = useRef(emojiProvider);
  const data = getEmojiData(emoji);

  useEffect(() => {
    if (prevStyleRef.current !== emojiProvider) {
      prevStyleRef.current = emojiProvider;
      setLoaded(false);
    }
  }, [emojiProvider]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || loaded) return;
    const el = containerRef.current;
    if (!el) return;
    const timeout = setTimeout(() => {
      const img = el.querySelector("img");
      if (!img) {
        setLoaded(true);
        return;
      }
      if (img.complete) {
        setLoaded(true);
        return;
      }
      const handleLoad = () => setLoaded(true);
      img.addEventListener("load", handleLoad);
      return () => img.removeEventListener("load", handleLoad);
    }, 50);
    return () => clearTimeout(timeout);
  }, [visible, loaded, emojiProvider]);

  return (
    <div
      ref={containerRef}
      className="emoji-cell"
      title={data?.alt ?? emoji}
    >
      {!visible && <div className="skeleton" />}
      {visible && !loaded && <div className="skeleton" />}
      {visible && (
        <div className={`emoji-cell-inner ${loaded ? "fade-in" : ""}`}>
          <Emoji emoji={emoji} size={size} provider={emojiProvider} lazy />
        </div>
      )}
      <span className="emoji-label">{data?.alt ?? emoji}</span>
    </div>
  );
}

// ─── SVG Icons ───

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function NpmIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019v13.36h-4.123V9.82H9.477v8.878H5.13V5.323z" />
    </svg>
  );
}

// ─── Copy Button Component ───

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      className="copy-button"
      onClick={handleCopy}
      title={label ?? "Copy to clipboard"}
      aria-label={label ?? "Copy to clipboard"}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {label && <span>{copied ? "Copied!" : label}</span>}
    </button>
  );
}

// ─── Syntax Highlighter (CSS-based) ───

function highlightCode(code: string, language: string): React.ReactNode {
  const lines = code.split("\n");
  return lines.map((line, i) => {
    let highlighted = line;
    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="hl-comment">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="hl-comment">$1</span>');
    // Strings (double, single, backtick)
    highlighted = highlighted.replace(/(&quot;[^&]*?&quot;|"[^"]*?"|'[^']*?'|`[^`]*?`)/g, '<span class="hl-string">$1</span>');
    // Keywords
    const keywords = language === "ts"
      ? /\b(import|export|from|const|let|var|function|return|if|else|new|default|type|interface|as|async|await)\b/g
      : /\b(import|export|from|const|let|var|function|return|if|else|new|default|async|await|template|script|setup|class|selector|standalone|imports)\b/g;
    highlighted = highlighted.replace(keywords, '<span class="hl-keyword">$1</span>');
    // JSX/HTML tags
    highlighted = highlighted.replace(/(&lt;\/?[\w-]+)/g, '<span class="hl-tag">$1</span>');
    highlighted = highlighted.replace(/(<\/?[\w-]+)/g, '<span class="hl-tag">$1</span>');
    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>');
    // Booleans/null
    highlighted = highlighted.replace(/\b(true|false|null|undefined|ref|state)\b/g, '<span class="hl-keyword">$1</span>');
    return (
      <div key={i} className="code-line">
        <span className="line-number">{i + 1}</span>
        <span dangerouslySetInnerHTML={{ __html: highlighted }} />
      </div>
    );
  });
}

// ─── Component ───

export default function App() {
  const [style, setStyle] = useState("microsoft-teams");
  const [size, setSize] = useState<SizeOption>(SIZES[4]); // xl
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(EMOJI_BATCH_SIZE);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = window.localStorage.getItem("emoji-styles-theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [activeTab, setActiveTab] = useState("react");
  const [copiedInstall, setCopiedInstall] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("emoji-styles-theme", theme);
  }, [theme]);

  const allEmojis = useMemo(() => getAvailableEmojis(), []);
  const activeStyle = STYLES.find((item) => item.key === style) ?? STYLES[0];

  const filteredEmojis = useMemo(() => {
    if (!search.trim()) return allEmojis;
    const q = search.toLowerCase();
    return allEmojis.filter((emoji) => {
      const data = getEmojiData(emoji);
      return (
        data?.alt.toLowerCase().includes(q) ||
        data?.name.toLowerCase().includes(q) ||
        emoji.includes(q)
      );
    });
  }, [allEmojis, search]);

  const visibleEmojis = useMemo(
    () => filteredEmojis.slice(0, visibleCount),
    [filteredEmojis, visibleCount],
  );

  useEffect(() => {
    setVisibleCount(EMOJI_BATCH_SIZE);
  }, [search]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const handleCopyInstall = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("npm install react-emoji-styles");
      setCopiedInstall(true);
      setTimeout(() => setCopiedInstall(false), 2000);
    } catch {
      setCopiedInstall(true);
      setTimeout(() => setCopiedInstall(false), 2000);
    }
  }, []);

  const activeExample = FRAMEWORK_EXAMPLES.find((f) => f.id === activeTab) ?? FRAMEWORK_EXAMPLES[0];

  return (
    <EmojiProvider provider={activeStyle.provider}>
      <div className="app">
        {/* Floating Navbar */}
        <nav className="navbar">
          <div className="nav-brand">
            <Emoji emoji="🎨" size={20} /> <span>Emoji Styles</span>
          </div>
          <div className="nav-actions">
            <a
              href="https://github.com/JarvisBotBlanco/emoji-styles"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              aria-label="View on GitHub"
            >
              <GitHubIcon />
            </a>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              aria-pressed={theme === "dark"}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="hero">
          <div className="hero-bg">
            {HERO_FLOATING_EMOJIS.map((item, i) => (
              <div
                key={i}
                className="floating-emoji"
                style={item.style as React.CSSProperties}
              >
                <Emoji emoji={item.emoji} provider={item.provider} size={48} />
              </div>
            ))}
          </div>
          <div className="hero-content">
            <div className="eyebrow">OpenAI Build Week 2026</div>
            <h1 className="hero-title">
              <span className="gradient-text">Emoji Styles</span>
            </h1>
            <p className="hero-subtitle">
              The multi-provider emoji library for modern web apps.
              One component, eight styles, zero dependencies.
            </p>
            <div className="hero-actions">
              <div className="install-inline">
                <code className="install-code">npm install react-emoji-styles</code>
                <CopyButton text="npm install react-emoji-styles" label="Copy" />
              </div>
              <a
                href="https://github.com/JarvisBotBlanco/emoji-styles"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-btn hero-btn-secondary"
              >
                <GitHubIcon />
                <span>GitHub</span>
              </a>
            </div>
            <div className="stats-row">
              <div className="stat-pill">
                <span className="stat-number">{allEmojis.length}</span>
                <span className="stat-label">Emojis</span>
              </div>
              <div className="stat-pill">
                <span className="stat-number">8</span>
                <span className="stat-label">Providers</span>
              </div>
              <div className="stat-pill">
                <span className="stat-number">0</span>
                <span className="stat-label">Dependencies</span>
              </div>
            </div>
          </div>
        </header>

        {/* How It Works */}
        <section className="section features-section">
          <div className="eyebrow">How it works</div>
          <h2 className="section-title">Built for developers</h2>
          <div className="features-grid">
            {FEATURES.map((feature, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Framework Examples */}
        <section className="section">
          <div className="eyebrow">Framework support</div>
          <h2 className="section-title">Works everywhere</h2>
          <div className="framework-tabs">
            {FRAMEWORK_EXAMPLES.map((fw) => (
              <button
                key={fw.id}
                className={`framework-tab ${activeTab === fw.id ? "active" : ""}`}
                onClick={() => setActiveTab(fw.id)}
              >
                {fw.label}
              </button>
            ))}
          </div>
          <div className="framework-content">
            <div className="vs-comparison">
              <div className="vs-box">
                <span className="vs-label">Native</span>
                <span className="vs-emoji" style={{fontSize: '48px', lineHeight: 1}}>🚀</span>
              </div>
              <div className="vs-badge">VS</div>
              <div className="vs-box">
                <span className="vs-label">emoji-styles</span>
                <span className="vs-emoji">
                  <Emoji emoji="🚀" size={48} />
                </span>
              </div>
            </div>
            <div className="code-block">
              <div className="code-header">
                <span className="code-lang">{activeTab === "react" ? "tsx" : activeTab}</span>
                <CopyButton text={activeExample.code} label="Copy code" />
              </div>
              <pre className="code-content">
                <code>{highlightCode(activeExample.code, activeTab)}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="controls-section">
          {/* Style Selector */}
          <div className="control-card">
            <div className="eyebrow">Style</div>
            <div className="pill-group">
              {STYLES.map((s) => (
                <button
                  key={s.key}
                  className={`pill ${style === s.key ? "active" : ""}`}
                  onClick={() => setStyle(s.key)}
                  aria-pressed={style === s.key}
                >
                  {s.emoji && <span className="pill-emoji">{s.emoji}</span>}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size + Search Row */}
          <div className="control-row">
            <div className="control-card compact">
              <div className="eyebrow">Size</div>
              <div className="pill-group compact">
                {SIZES.map((s) => (
                  <button
                    key={s.label}
                    className={`pill size-pill ${size.label === s.label ? "active" : ""}`}
                    onClick={() => setSize(s)}
                    aria-pressed={size.label === s.label}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="search-wrapper">
              <SearchIcon />
              <input
                type="text"
                className="search-input"
                placeholder="Search emojis…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* All Styles Comparison */}
        <section className="section">
          <div className="eyebrow">Compare</div>
          <h2 className="section-title">All providers — same emoji</h2>
          <div className="comparison-grid comparison-grid-wide">
            {STYLES.map((s) => (
              <div className="comparison-card" key={s.key}>
                <div className="emoji-preview">
                  <Emoji emoji="🚀" provider={s.provider} size={48} />
                </div>
                <div className="card-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Emoji Grid */}
        <section className="section">
          <div className="eyebrow">Collection</div>
          <h2 className="section-title">
            All {allEmojis.length} emojis — {activeStyle.label}
          </h2>
          {filteredEmojis.length > 0 ? (
            <div className="emoji-grid">
              {visibleEmojis.map((emoji) => (
                <LazyEmojiCell
                  key={emoji}
                  emoji={emoji}
                  size={size.px}
                  emojiProvider={activeStyle.provider}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state" role="status">
              <span className="empty-state-title">No matching emojis</span>
              <span className="empty-state-copy">
                Try a Unicode character or a broader English name.
              </span>
            </div>
          )}
          {visibleEmojis.length < filteredEmojis.length && (
            <div className="load-more-row">
              <button
                className="load-more-button"
                type="button"
                onClick={() => setVisibleCount((count) => count + EMOJI_BATCH_SIZE)}
              >
                Load {Math.min(EMOJI_BATCH_SIZE, filteredEmojis.length - visibleEmojis.length)} more
                <span>{visibleEmojis.length} of {filteredEmojis.length}</span>
              </button>
            </div>
          )}
        </section>

        {/* Install Section */}
        <section className="section install-section">
          <div className="install-card">
            <div className="install-card-content">
              <h2 className="section-title">Get started</h2>
              <p className="install-description">
                Install with your favorite package manager and start rendering
                beautiful emojis in under a minute.
              </p>
              <div className="install-command">
                <code>npm install react-emoji-styles</code>
                <CopyButton text="npm install react-emoji-styles" label="Copy" />
              </div>
              <div className="install-steps">
                <div className="install-step">
                  <span className="step-number">1</span>
                  <code className="step-code">import {'{'} Emoji, EmojiProvider {'}'} from 'react-emoji-styles'</code>
                </div>
                <div className="install-step">
                  <span className="step-number">2</span>
                  <code className="step-code">{'<EmojiProvider provider={providers.apple}>'}</code>
                </div>
                <div className="install-step">
                  <span className="step-number">3</span>
                  <code className="step-code">{'<Emoji emoji="🚀" size="xl" />'}</code>
                </div>
              </div>
            </div>
            <div className="install-preview">
              <div className="install-preview-emojis">
                <Emoji emoji="🚀" size={64} />
                <Emoji emoji="❤️" size={48} />
                <Emoji emoji="🔥" size={56} />
                <Emoji emoji="✨" size={44} />
                <Emoji emoji="🎉" size={52} />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-left">
              <Emoji emoji="🎨" size={20} />
              <span className="footer-brand">react-emoji-styles</span>
            </div>
            <div className="footer-links">
              <a
                href="https://www.npmjs.com/package/react-emoji-styles"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                <NpmIcon />
                npm
              </a>
              <a
                href="https://github.com/JarvisBotBlanco/emoji-styles"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                <GitHubIcon />
                GitHub
              </a>
              <span className="footer-link footer-license">MIT License</span>
            </div>
            <div className="footer-right">
              Built with Codex for OpenAI Build Week
            </div>
          </div>
        </footer>
      </div>
    </EmojiProvider>
  );
}
