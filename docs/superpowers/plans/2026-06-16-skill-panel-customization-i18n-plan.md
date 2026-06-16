# Skill Panel Customization And I18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the seven approved Skill Panel fixes and customization features.

**Architecture:** Keep the existing single-component structure, adding small helpers for effective categories, category icons, skill card styles, translated insight text, and Markdown rendering. Persist customization through `AppSettings` on both frontend and Tauri settings models.

**Tech Stack:** React, TypeScript, React Testing Library, Vitest, ReactMarkdown, Tauri Rust settings model, Playwright visual QA.

---

### Task 1: Regression Tests

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.editor.test.tsx`
- Modify: `src/types/skill.test.ts`

- [ ] Add tests for card drag using a `div[role="button"]`, fixed card width/height CSS, category override persistence, custom tag add/delete, card color persistence, category icon persistence, and outside-click menu behavior.
- [ ] Add editor tests for Markdown edit preview and Chinese localization of insight/lint/create dialog chrome.
- [ ] Run `npm.cmd test -- src/App.test.tsx src/App.editor.test.tsx src/types/skill.test.ts --reporter=dot` and confirm the new tests fail for missing behavior.

### Task 2: Settings Model

**Files:**
- Modify: `src/types/skill.ts`
- Modify: `src/i18n/runtime.tsx`
- Modify: `src-tauri/src/models.rs`
- Modify: `src-tauri/src/settings_store.rs`

- [ ] Add optional `categoryIcons`, `skillCategoryOverrides`, and `skillCardColors`.
- [ ] Normalize and omit empty maps before persisting.
- [ ] Update Rust serde defaults and settings roundtrip tests.

### Task 3: Card View And Skill Menu

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] Render cards as `div role="button"` with keyboard activation, stable drag/drop, and fixed width/height.
- [ ] Compute effective categories from `skillCategoryOverrides`.
- [ ] Replace skill right-click menu with category selector, tag add/remove controls, and card color controls.
- [ ] Persist category overrides, custom tags, and card colors through `persistUiPreferences`.

### Task 4: Category Icon Customization

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] Add recommended category icon choices.
- [ ] Render custom icons in the sidebar and category headings.
- [ ] Extend category context menu with icon selection and persistence.

### Task 5: Markdown Editing Preview

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] Extract a reusable Markdown preview renderer inside `App.tsx`.
- [ ] In edit mode, show the rendered preview above the textarea on narrow detail panels and side-by-side when there is enough width.
- [ ] Reuse standard Markdown heading, list, code, table, and blockquote styling.

### Task 6: I18n Completion

**Files:**
- Modify: `src/i18n/resources.ts`
- Modify: `src/App.tsx`
- Modify: `scripts/visual-qa.mjs`

- [ ] Add keys for governance labels, view titles, restore default, details insight, lint, prompt tester, risk labels, create templates, context menus, colors, icons, and customization labels.
- [ ] Replace hardcoded UI chrome strings with `t(...)`.
- [ ] Add visual QA assertion that Chinese mode has no known English chrome strings.

### Task 7: Verification And Desktop Update

**Files:**
- Modify: `scripts/visual-qa.mjs`
- Update generated files under `output/playwright/`

- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `cargo test` in `src-tauri`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd run visual:qa`.
- [ ] Run `npm.cmd audit --omit=dev`.
- [ ] Run `npm.cmd run tauri:build:windows`.
- [ ] Copy the release exe to `%LOCALAPPDATA%\Programs\SkillPanelUX\skill-panel.exe`, back up the previous exe, and restart Skill Panel.
