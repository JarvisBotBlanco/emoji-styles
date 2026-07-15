import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  publicDir: path.resolve(__dirname, "../packages/assets-twemoji/public"),
  build: {
    // Theme validation deliberately rejects data: URLs, so keep imported brand
    // artwork as emitted files instead of inlining small assets in production.
    assetsInlineLimit: 0,
  },
  resolve: {
    alias: {
      "emoji-styles": path.resolve(__dirname, "../packages/core/src/index.ts"),
      "react-emoji-styles": path.resolve(__dirname, "../packages/react/src/index.ts"),
      "emoji-styles-assets-twemoji": path.resolve(__dirname, "../packages/assets-twemoji/src/index.ts"),
    },
  },
});
