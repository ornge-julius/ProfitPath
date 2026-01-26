# Trade History Table - Sticky First Column

## Overview

Implement a "frozen" or "sticky" first column in the trade history table that remains fixed in place while the user scrolls horizontally through the remaining columns. This is a common UX pattern for data-dense tables where users need to maintain context (typically an identifier column) while reviewing data across many columns.

## Problem Statement

When the trade history table contains many columns, users must scroll horizontally to view all data. During horizontal scrolling, the first column (typically containing trade identifiers, dates, or other key reference data) scrolls out of view, making it difficult to correlate data in the visible columns with the correct row.

## Requirements

### Functional Requirements

1. **First Column Stays Fixed**: The first column of the trade history table must remain visible and fixed to the left edge of the table viewport at all times during horizontal scrolling.

2. **Horizontal Scroll Behavior**: When the user scrolls horizontally:
   - The first column remains stationary
   - All other columns scroll normally beneath/beside it
   - The scrollbar should reflect the scrollable area (excluding the fixed column width)

3. **Vertical Scroll Behavior**: When the user scrolls vertically:
   - The first column scrolls vertically along with all other columns
   - Row alignment must remain consistent between the fixed column and scrollable columns

4. **Header Alignment**: The table header for the first column must also remain fixed and aligned with its data column.

5. **Visual Separation**: Add a visual indicator (shadow, border, or divider) on the right edge of the fixed column to clearly delineate the frozen area from the scrollable area.

### Non-Functional Requirements

1. **Performance**: The sticky column implementation should not cause jank or performance issues during scrolling.

2. **Responsiveness**: The feature should work correctly across different viewport sizes.

3. **Accessibility**: 
   - Screen readers should still read the table in logical order
   - Keyboard navigation should work naturally across all columns

## Technical Implementation

### CSS-Based Approach (Recommended)

Use CSS `position: sticky` for a performant, native solution:

```css
/* Table container must have overflow-x for horizontal scroll */
.trade-history-table-container {
  overflow-x: auto;
  max-width: 100%;
}

/* First column header - sticky */
.trade-history-table th:first-child {
  position: sticky;
  left: 0;
  z-index: 2; /* Higher than body cells */
  background-color: var(--header-bg-color);
}

/* First column body cells - sticky */
.trade-history-table td:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
  background-color: var(--row-bg-color);
}

/* Visual separator shadow on fixed column */
.trade-history-table th:first-child,
.trade-history-table td:first-child {
  box-shadow: 2px 0 5px -2px rgba(0, 0, 0, 0.15);
}

/* Handle alternating row colors if applicable */
.trade-history-table tr:nth-child(even) td:first-child {
  background-color: var(--row-alt-bg-color);
}
```

### HTML Structure Requirements

Ensure the table follows standard semantic HTML:

```html
<div class="trade-history-table-container">
  <table class="trade-history-table">
    <thead>
      <tr>
        <th>Trade ID</th>  <!-- This column will be sticky -->
        <th>Date</th>
        <th>Symbol</th>
        <!-- ... more columns ... -->
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>12345</td>  <!-- This cell will be sticky -->
        <td>2026-01-23</td>
        <td>AAPL</td>
        <!-- ... more cells ... -->
      </tr>
      <!-- ... more rows ... -->
    </tbody>
  </table>
</div>
```

### JavaScript Considerations

If using a JavaScript table library (e.g., AG Grid, React Table, DataTables):

- **AG Grid**: Use `pinned: 'left'` in column definition
- **React Table**: Implement with `useSticky` hook or CSS approach
- **DataTables**: Use FixedColumns extension
- **Tanstack Table**: Use column pinning feature

### Browser Compatibility

`position: sticky` is supported in all modern browsers:
- Chrome 56+
- Firefox 59+
- Safari 13+
- Edge 16+

For older browser support, consider a JavaScript-based fallback or polyfill.

## Acceptance Criteria

### Scenario 1: Horizontal Scrolling
- **Given** the trade history table is displayed with more columns than fit in the viewport
- **When** the user scrolls horizontally to the right
- **Then** the first column remains fixed at the left edge
- **And** all other columns scroll normally

### Scenario 2: Vertical Scrolling
- **Given** the trade history table has more rows than fit in the viewport
- **When** the user scrolls vertically
- **Then** the first column scrolls vertically with all other content
- **And** row alignment is maintained

### Scenario 3: Visual Indicator
- **Given** the trade history table is displayed
- **When** the user scrolls horizontally
- **Then** a visual shadow/border appears on the right edge of the first column
- **And** it is clear which column is fixed vs. scrollable

### Scenario 4: Header Alignment
- **Given** the trade history table has a header row
- **When** the user scrolls horizontally
- **Then** the first column's header also remains fixed
- **And** it stays aligned with its corresponding data cells

### Scenario 5: Background Color Preservation
- **Given** the table has alternating row colors or hover states
- **When** the first column is sticky
- **Then** the background colors are preserved correctly
- **And** no transparency issues cause overlapping content to show through

## Edge Cases

1. **Single Column Table**: If the table only has one column, no horizontal scroll should be possible; the sticky behavior is effectively a no-op.

2. **Empty Table**: The header should still be sticky even when there are no data rows.

3. **Very Long First Column Content**: Ensure the first column width is either fixed or has a max-width to prevent it from consuming too much horizontal space.

4. **Mobile/Touch Devices**: Ensure touch-based horizontal scrolling works smoothly with the sticky column.

5. **Print Styles**: Consider whether the sticky behavior should be disabled for print media.

6. **RTL Languages**: For right-to-left layouts, the sticky column should be fixed to the right instead of the left.

## Testing Checklist

- [ ] First column stays fixed during horizontal scroll
- [ ] Vertical scrolling works correctly
- [ ] Header cell is also sticky
- [ ] Visual shadow/separator is visible
- [ ] Background colors render correctly (no transparency issues)
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Works on mobile devices (iOS Safari, Android Chrome)
- [ ] Screen reader announces table content correctly
- [ ] Keyboard navigation (Tab, Arrow keys) works as expected
- [ ] No performance issues with large datasets (1000+ rows)

## Related Resources

- [MDN: position: sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky)
- [CSS Tricks: Position Sticky](https://css-tricks.com/position-sticky-2/)
- [A11y: Tables with Sticky Headers](https://www.w3.org/WAI/tutorials/tables/)
