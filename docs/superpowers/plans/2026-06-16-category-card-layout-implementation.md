# Category Card Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement option A category-grouped card browsing, draggable category order, restore default order, resizable detail panel, and a regression fix for detail content overlap.

**Architecture:** Keep the current single React app structure and add small pure helpers for category grouping, ordering, and setting normalization. Persist UI preferences through the existing settings runtime and Tauri settings model.

**Tech Stack:** React 19, Vitest, Testing Library, Tauri Rust settings store, CSS Grid/Flexbox.

---

### Task 1: Regression Tests

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.editor.test.tsx`
- Modify: `src/types/skill.test.ts`

- [ ] Add tests proving card view renders category sections sorted by visible label.
- [ ] Add tests proving category sections have a two-row internal scroll class.
- [ ] Add tests proving drag/drop reorders cards inside one category and persists `categorySkillOrder`.
- [ ] Add tests proving "Restore default" clears one category order.
- [ ] Add tests proving the detail resize handle changes width and persists `detailPanelWidth`.
- [ ] Add a detail overlap regression test proving markdown, insight/lint sections, and action buttons remain in normal document flow.
- [ ] Run targeted frontend tests and confirm these tests fail for missing implementation.

### Task 2: Settings Shape

**Files:**
- Modify: `src/types/skill.ts`
- Modify: `src/i18n/runtime.tsx`
- Modify: `src-tauri/src/models.rs`
- Modify: `src-tauri/src/settings_store.rs`

- [ ] Add optional frontend settings fields `categorySkillOrder?: Record<string, string[]>` and `detailPanelWidth?: number`.
- [ ] Normalize invalid setting values to `{}` and `undefined`.
- [ ] Add Rust settings fields with serde defaults.
- [ ] Extend roundtrip tests for the new settings fields.

### Task 3: Category Card View

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] Build `categorySections` from currently filtered skills, sorted by visible category label.
- [ ] Render card view as vertical `.category-card-section` groups.
- [ ] Keep list view table and pagination behavior.
- [ ] Apply saved order per category, ignoring stale paths.
- [ ] Limit section body to two rows through stable card dimensions and internal scrolling.

### Task 4: Drag Sorting and Restore

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] Add draggable cards scoped to each category section.
- [ ] Persist reordered skill paths through existing settings save flow.
- [ ] Add a compact "Restore default" button in each category header.
- [ ] Clear only the target category order when restoring.

### Task 5: Detail Layout and Resize

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] Keep detail panel content as one scrollable normal-flow column.
- [ ] Remove fixed markdown min-height that forces section collision on shorter windows.
- [ ] Add a resize handle between skill list and detail panel for desktop layouts.
- [ ] Clamp detail width and persist it through settings.
- [ ] Hide the handle on compact layouts.

### Task 6: Verification and Desktop Update

**Files:**
- Update generated assets only if visual QA intentionally refreshes screenshots.

- [ ] Run targeted tests for edited test files.
- [ ] Run full `npm.cmd test`.
- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `npm.cmd run visual:qa`.
- [ ] Run `cargo test` in `src-tauri`.
- [ ] Run a browser screenshot check for desktop and compact widths.
- [ ] Build Tauri Windows release and replace the installed desktop executable.
