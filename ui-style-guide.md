# Skill Panel v3.8.1 UI Style Guide

This guide is the execution standard for Skill Panel UI work. It captures the v3.8.1 visual language after the AI Rail integration.

## Product Feel

Skill Panel is a desktop productivity tool for managing local skills. The UI should feel quiet, dense, and operational. Prefer clear workspace surfaces, compact controls, visible status, and fast scanning over decorative presentation.

## Layout

- Use the existing shell pattern: global top bar, page workspace, contextual drawers or rails.
- Keep primary work areas full height and avoid nested page cards.
- Use cards only for repeated items, modals, drawers, and framed tools.
- Preserve stable dimensions for grids, rails, cards, buttons, counters, and editor panes.
- The v3.8.1 editor layout remains three columns: file rail, editor body, preview or AI rail.
- AI tools live in the right rail and use a modal only for diff confirmation.

## Color Tokens

Use tokens from `src/styles/tokens.css` and `src/styles.css`.

Core surfaces:

- App background: `--bg` or `--background`
- Main panel: `--surface`
- Secondary panel: `--surface-2`
- Subtle fill: `--surface-3`
- Borders: `--border`, `--border-2`, `--outline-variant`

Text:

- Primary: `--text` or `--on-surface`
- Secondary: `--text-2` or `--on-surface-variant`
- Muted: `--text-muted`
- Faint metadata: `--text-faint`

Status:

- Primary action: `--accent`
- Success: `--success`
- Warning: `--warning`
- Danger: `--danger`
- AI neutral surface: `--ai-soft`
- AI text: `--ai-text`

Avoid adding new hex values when an existing token fits. Add a token only when a repeated semantic role has no existing match.

## Typography

- Use system UI typography already defined in the app.
- Keep compact workspace headings around 12-16px.
- Use 10-12px for metadata, labels, table-like rows, and rail text.
- Use monospace only for code, Markdown, diff lines, paths, and logs.
- Letter spacing stays `0`.
- Do not scale font sizes with viewport width.

## Spacing

- Compact controls: 4-8px internal gaps.
- Standard panel padding: 10-16px.
- Dense rows: 24-36px height.
- Cards and list rows should use predictable spacing and avoid layout jumps.
- Prefer tokenized radii: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`.
- For new repeated UI, use 8px radius unless a matching local pattern already uses another token.

## Buttons And Controls

- Use icon buttons for compact tools when a clear Material Symbol exists.
- Use text buttons for commands that need explicit wording.
- Keep destructive commands visually distinct with danger tokens.
- Disabled states use opacity and retain layout size.
- Every icon-only control needs an accessible label or title.
- Toggle binary settings with `Toggle`.
- Use segmented controls for small mode sets.
- Use menus, drawers, or modals for multi-step choices.

## Icons

- Use Material Symbols, matching existing v3.8.1 pages.
- Current AI icons:
  - `auto_awesome` for AI entry
  - `account_tree` for structure
  - `notes` for description
  - `auto_fix_high` for polish
  - `sell` for frontmatter
  - `policy` for safety review
  - `stop_circle` for cancel
  - `shield` for privacy notice
- Keep icon sizes between 14-20px in dense UI.

## AI Rail

The AI Rail is the reference pattern for assistant-powered workflows.

Required states:

- Idle with action list
- Generating with streaming text
- Cancel available during generation
- Error or missing key message
- Diff confirmation before writeback
- Cost and token summary

Behavior rules:

- Check stored API key before starting generation.
- Do not write AI output directly into the editor for writeback actions.
- Show diff confirmation for writeback actions.
- Safety review is read-only.
- Keep generated text selectable and scrollable.
- Preserve the editor draft until the user accepts changes.

## Diff Modal

- Use a modal overlay for AI diff review.
- Show changed hunk count, added lines, removed lines, token count, and cost.
- Default to all hunks selected.
- Support select all, clear selection, reject, apply selected, and accept all.
- Apply hunks from bottom to top in code to avoid offset drift.
- Keep diff lines monospace and wrapped.

## Forms

- Labels should be short and directly tied to the field.
- Help text belongs under the label in muted text.
- Inputs keep consistent height and border treatment.
- Password fields must never echo secrets into settings state.
- Store API keys in Keychain through backend commands.

## Drawers, Rails, And Modals

- Drawers show details and secondary workflows.
- Rails show persistent tools tied to the current workspace.
- Modals are reserved for confirmation, review, and blocking decisions.
- Avoid putting page sections inside card-like wrappers.

## Motion

- Motion should explain state changes and stay subtle.
- Use existing transition timing around 0.15-0.2s.
- Keep hover, active, and modal fade effects restrained.
- Avoid decorative moving backgrounds.
- Do not animate layout in ways that shift editor text, card grids, or controls.

## Accessibility

- Use semantic buttons for actions.
- Every icon-only button needs `aria-label` or `title`.
- Preserve keyboard focus visibility.
- Keep text contrast aligned with current tokens.
- Do not rely on color alone for critical status.
- Toast messages should be short and actionable.

## Responsive Rules

- The app is desktop-first with a minimum width near 900px.
- No content should overlap at 1024x768, 1280x800, and 1440x960.
- Text in buttons and cards must fit or wrap cleanly.
- Rails and sidebars should remain fixed width unless a page already defines a responsive pattern.

## File Ownership

- Global tokens: `src/styles/tokens.css`
- Global base styles: `src/styles.css`
- Shared UI components: `src/components/ui.tsx`, `src/components/ui.css`
- AI UI: `src/components/ai/**`
- Page-local styles: `src/pages/**/**.css`

New UI should use local page CSS only when the style is page-specific. Shared patterns should move into shared components after reuse appears in at least two places.

## Verification

Before UI work is accepted, run:

```bash
npm run typecheck
npm test
npm run build
```

For UI changes with visible layout impact, also capture Playwright screenshots at:

- 1024x768
- 1280x800
- 1440x960

For Tauri or backend-linked UI, also run:

```bash
npm run cargo:test
```

