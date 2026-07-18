# Skill Panel Customization And I18n Design

## Goal

Complete the next Skill Panel iteration across seven user-visible requirements: reliable card drag sorting, consistent card sizing, richer tag/category editing, Markdown preview while editing, complete Chinese/English UI switching, category color/icon customization, and per-skill card color customization.

## Product Behavior

Card view uses fixed-size skill cards across every category. Drag sorting works by dragging the full card surface, with keyboard selection behavior preserved. Saved category ordering remains scoped to each category.

Skill right-click opens a management menu with four actions: change the built-in category, add a custom tag, remove custom tags, and set the card color. Changing the built-in category stores a per-skill category override. Custom tags stay additive and removable.

Category right-click keeps rename/color controls and adds icon selection from a recommended Material Symbols list. The left navigation and category headings use the customized icon and color.

Edit mode for Markdown shows a standard Markdown preview and the editable textarea together. The preview uses the same rendered Markdown component and styling as preview mode.

Language switching localizes all application chrome, navigation, dialogs, menu labels, insight cards, lint messages, risk labels, and helper text. Skill names, descriptions, and Markdown bodies stay as user-authored content.

## Data Model

Extend `AppSettings` with:

- `categoryIcons?: Record<string, string>`
- `skillCategoryOverrides?: Record<string, CategoryId>`
- `skillCardColors?: Record<string, string>`

These settings are normalized in the frontend runtime and mirrored in the Tauri settings model. Empty maps are omitted from persisted JSON.

## Verification

Add focused unit tests for the seven requirements. Extend visual QA with card customization and Chinese UI checks. Finish with full frontend tests, typecheck, Rust tests, production build, visual QA, Tauri build, and desktop exe replacement.
