"use client";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { getEmojiUrl, getFallbackChain, SIZE_MAP, type EmojiProviderRef, type EmojiStyle, type EmojiSize } from "emoji-styles";
import { useEmojiContext } from "./EmojiProvider";

export interface EmojiComponentProps {
  emoji: string;
  style?: EmojiStyle;
  provider?: EmojiProviderRef;
  size?: EmojiSize;
  className?: string;
  alt?: string;
  lazy?: boolean;
  fallback?: boolean;
  /** Add lightweight, reduced-motion-aware movement without changing providers. */
  motion?: EmojiMotion | false;
}

export type EmojiMotion = "float" | "bounce" | "pulse" | "wiggle";

const SKELETON_KEYFRAMES = `
@keyframes emoji-skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
@keyframes emoji-styles-float {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-12%) rotate(2deg); }
}
@keyframes emoji-styles-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  38% { transform: translateY(-18%) scale(1.04, 0.96); }
  55% { transform: translateY(0) scale(0.96, 1.04); }
  72% { transform: translateY(-7%) scale(1.02, 0.98); }
}
@keyframes emoji-styles-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}
@keyframes emoji-styles-wiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
}
.emoji-styles-motion { transform-origin: 50% 70%; will-change: transform; }
.emoji-styles-motion-float { animation: emoji-styles-float 2.8s ease-in-out infinite; }
.emoji-styles-motion-bounce { animation: emoji-styles-bounce 1.8s cubic-bezier(.45, 0, .25, 1) infinite; }
.emoji-styles-motion-pulse { animation: emoji-styles-pulse 1.6s ease-in-out infinite; }
.emoji-styles-motion-wiggle { animation: emoji-styles-wiggle 1.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .emoji-styles-motion { animation: none !important; }
}
`;

let injectedStyles = false;
function ensureStyles() {
  if (!injectedStyles) {
    const style = document.createElement("style");
    style.textContent = SKELETON_KEYFRAMES;
    document.head.appendChild(style);
    injectedStyles = true;
  }
}

export function Emoji({ emoji, style: styleProp, provider: providerProp, size = "md", className = "", alt, lazy = true, fallback = true, motion = false }: EmojiComponentProps) {
  const ctx = useEmojiContext();
  const provider = providerProp ?? styleProp ?? ctx.defaultProvider;
  const [failed, setFailed] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fallbackIndex = useRef(0);

  const url = useMemo(() => getEmojiUrl(emoji, provider), [emoji, provider]);
  const fallbackChain = useMemo(() => getFallbackChain(emoji, provider), [emoji, provider]);
  const initialUrl = fallbackChain[0] ?? url;
  const motionClassName = motion ? `emoji-styles-motion emoji-styles-motion-${motion}` : "";

  useEffect(() => {
    if (motion) ensureStyles();
  }, [motion]);

  // Reset loaded state when url changes (style switch)
  useEffect(() => {
    setIsLoaded(false);
    setFailed(false);
    fallbackIndex.current = 0;
  }, [initialUrl]);

  // Set up IntersectionObserver for lazy loading
  useEffect(() => {
    if (!lazy || isVisible) return;

    ensureStyles();

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [lazy, isVisible]);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      fallbackIndex.current++;
      if (fallbackIndex.current < fallbackChain.length) {
        e.currentTarget.src = fallbackChain[fallbackIndex.current];
      } else if (fallback) {
        setFailed(true);
      } else {
        e.currentTarget.style.display = "none";
      }
    },
    [fallbackChain, fallback]
  );

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const dimension = typeof size === "number" ? size : SIZE_MAP[size] ?? SIZE_MAP.md;
  const isNative = provider === "native" || (typeof provider !== "string" && provider.id === "native");

  if (isNative) {
    return (
      <span
        className={`${className} ${motionClassName}`.trim()}
        aria-label={alt}
        style={{
          width: dimension,
          height: dimension,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: dimension,
          lineHeight: 1,
          fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        }}
      >
        {emoji}
      </span>
    );
  }

  if (!initialUrl) return <span className={className}>{emoji}</span>;
  if (failed) return <span className={className}>{emoji}</span>;

  const sizeStyle = { width: dimension, height: dimension };

  return (
    <span
      ref={containerRef}
      className={`inline-block align-middle ${className} ${motionClassName}`.trim()}
      style={{
        width: dimension,
        height: dimension,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "4px",
            backgroundColor: "#e5e7eb",
            animation: "emoji-skeleton-pulse 1.5s ease-in-out infinite",
            ...sizeStyle,
          }}
        />
      )}

      {/* Actual emoji image */}
      {isVisible && (
        <img
          ref={imgRef}
          src={initialUrl}
          alt={alt ?? `Emoji: ${emoji}`}
          width={dimension}
          height={dimension}
          className="inline-block object-contain"
          style={{
            ...sizeStyle,
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "scale(1)" : "scale(0.9)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            position: "relative",
          }}
          draggable={false}
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
    </span>
  );
}
