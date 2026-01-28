# Trade History Table - Material React Table Conversion

## Overview

Fully convert the Trade History Table from a custom-built implementation to Material React Table (MRT) v3. This conversion will replace all existing custom table markup, MUI sorting components, and manual pagination logic with MRT's comprehensive, batteries-included data grid. The primary driver for this conversion is to enable drag-and-drop column reordering, but MRT also provides a more maintainable and feature-rich foundation for future table enhancements.

## Problem Statement

The current `TradeHistoryTable` component is a custom-built implementation that:
- Uses raw HTML table elements (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`)
- Relies on MUI's `TableSortLabel` component for sorting indicators
- Implements manual sorting logic with custom comparator functions
- Handles pagination state and calculations manually
- Has a sticky column implementation using custom CSS

This custom approach has several limitations:
1. **No column reordering** - Users cannot customize column positions
2. **High maintenance burden** - Every new feature requires manual implementation
3. **Inconsistent UX** - Mixing raw table elements with MUI components creates styling challenges
4. **Limited accessibility** - Custom implementations often miss accessibility features that established libraries provide

Material React Table provides all these features out-of-the-box with a polished, accessible, and well-tested implementation.

## Requirements

### Functional Requirements

1. **Complete Library Migration**: Replace the entire custom table implementation with Material React Table
2. **Column Drag-and-Drop Reordering**: Users must be able to drag column headers to reorder columns
3. **Visual Drag Feedback**: Clear visual feedback during drag operations showing the column being dragged and drop target
4. **Column Pinning**: Symbol column must remain pinned to the left and non-reorderable
5. **Built-in Sorting**: Use MRT's sorting functionality (replaces custom `TableSortLabel` implementation)
6. **Built-in Pagination**: Use MRT's pagination (replaces custom pagination logic)
7. **Preserve Cell Rendering**: All custom cell renderers must be maintained:
   - Symbol as clickable link to trade detail
   - Position type with colored badges (Long/Short)
   - Profit with conditional coloring (green/red)
   - Result with Win/Loss badges
   - Tags displayed as `TagBadge` components
   - Truncated text with title tooltips for Option, Reasoning, Source, Notes
8. **Preserve Navigation**: Clicking Symbol link navigates to trade detail page with proper `from` state

### Non-Functional Requirements

1. **Performance**: Table should render smoothly with 100+ rows; sorting and pagination should feel instant
2. **Responsiveness**: Table must work on desktop and tablet viewports with horizontal scrolling
3. **Accessibility**: 
   - Keyboard navigation for sorting, pagination, and column reordering
   - Screen reader support for all interactive elements
   - ARIA attributes for sort state and pagination
4. **Theme Consistency**: Table must integrate with the app's dark/light theme system
5. **Bundle Size**: Material React Table adds ~37-53 KB to bundle (acceptable for features provided)

## Technical Implementation

### Step 1: Install Material React Table

```bash
cd app
npm install material-react-table
```

**Note**: MRT v3 requires MUI v5+ which is already installed. The following peer dependencies are already present:
- `@mui/material` (v7.3.5)
- `@mui/icons-material` (v7.3.5)
- `@emotion/react` (v11.14.0)
- `@emotion/styled` (v11.14.1)

### Step 2: Remove Deprecated Imports

The following imports and code will be **removed** from `TradeHistoryTable.jsx`:

```jsx
// REMOVE these imports
import { TableSortLabel, Box } from '@mui/material';
import { visuallyHidden } from '@mui/utils';

// REMOVE these helper functions (no longer needed)
const COLUMNS = [...];  // Replace with MRT column definitions
function descendingComparator(...) { }
function getComparator(...) { }
function stableSort(...) { }
```

### Step 3: Complete Component Rewrite

Replace the entire `TradeHistoryTable.jsx` with Material React Table implementation:

```jsx
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { getResultText, isWin, getTradeTypeText, formatDate } from '../../utils/calculations';
import TagBadge from '../ui/TagBadge';

const TradeHistoryTable = ({ trades, title }) => {
  const location = useLocation();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        enableColumnOrdering: false, // Prevent reordering of pinned column
        size: 100,
        Cell: ({ row }) => (
          <Link
            to={`/detail/${row.original.id}`}
            state={{ from: `${location.pathname}${location.search}` }}
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {row.original.symbol}
          </Link>
        ),
      },
      {
        accessorKey: 'option',
        header: 'Option',
        size: 120,
        Cell: ({ cell }) => (
          <div 
            className="text-sm text-gray-700 dark:text-gray-300 max-w-32 truncate" 
            title={cell.getValue() || ''}
          >
            {cell.getValue() || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'position_type',
        header: 'Type',
        size: 80,
        Cell: ({ cell }) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              cell.getValue() === 1
                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
            }`}
          >
            {getTradeTypeText(cell.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'entry_price',
        header: 'Entry Price',
        size: 110,
        Cell: ({ cell }) => (
          <span className="text-gray-700 dark:text-gray-300">
            ${cell.getValue()?.toFixed(2) || '0.00'}
          </span>
        ),
      },
      {
        accessorKey: 'exit_price',
        header: 'Exit Price',
        size: 110,
        Cell: ({ cell }) => (
          <span className="text-gray-700 dark:text-gray-300">
            ${cell.getValue()?.toFixed(2) || '0.00'}
          </span>
        ),
      },
      {
        accessorKey: 'quantity',
        header: 'Qty',
        size: 70,
        Cell: ({ cell }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {cell.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'entry_date',
        header: 'Entry Date',
        size: 120,
        sortingFn: 'datetime',
        Cell: ({ cell }) => (
          <span className="text-gray-700 dark:text-gray-300 text-sm">
            {formatDate(cell.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'exit_date',
        header: 'Exit Date',
        size: 120,
        sortingFn: 'datetime',
        Cell: ({ cell }) => (
          <span className="text-gray-700 dark:text-gray-300 text-sm">
            {formatDate(cell.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'profit',
        header: 'Profit',
        size: 100,
        Cell: ({ cell }) => (
          <span className={`font-bold ${cell.getValue() >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${cell.getValue()?.toLocaleString() || '0'}
          </span>
        ),
      },
      {
        accessorKey: 'result',
        header: 'Result',
        size: 90,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          if (value === undefined || value === null) {
            return <span className="text-gray-500 dark:text-gray-500 text-sm">-</span>;
          }
          return (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                isWin(value)
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
              }`}
            >
              {getResultText(value)}
            </span>
          );
        },
      },
      {
        accessorKey: 'reasoning',
        header: 'Reason',
        size: 150,
        enableSorting: false,
        Cell: ({ cell }) => (
          <div
            className="text-sm text-gray-700 dark:text-gray-300 max-w-48 truncate"
            title={cell.getValue() || ''}
          >
            {cell.getValue() || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        size: 120,
        enableSorting: false,
        Cell: ({ cell }) => (
          <div
            className="text-sm text-purple-600 dark:text-purple-300 max-w-32 truncate"
            title={cell.getValue() || ''}
          >
            {cell.getValue() || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'tags',
        header: 'Tags',
        size: 180,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5 max-w-44">
            {row.original.tags && row.original.tags.length > 0 ? (
              row.original.tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} size="small" />
              ))
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        size: 150,
        enableSorting: false,
        Cell: ({ cell }) => (
          <div
            className="text-sm text-gray-700 dark:text-gray-300 max-w-40 truncate"
            title={cell.getValue() || ''}
          >
            {cell.getValue() || '-'}
          </div>
        ),
      },
    ],
    [location.pathname, location.search]
  );

  const table = useMaterialReactTable({
    columns,
    data: trades || [],
    
    // Feature flags
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableSorting: true,
    enablePagination: true,
    enableColumnResizing: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enableHiding: false,
    
    // Initial state
    initialState: {
      sorting: [{ id: 'exit_date', desc: true }],
      columnPinning: { left: ['symbol'] },
      pagination: { pageSize: 20, pageIndex: 0 },
      density: 'comfortable',
    },
    
    // Pagination options
    paginationDisplayMode: 'pages',
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 50],
      showFirstButton: false,
      showLastButton: false,
    },
    
    // Container styling
    muiTableContainerProps: {
      sx: { maxHeight: 'calc(100vh - 250px)' },
    },
    
    // Paper (outer wrapper) styling
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: '0.75rem',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      },
      className: 'bg-white dark:bg-gray-800/50 backdrop-blur border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl',
    },
    
    // Table head styling
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 500,
        backgroundColor: 'var(--mrt-header-bg, #f9fafb)',
        '.dark &': {
          backgroundColor: 'var(--mrt-header-bg-dark, rgb(55, 65, 81))',
        },
      },
    },
    
    // Table body row styling
    muiTableBodyRowProps: {
      sx: {
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          '.dark &': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        },
      },
    },
    
    // Top toolbar customization (render custom title)
    renderTopToolbarCustomActions: () => (
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 px-2 py-1">
        {title}
      </h3>
    ),
    
    // Localization for empty state
    localization: {
      noRecordsToDisplay: 'No trades to display',
    },
  });

  return <MaterialReactTable table={table} />;
};

export default TradeHistoryTable;
```

### Step 4: Theme Integration with CSS Variables

Add CSS variables to support MRT's dark mode integration. In `app/src/index.css`:

```css
:root {
  --mrt-header-bg: #f9fafb;
  --mrt-header-bg-dark: rgb(55, 65, 81);
}

.dark {
  --mrt-header-bg: rgb(55, 65, 81);
}

/* Override MRT's default MUI theme for dark mode compatibility */
.dark .MuiTableContainer-root {
  background-color: transparent;
}

.dark .MuiTable-root {
  background-color: transparent;
}

.dark .MuiTableCell-root {
  border-color: rgb(55, 65, 81);
  color: rgb(209, 213, 219);
}

.dark .MuiTableSortLabel-root {
  color: rgb(209, 213, 219);
}

.dark .MuiTableSortLabel-root:hover {
  color: rgb(243, 244, 246);
}

.dark .MuiTableSortLabel-root.Mui-active {
  color: rgb(243, 244, 246);
}

.dark .MuiTablePagination-root {
  color: rgb(209, 213, 219);
}

.dark .MuiIconButton-root {
  color: rgb(156, 163, 175);
}

.dark .MuiIconButton-root:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.dark .MuiSelect-icon {
  color: rgb(156, 163, 175);
}
```

### File Structure

| File | Action | Description |
|------|--------|-------------|
| `app/src/components/tables/TradeHistoryTable.jsx` | **Replace** | Complete rewrite using Material React Table |
| `app/src/index.css` | **Modify** | Add CSS variables and dark mode overrides for MRT |
| `app/package.json` | **Modify** | Add `material-react-table` dependency |

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `material-react-table` | `^3.0.0` | Complete table solution with column ordering, sorting, pagination, pinning |

### Code Removed

The following custom implementations will be deleted:

1. **COLUMNS constant** - Replaced by MRT column definitions with `accessorKey` and `Cell` renderers
2. **descendingComparator function** - MRT handles sorting internally
3. **getComparator function** - MRT handles sorting internally  
4. **stableSort function** - MRT handles sorting internally
5. **handleRequestSort function** - Replaced by MRT's built-in sort handling
6. **sortedTrades useMemo** - MRT manages sorted data internally
7. **Pagination state and handlers** - MRT manages pagination internally
8. **Custom `<table>` markup** - Replaced by `<MaterialReactTable />` component
9. **TableSortLabel import** - MRT provides its own sort indicators
10. **Manual sticky column CSS** - Replaced by `enableColumnPinning` + `columnPinning` state

## Acceptance Criteria

### Scenario 1: Table Renders with Material React Table
- **Given** the user navigates to the Trade History page
- **When** the page loads with trade data
- **Then** the table should render using Material React Table
- **And** all columns should display with correct headers
- **And** all cell data should render correctly with custom formatting

### Scenario 2: Dragging a Column to a New Position
- **Given** the user is viewing the Trade History Table
- **When** they drag the "Profit" column header and drop it between "Option" and "Type"
- **Then** the "Profit" column should appear in the new position immediately
- **And** all row data should remain correctly aligned with their respective columns

### Scenario 3: Visual Feedback During Drag
- **Given** the user is viewing the Trade History Table
- **When** they start dragging a column header
- **Then** the dragged column should have a visual indicator (opacity change, grab cursor)
- **And** a drop indicator should show where the column will be placed

### Scenario 4: Symbol Column Remains Pinned
- **Given** the user is viewing the Trade History Table
- **When** they attempt to drag the "Symbol" column
- **Then** the column should not be draggable
- **And** the Symbol column should remain pinned to the left
- **And** when scrolling horizontally, Symbol column stays visible

### Scenario 5: Sorting Works via MRT
- **Given** the user is viewing the Trade History Table
- **When** they click on the "Entry Date" column header
- **Then** the table should sort by Entry Date ascending
- **When** they click the same column header again
- **Then** the table should sort by Entry Date descending

### Scenario 6: Sorting Preserves Column Order
- **Given** the user has reordered columns (e.g., moved Profit before Option)
- **When** they click on a column header to sort
- **Then** the sort should apply correctly
- **And** the custom column order should be preserved

### Scenario 7: Pagination Works via MRT
- **Given** there are more than 20 trades
- **When** the user views the Trade History Table
- **Then** pagination controls should appear at the bottom
- **When** they click "Next page"
- **Then** the next 20 trades should display
- **And** any custom column order should be preserved

### Scenario 8: Row Navigation to Trade Detail
- **Given** the user is viewing the Trade History Table
- **When** they click on a Symbol link (e.g., "AAPL")
- **Then** they should be navigated to `/detail/{trade_id}`
- **And** the `from` location state should be set for back navigation

### Scenario 9: Dark Mode Theme Consistency
- **Given** the application is in dark mode
- **When** the user views the Trade History Table
- **Then** the table background should be dark (`bg-gray-800/50`)
- **And** header cells should have dark background
- **And** text should be light colored for readability
- **And** borders should use dark theme colors
- **And** drag indicators should be visible

### Scenario 10: Light Mode Theme Consistency  
- **Given** the application is in light mode
- **When** the user views the Trade History Table
- **Then** the table should have light background
- **And** header cells should have `bg-gray-50` background
- **And** text should be dark for readability

### Scenario 11: Empty State
- **Given** there are no trades to display
- **When** the user views the Trade History Table
- **Then** the table should display "No trades to display" message
- **And** column headers should still be visible

## Edge Cases

1. **Empty Table**: Display "No trades to display" with visible headers; column ordering should still work on headers
2. **Single Trade**: Table should render correctly with one row; pagination should not show
3. **Rapid Reordering**: Multiple quick drag operations should not cause state corruption or visual glitches
4. **Mobile/Touch**: On touch devices, ensure drag gestures work and don't conflict with scroll
5. **Null Cell Values**: Cells with null/undefined values should display "-" or appropriate placeholder
6. **Very Long Text**: Truncated cells (Option, Reasoning, Notes) should show full text in title tooltip
7. **Many Tags**: Rows with many tags should wrap within the Tags cell without breaking layout
8. **Browser Tab Switch Mid-Drag**: Drag operation should cancel gracefully without errors
9. **Page Navigation Mid-Drag**: No errors should occur if user navigates away during drag
10. **Large Dataset (500+ rows)**: Table should remain responsive; consider virtualization if performance degrades

## Testing Checklist

### Functionality
- [ ] Table renders correctly with MRT
- [ ] All 14 columns display with correct headers
- [ ] Column reordering works via drag-and-drop
- [ ] Symbol column is pinned left and cannot be reordered
- [ ] Symbol column stays visible during horizontal scroll
- [ ] Sorting works on all sortable columns (click header)
- [ ] Sort direction toggles correctly (asc/desc)
- [ ] Default sort is Exit Date descending
- [ ] Pagination displays correct page count
- [ ] Pagination navigation works (next, prev, page numbers)
- [ ] Rows per page selector works (10, 20, 50)
- [ ] Symbol links navigate to trade detail page
- [ ] Back navigation works from trade detail

### Cell Rendering
- [ ] Symbol displays as blue link
- [ ] Option displays with truncation and tooltip
- [ ] Position Type shows Long (green) / Short (red) badge
- [ ] Entry/Exit Price formats as currency ($X.XX)
- [ ] Quantity displays as number
- [ ] Entry/Exit Date formats correctly
- [ ] Profit shows green (positive) / red (negative)
- [ ] Result shows Win (green) / Loss (red) badge
- [ ] Reasoning truncates with tooltip
- [ ] Source shows purple text with truncation
- [ ] Tags render as TagBadge components
- [ ] Notes truncate with tooltip

### Theming
- [ ] Light mode styling matches design
- [ ] Dark mode styling matches design
- [ ] Drag indicators visible in both themes
- [ ] Sort icons visible in both themes
- [ ] Pagination controls styled correctly in both themes

### Cross-Browser
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

### Accessibility
- [ ] Keyboard navigation for sorting
- [ ] Keyboard navigation for pagination
- [ ] Screen reader announces sort state
- [ ] Focus indicators visible

### Performance
- [ ] Table loads quickly with 100+ rows
- [ ] Sorting feels instant
- [ ] Pagination feels instant
- [ ] Column reordering is smooth
- [ ] No console errors

## Related Resources

- [Material React Table - Home](https://www.material-react-table.com/)
- [Material React Table - Installation](https://www.material-react-table.com/docs/getting-started/install)
- [Material React Table - Column Ordering Example](https://www.material-react-table.com/docs/examples/column-ordering)
- [Material React Table - Column Pinning Guide](https://www.material-react-table.com/docs/guides/column-pinning)
- [Material React Table - Sorting Guide](https://www.material-react-table.com/docs/guides/sorting)
- [Material React Table - Pagination Guide](https://www.material-react-table.com/docs/guides/pagination)
- [Material React Table - Customize Components](https://www.material-react-table.com/docs/guides/customize-components)
- [Material React Table - State Management](https://www.material-react-table.com/docs/guides/state-management)
