# Skill Panel Agent Rules

These rules apply to every agent working on this repository.

## Required Language Rule

Avoid binary negation contrast phrasing in Chinese. Prefer direct positive wording and clear action statements.

## Workspace Separation

Use separate folders for separate agents.

- Codex works in `/Users/shovy/Documents/skill-panel-codex-v3.8`
- WorkBuddy works in `/Users/shovy/Documents/skill-panel-workbuddy-v3.9`
- `/Users/shovy/Documents/skill-panel` is a management directory

Do not have two agents edit the same folder.

## Current Stable Line

- Stable product line: v3.8.x
- Current stable version: v3.8.1
- Stable branch folder: `/Users/shovy/Documents/skill-panel-codex-v3.8`

Codex owns stable integration and release quality.

## Agent Responsibilities

Codex owns:

- Stable code integration
- Version bumps and release commits
- Tauri backend commands
- File system, Keychain, settings, scanner, logs, and version history
- Type contracts in `src/types/**`
- Tests, build, and regression fixes
- Final migration of mature WorkBuddy features into v3.8.x

WorkBuddy owns:

- UI exploration
- Interaction flows
- Motion proposals
- Feature prototypes
- Visual QA screenshots
- User-facing wording
- Experience review notes

Shared areas need Codex review before stable integration:

- `src/components/**`
- `src/hooks/**`
- `src/pages/**`
- `src/styles/**`

## Development Flow

1. Keep each task scoped to one feature or fix.
2. WorkBuddy prototypes in the v3.9 folder.
3. Codex ports mature pieces into the v3.8 folder.
4. Codex keeps the v3.8 architecture intact unless a planned migration is approved.
5. Each stable delivery gets a patch version, such as v3.8.2.
6. Each stable delivery needs tests and a commit.

## UI Standard

Follow `ui-style-guide.md` for all UI and interaction work.

Important defaults:

- Desktop productivity feel
- Compact controls
- Token-based colors
- Material Symbols for icons
- Stable dimensions
- No decorative backgrounds
- Diff confirmation for AI writeback
- Accessible labels for icon controls

## Code Rules

- Prefer existing project patterns over new abstractions.
- Keep edits scoped to the task.
- Use TypeScript types from `src/types/**`.
- Keep Tauri command names listed in `src/types/skill.ts`.
- Store API keys through backend Keychain commands.
- Do not keep raw API keys in frontend state stores.
- Preserve browser-preview fallbacks for Tauri APIs.
- Avoid broad refactors during feature ports.

## Testing Requirements

Run the relevant checks before claiming completion.

Frontend-only changes:

```bash
npm run typecheck
npm test
npm run build
```

Tauri, settings, file system, Keychain, scanner, logs, or version changes:

```bash
npm run cargo:test
```

Visible UI changes:

- Run the frontend checks.
- Capture Playwright screenshots for the affected route or workflow.
- Check 1024x768, 1280x800, and 1440x960 when layout changes are substantial.

## Git Rules

- Work on the correct folder before editing.
- Check `git status --short --branch` before changes.
- Do not discard user or agent work without explicit approval.
- Commit stable Codex deliveries after verification.
- Keep commit messages concrete, for example `feat: release v3.8.2 ai settings`.

## Release Rules

For v3.8.x releases, update:

- `package.json`
- `package-lock.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/tauri.conf.json`
- `src/packaging.config.test.ts`

Then run:

```bash
npm test
npm run typecheck
npm run build
npm run cargo:test
```

## Handoff Format

When handing work from WorkBuddy to Codex, include:

- Feature name
- User workflow
- Files changed
- Screenshots
- Known gaps
- Suggested stable version target

When Codex completes stable integration, include:

- Version
- Commit hash
- Summary of moved functionality
- Verification commands and results
- Screenshot paths for visible UI changes

