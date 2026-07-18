# Category Card Layout Design

## Goal

Update Skill Panel's card view so users can browse skills by category, adjust category-level ordering, and resize the detail panel without leaving the current workspace.

## Selected Approach

Use the vertical category grouping layout from visual option A.

The card view will show category sections in A-to-Z display-name order. Each category section contains all matching skills as cards. A section is visually capped at two rows; if it contains more cards than fit in two rows, only that section scrolls vertically. The overall skill panel keeps its current page structure, search, sidebar filters, and list view.

## Category Grouping

Categories use the existing `getSkillCategories` classification and existing custom category labels. Sorting uses the visible category label with the current locale, so renamed categories sort by their renamed label. Skills that match multiple categories appear in each matching category, consistent with the current multi-category chip behavior.

When a sidebar category filter is active, the card view still uses the grouped layout, but only matching categories and skills are shown. The list view keeps its current table and pagination behavior.

## Drag Sorting

Each skill card in card view becomes draggable. Dragging a card within a category reorders that category's skill list. The ordering is stored as a UI preference keyed by category id and skill path, so it survives app restarts. The default order remains the existing sorted skill order. Each category header includes a compact "Restore default" action that clears the custom order for that category.

Dragging is scoped to a category section. Cross-category dragging is ignored because category membership is derived from skill content, not manual placement.

## Detail Panel Resize

Add a vertical drag handle between the skill panel and detail panel on desktop layouts. Dragging adjusts the detail panel width within a bounded range, with a sensible default matching the current layout. The width is stored as a UI preference. On compact layouts where the detail panel moves below the list, the resize handle is hidden and the layout keeps the current responsive behavior.

## Data and Persistence

Extend app settings with:

- `categorySkillOrder`: category id to ordered skill path list.
- `detailPanelWidth`: number in pixels.

Settings normalization will tolerate missing values and invalid paths. Invalid or stale skill paths are ignored at render time.

## Interaction States

Card sections show:

- Category title, count, and "Restore default" action.
- Two-row card area with internal scroll when needed.
- Dragging affordance through cursor and active card styling.

Detail resizing shows:

- A visible vertical handle.
- Cursor feedback during hover and drag.
- Width clamping to prevent the detail panel from covering the skill list.

## Testing

Add frontend tests for:

- Card view renders category sections in A-to-Z label order.
- Category sections cap visible height to two rows and use internal scroll.
- Dragging a card reorders skills inside that category and persists settings.
- Restore default clears a category's custom order.
- Detail panel resize handle updates the grid width and persists settings.

Existing tests for category filtering, custom tags, table view, and settings persistence should continue to pass.
