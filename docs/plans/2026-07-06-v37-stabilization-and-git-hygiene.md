# Skill Panel v3.7 Stabilization and Git Hygiene Implementation Plan

> **For Codex:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Fix the v3.7 runtime, data integration, QA, and Git hygiene issues found in the July 6 test pass.

**Architecture:** Keep the v3.7 `AppShell` + page/store layout. Move page data flows through the existing stores and Tauri command wrappers, add browser-safe event wrappers, and make each user-facing workflow call the real backend command with a mock-only fallback for development preview.

**Tech Stack:** React 19, TypeScript, Vite 8, Zustand, Tauri 2, Rust, Vitest, Playwright visual QA.

---

### Task 1: Create Clean v3.7 Branch Baseline

**Files:**
- Inspect only: repository root

**Steps:**
1. Run `git status --short --branch` and confirm the current dirty v3.7 worktree.
2. Create a delivery branch from the current worktree state: `git switch -c codex/v3.7-stabilization`.
3. Stage only source/config/docs changes, excluding generated QA screenshots unless intentionally needed.
4. Commit the current v3.7 baseline as `chore: checkpoint v3.7 workspace baseline`.
5. Run `git log --oneline -3` and record the new branch and checkpoint commit in the final report.

**Expected:** Future fixes land on `codex/v3.7-stabilization`; review can diff against the baseline commit.

### Task 2: Make Tauri Event Usage Browser-Safe

**Files:**
- Modify: `src/AppShell.tsx`
- Modify: `src/pages/Editor/index.tsx`
- Create: `src/lib/tauriEvents.ts`
- Test: `src/AppShell.test.tsx` or add cases to `src/App.test.tsx`

**Steps:**
1. Add a failing test that renders `AppShell` without `window.__TAURI_INTERNALS__` and asserts no page error/unhandled rejection is thrown.
2. Create `safeListen(event, handler)` in `src/lib/tauriEvents.ts` that wraps `@tauri-apps/api/event.listen` in `try/catch` and returns a no-op unlisten on failure.
3. Replace direct `listen('scan-changed', ...)` in `AppShell`.
4. Replace dynamic direct `listen('ai-chunk', ...)` in `EditorPage`.
5. Run `npm test` and a Playwright browser smoke test against `npm run dev`.

**Expected:** Browser preview still shows mock data and no `transformCallback` or `unregisterListener` page errors.

### Task 3: Update Visual QA for v3.7 UI

**Files:**
- Modify: `scripts/visual-qa.mjs`
- Update generated report only after a successful run: `output/playwright/visual-qa-report.json`

**Steps:**
1. Update selectors from old `Skill Library`, list/table tabs, and `.skill-table-wrap` to v3.7 `Library`, `.lib-card`, `.lib-grid`, `.lib-drawer`.
2. Add handling for `plugin:event|listen` in the visual QA Tauri mock.
3. Run `npm run visual:qa` and confirm all scenarios pass.
4. Review screenshots for Library, Drawer, Dashboard, Editor, Settings, and failure/mock states.

**Expected:** `npm run visual:qa` exits 0 and reports no page errors.

### Task 4: Connect Library Categories to Real Scan Data

**Files:**
- Modify: `src/lib/invoke.ts`
- Modify: `src/types/skill.ts`
- Test: `src/types/skill.test.ts` or `src/App.test.tsx`

**Steps:**
1. Add a test for `mapSummary()` that maps frontmatter/category/tag data from `SkillSummary` when present.
2. Extend `SkillSummary` typing if the Rust model already exposes category-like fields; otherwise derive categories from path/name only as a fallback.
3. Remove the unconditional `category: '未分类'`.
4. Ensure source mapping still marks plugin/system skills as protected.
5. Run `npm test`.

**Expected:** Real scanned skills can appear under meaningful filters, with `未分类` only used when no category signal exists.

### Task 5: Make Dashboard Use Live Store Data

**Files:**
- Modify: `src/pages/Dashboard/index.tsx`
- Test: `src/App.test.tsx`

**Steps:**
1. Add a test that seeds `useSkillStore` with 9 skills and expects Dashboard to show 9.
2. Read `skills` from `useSkillStore`.
3. Compute total, editable, favorites, attention count, and recent modified items from store data.
4. Wire metric clicks to set Library filters through `useSkillStore` or `useUIStore`.
5. Run `npm test`.

**Expected:** Dashboard reflects current scan results instead of fixed `10 个 Skill`.

### Task 6: Connect Logs Page to `get_call_logs`

**Files:**
- Modify: `src/pages/Logs/index.tsx`
- Modify or create: `src/lib/logs.ts`
- Test: `src/App.test.tsx`

**Steps:**
1. Add a test that mocks `invoke('get_call_logs')` and expects rows from the mock response.
2. Replace the static `LOGS` array with a load effect calling `get_call_logs`.
3. Add loading, empty, and error states.
4. Keep a browser mock fallback only when Tauri is unavailable.
5. Run `npm test`.

**Expected:** Logs page shows real backend logs in desktop mode.

### Task 7: Make Create Page Persist via `create_skill`

**Files:**
- Modify: `src/pages/Create/index.tsx`
- Modify or create: `src/lib/skills.ts`
- Test: `src/App.test.tsx`

**Steps:**
1. Add a failing test that clicks “创建 Skill” and asserts `invoke('create_skill')` receives name, description, source, target directory, and markdown.
2. Add required field validation for name and target directory.
3. Call `create_skill`, update `useSkillStore`, show success/error toast, and return to Library only after success.
4. Run `npm test`.

**Expected:** Creating a skill writes through Tauri in desktop mode and surfaces backend errors.

### Task 8: Implement AI Key Settings Flow

**Files:**
- Modify: `src/pages/Settings/index.tsx`
- Modify: `src/store/settingsStore.ts`
- Modify or create: `src/lib/ai.ts`
- Test: `src/App.test.tsx`

**Steps:**
1. Add a test for entering a key and calling `invoke('set_ai_key')`.
2. Replace the static “已存储·更换” button with masked input, save button, and status text.
3. Store only vendor and key-present state in Zustand; never store the raw key after save.
4. Surface keyring save errors.
5. Run `npm test`.

**Expected:** Users can actually save or replace AI API keys.

### Task 9: Attach Version Snapshots to Writes

**Files:**
- Modify: `src-tauri/src/skill_store.rs`
- Modify: `src-tauri/src/commands.rs`
- Test: Rust tests in `src-tauri/src/skill_store.rs` or `src-tauri/src/commands.rs`

**Steps:**
1. Add a Rust test that updates a skill and then `get_version_history` returns at least one snapshot.
2. Before `update_skill` writes new content, call `version_store::create_snapshot(path, "Before save", "manual")`.
3. Consider snapshot on delete before backup if useful for recovery.
4. Run `npm run cargo:test` in an environment with Rust installed.

**Expected:** Version history exists after real save operations.

### Task 10: Align Backend Command Contracts and Rust Verification

**Files:**
- Modify: `src/types/commands.ts`
- Modify: `src/types/skill.ts`
- Modify: `src-tauri/src/commands.rs`
- Modify: `src-tauri/Cargo.toml` if missing crates are found

**Steps:**
1. Install or expose Rust toolchain in PATH.
2. Run `npm run cargo:test`.
3. Fix compile/test failures one by one.
4. Add tests for `validate_skill`, `read_skill_files`, `write_skill_file`, `get_call_logs`, and `watch_scan_dirs` where practical.
5. Run `npm run build`.

**Expected:** Frontend and backend command contracts compile and test together.

### Task 11: Final Verification and Commit Series

**Files:**
- All modified source/config/test/docs files

**Steps:**
1. Run `npm test`.
2. Run `npm run build`.
3. Run `npm run packaging:check`.
4. Run `npm run visual:qa`.
5. Run `npm run cargo:test` when Rust is available.
6. Commit each completed repair area with focused messages:
   - `fix: guard tauri event listeners in browser preview`
   - `test: update visual qa for v3.7 shell`
   - `fix: connect v3.7 pages to live data`
   - `feat: persist ai keys and created skills`
   - `feat: snapshot skill versions on save`
7. End with `git status --short --branch` and `git log --oneline -8`.

**Expected:** Branch history is reviewable, every commit has a clear rollback boundary, and verification status is explicit.

