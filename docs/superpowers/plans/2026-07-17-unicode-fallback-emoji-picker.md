# Unicode Fallback Emoji Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accessible, searchable emoji popover to the free-style Unicode fallback field so users can build prompts without leaving the landing page.

**Architecture:** A focused `EmojiPicker` component owns disclosure, search, keyboard navigation, outside-click dismissal, and focus restoration. `App` keeps the selected Unicode value and prompt generation, connecting the picker through a single `onSelect` callback. The picker reuses the bundled Emoji Styles dataset and introduces no runtime picker dependency.

**Tech Stack:** React 18, TypeScript, Emoji Styles data APIs, Vitest 2, jsdom, Testing Library, Vite, CSS.

## Global Constraints

- Show exactly 24 curated emojis before search.
- Search the full bundled dataset by CLDR label, Unicode character, or codepoint.
- Limit search rendering to 60 results.
- Keep manual Unicode input available.
- Support arrow keys, Enter, Escape, outside click, accessible labels, and focus restoration.
- Add no third-party emoji picker runtime dependency.
- Preserve the untracked root `package-lock.json` unchanged.

---

### Task 1: Test harness and isolated picker

**Files:**
- Create: `demo/vitest.config.ts`
- Create: `demo/src/tests/setup.ts`
- Create: `demo/src/EmojiPicker.test.tsx`
- Create: `demo/src/EmojiPicker.tsx`
- Modify: `demo/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: `getAvailableEmojis(): string[]` and `getEmojiData(emoji)` from `react-emoji-styles`.
- Produces: `EmojiPicker({ value, onSelect }: { value: string; onSelect(emoji: string): void }): JSX.Element`.

- [ ] **Step 1: Add the demo test harness and failing disclosure test**

Add `test: "vitest run"`, Testing Library, jsdom, and Vitest dev dependencies matching `packages/react`. Configure jsdom and cleanup. Write a test that renders `<EmojiPicker value="🍌" onSelect={onSelect} />`, clicks the `Choose Unicode emoji` trigger, and expects a dialog named `Choose a Unicode fallback` with 24 emoji option buttons.

- [ ] **Step 2: Run the test and verify RED**

Run: `demo/node_modules/.bin/vitest.CMD run src/EmojiPicker.test.tsx`

Expected: FAIL because `./EmojiPicker` does not exist.

- [ ] **Step 3: Implement compact disclosure and full-dataset search**

Create a component with:

```tsx
export interface EmojiPickerProps {
  value: string;
  onSelect(emoji: string): void;
}

export function EmojiPicker({ value, onSelect }: EmojiPickerProps) {
  // Own open state, query, active result, refs, and filtered results.
}
```

Use a fixed 24-item `COMPACT_EMOJIS` list when the normalized query is empty. Otherwise filter `getAvailableEmojis()` by `data.alt`, `data.name`, `data.codepoint`, or the character itself, then call `.slice(0, 60)`. The trigger must expose `aria-expanded`, `aria-haspopup="dialog"`, and `aria-controls`. Each result button uses the CLDR `alt` text as its accessible name.

- [ ] **Step 4: Add failing interaction tests**

Cover search for `rocket`, searching by an emoji character, selection callback, Escape dismissal, outside-click dismissal, and focus restoration. Add a keyboard test that moves the active option with ArrowRight/ArrowDown and selects it with Enter.

- [ ] **Step 5: Run the expanded tests and verify RED**

Run: `demo/node_modules/.bin/vitest.CMD run src/EmojiPicker.test.tsx`

Expected: FAIL on keyboard and dismissal behavior not implemented yet.

- [ ] **Step 6: Implement keyboard and dismissal behavior**

Use document-level `pointerdown` only while open, close when the target is outside the picker root, handle Escape from the popover, and restore trigger focus. Track an active result index and use a six-column movement model for ArrowLeft, ArrowRight, ArrowUp, and ArrowDown; Enter calls the same selection path as clicking.

- [ ] **Step 7: Verify GREEN**

Run: `demo/node_modules/.bin/vitest.CMD run src/EmojiPicker.test.tsx`

Expected: all picker tests PASS.

### Task 2: Connect the picker to the free-style prompt

**Files:**
- Create: `demo/src/App.test.tsx`
- Modify: `demo/src/App.tsx`

**Interfaces:**
- Consumes: `EmojiPicker` from Task 1.
- Produces: selection updates `freeStyleEmoji`, the editable input, and `freeStylePrompt`.

- [ ] **Step 1: Write the failing integration test**

Render `<App />`, activate `Create your own`, open `Choose Unicode emoji`, search for `banana`, select the option named `Banana`, and assert both the Unicode input and generated prompt contain `🍌`.

- [ ] **Step 2: Run the integration test and verify RED**

Run: `demo/node_modules/.bin/vitest.CMD run src/App.test.tsx`

Expected: FAIL because the free-style field does not render `EmojiPicker`.

- [ ] **Step 3: Implement the App connection**

Import `EmojiPicker`, wrap the current text input and trigger in a positioned control container, and render:

```tsx
<EmojiPicker value={freeStyleEmoji} onSelect={setFreeStyleEmoji} />
```

Keep the existing controlled text input and `maxLength` behavior unchanged.

- [ ] **Step 4: Verify GREEN**

Run: `demo/node_modules/.bin/vitest.CMD run src/App.test.tsx src/EmojiPicker.test.tsx`

Expected: all integration and picker tests PASS.

### Task 3: Styling, responsive behavior, and final verification

**Files:**
- Modify: `demo/src/App.css`

**Interfaces:**
- Consumes: picker class names from Task 1 and the field wrapper from Task 2.
- Produces: anchored desktop popover and width-constrained mobile layout.

- [ ] **Step 1: Add picker styles**

Style the field wrapper, inset trigger, anchored popover, search input, six-column compact grid, active/selected option states, empty results, and internal scrolling. Keep the visual language aligned with the existing acid accent, mono labels, border tokens, and surface colors.

- [ ] **Step 2: Add mobile constraints**

In the existing narrow-screen media query, keep the popover within its field width, use `max-width: calc(100vw - 52px)`, reduce the grid to six flexible columns, and cap the scroll region height without causing page overflow.

- [ ] **Step 3: Run automated verification**

Run:

```powershell
npm --prefix demo test
npm --prefix demo exec tsc -- --noEmit
npm --prefix demo run build
```

Expected: tests, typecheck, and Vite production build PASS.

- [ ] **Step 4: Validate in browser**

Start `npm --prefix demo run dev`, test mouse and keyboard selection, confirm prompt synchronization, and inspect desktop plus a 390×844 viewport. Verify the page has no horizontal overflow and the picker remains visible, scrollable, and dismissible.

- [ ] **Step 5: Review the final diff**

Run `git diff --check` and confirm that `package-lock.json` remains untouched and untracked.
