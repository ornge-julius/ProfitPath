# Trade History Table Column Sorting

## Overview

Enable users to sort trade data by clicking on column headers in the Trade History table. Clicking a column header will toggle between ascending and descending sort order, with a visual indicator showing the current sort state. The table maintains its default sort order (exit date descending) when the page first loads.

## Problem Statement

Currently, the Trade History table displays trades in a fixed order (by exit date, newest first) with no ability for users to sort by other columns. Users often want to view their trades sorted by different criteria—such as finding their most profitable trades, viewing trades alphabetically by symbol, or ordering by entry date—to analyze their trading performance from different perspectives.

## Requirements

### Functional Requirements

1. **Column Header Click Sorting**: Users can click any column header to sort the table by that column
2. **Toggle Sort Direction**: Clicking the same column header again toggles between ascending and descending order
3. **Visual Sort Indicator**: Display an arrow icon (up/down) next to the currently sorted column indicating sort direction
4. **Default Sort State**: When the page loads, the table is sorted by Exit Date in descending order (newest first)
5. **Sortable Columns**: The following 10 columns support sorting:
   - Symbol (alphabetical)
   - Option (alphabetical)
   - Type (CALL before PUT, or vice versa)
   - Entry Price (numeric)
   - Exit Price (numeric)
   - Qty (numeric)
   - Entry Date (chronological)
   - Exit Date (chronological)
   - Profit (numeric)
   - Result (WIN before LOSS, or vice versa)
6. **Non-Sortable Columns**: The following columns do not support sorting and should not display sort indicators or respond to clicks:
   - Reason
   - Source
   - Tags
   - Notes
6. **Pagination Preservation**: Sorting applies to all trades, then pagination displays the sorted results; user is reset to page 1 when sort changes
7. **Cursor Feedback**: Column headers should show a pointer cursor to indicate they are clickable

### Non-Functional Requirements

1. **Performance**: Sorting should be instantaneous for typical trade datasets (< 1000 trades)
2. **Responsiveness**: Sort indicators and click areas should work well on all viewport sizes
3. **Accessibility**: 
   - Column headers must be keyboard accessible (focusable and activatable with Enter/Space)
   - Screen readers should announce the current sort state
   - Use `aria-sort` attribute on sorted column
4. **Visual Consistency**: Sort indicators should use Material UI's built-in `TableSortLabel` component for consistent styling

## Technical Implementation

### Recommended Approach

Refactor `TradeHistoryTable.jsx` to use Material UI's Table components with `TableSortLabel` for sorting functionality. MUI is already installed in the project (`@mui/material` v7.3.5) and provides built-in accessibility, consistent styling, and sort indicators.

**Key Benefits of MUI Table:**
- `TableSortLabel` handles accessibility automatically (`aria-sort`, screen reader announcements)
- Built-in sort direction icons (no need for custom icons)
- `TablePagination` provides standardized pagination controls
- Consistent with MUI components already used in the app (e.g., `Fab` in TradeHistoryView)

Reference: [MUI Table - Sorting & Selecting](https://mui.com/material-ui/react-table/#sorting-amp-selecting)

### Required MUI Imports

```jsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
```

### State Management

```jsx
const [orderBy, setOrderBy] = useState('exit_date');
const [order, setOrder] = useState('desc');
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(20);
```

### Column Configuration

Define a columns configuration array with sortable flag:

```jsx
const COLUMNS = [
  { id: 'symbol', label: 'Symbol', sortable: true, type: 'string' },
  { id: 'option', label: 'Option', sortable: true, type: 'string' },
  { id: 'position_type', label: 'Type', sortable: true, type: 'number' },
  { id: 'entry_price', label: 'Entry Price', sortable: true, type: 'number' },
  { id: 'exit_price', label: 'Exit Price', sortable: true, type: 'number' },
  { id: 'quantity', label: 'Qty', sortable: true, type: 'number' },
  { id: 'entry_date', label: 'Entry Date', sortable: true, type: 'date' },
  { id: 'exit_date', label: 'Exit Date', sortable: true, type: 'date' },
  { id: 'profit', label: 'Profit', sortable: true, type: 'number' },
  { id: 'result', label: 'Result', sortable: true, type: 'number' },
  { id: 'reasoning', label: 'Reason', sortable: false },
  { id: 'source', label: 'Source', sortable: false },
  { id: 'tags', label: 'Tags', sortable: false },
  { id: 'notes', label: 'Notes', sortable: false },
];
```

### Comparator Functions

Following MUI's recommended pattern for sorting:

```jsx
function descendingComparator(a, b, orderBy, type) {
  let aValue = a[orderBy];
  let bValue = b[orderBy];

  // Handle different data types
  if (type === 'string') {
    aValue = (aValue || '').toLowerCase();
    bValue = (bValue || '').toLowerCase();
  } else if (type === 'date') {
    aValue = aValue ? new Date(aValue).getTime() : 0;
    bValue = bValue ? new Date(bValue).getTime() : 0;
  } else if (type === 'number') {
    aValue = aValue ?? 0;
    bValue = bValue ?? 0;
  }

  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
}

function getComparator(order, orderBy, type) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy, type)
    : (a, b) => -descendingComparator(a, b, orderBy, type);
}
```

### Sort Request Handler

```jsx
const handleRequestSort = (property) => {
  const column = COLUMNS.find((c) => c.id === property);
  if (!column || !column.sortable) return;

  const isAsc = orderBy === property && order === 'asc';
  setOrder(isAsc ? 'desc' : 'asc');
  setOrderBy(property);
  setPage(0); // Reset to first page on sort change
};
```

### Sorted and Paginated Data

```jsx
const sortedTrades = useMemo(() => {
  const column = COLUMNS.find((c) => c.id === orderBy);
  const type = column?.type || 'string';
  return [...trades].sort(getComparator(order, orderBy, type));
}, [trades, order, orderBy]);

const paginatedTrades = useMemo(() => {
  return sortedTrades.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}, [sortedTrades, page, rowsPerPage]);
```

### Table Header with TableSortLabel

```jsx
<TableHead>
  <TableRow>
    {COLUMNS.map((column) => (
      <TableCell
        key={column.id}
        sortDirection={orderBy === column.id ? order : false}
        sx={{
          fontWeight: 'medium',
          // Add sticky styles for Symbol column
          ...(column.id === 'symbol' && {
            position: 'sticky',
            left: 0,
            zIndex: 3,
            backgroundColor: 'inherit',
          }),
        }}
      >
        {column.sortable ? (
          <TableSortLabel
            active={orderBy === column.id}
            direction={orderBy === column.id ? order : 'asc'}
            onClick={() => handleRequestSort(column.id)}
          >
            {column.label}
            {orderBy === column.id && (
              <Box component="span" sx={visuallyHidden}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>
            )}
          </TableSortLabel>
        ) : (
          column.label
        )}
      </TableCell>
    ))}
  </TableRow>
</TableHead>
```

### Pagination Controls

```jsx
<TablePagination
  rowsPerPageOptions={[10, 20, 50]}
  component="div"
  count={trades.length}
  rowsPerPage={rowsPerPage}
  page={page}
  onPageChange={(event, newPage) => setPage(newPage)}
  onRowsPerPageChange={(event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }}
/>
```

### Styling for Dark Mode

Apply custom styling to match the existing dark mode theme:

```jsx
<TableContainer
  component={Paper}
  sx={{
    backgroundColor: 'transparent',
    '& .MuiTableCell-root': {
      color: 'inherit',
      borderColor: 'rgba(107, 114, 128, 0.3)',
    },
    '& .MuiTableSortLabel-root': {
      color: 'inherit',
      '&:hover': {
        color: 'inherit',
        opacity: 0.7,
      },
      '&.Mui-active': {
        color: 'inherit',
      },
    },
    '& .MuiTableSortLabel-icon': {
      color: 'inherit !important',
    },
  }}
>
```

### File Structure

- `app/src/components/tables/TradeHistoryTable.jsx` - Main component to refactor

### Dependencies

- `@mui/material` - Already installed (v7.3.5), provides Table, TableSortLabel, TablePagination
- `@mui/utils` - For `visuallyHidden` utility (accessibility)

## Acceptance Criteria

### Scenario 1: Default Sort on Page Load
- **Given** the user navigates to the Trade History page
- **When** the page loads
- **Then** trades are displayed sorted by Exit Date in descending order (newest first)
- **And** the Exit Date column header shows a down arrow indicator

### Scenario 2: Sort by Clicking Column Header
- **Given** the user is viewing the Trade History table
- **When** they click on the "Symbol" column header
- **Then** the table sorts alphabetically by Symbol in ascending order (A-Z)
- **And** the Symbol column header shows an up arrow indicator
- **And** the Exit Date column no longer shows a sort indicator

### Scenario 3: Toggle Sort Direction
- **Given** the table is currently sorted by Symbol ascending
- **When** the user clicks the "Symbol" column header again
- **Then** the table sorts by Symbol in descending order (Z-A)
- **And** the Symbol column header shows a down arrow indicator

### Scenario 4: Sort Numeric Column
- **Given** the user is viewing the Trade History table
- **When** they click on the "Profit" column header
- **Then** the table sorts by Profit in descending order (highest first)
- **And** the Profit column header shows a down arrow indicator

### Scenario 5: Sort Date Column
- **Given** the user is viewing the Trade History table
- **When** they click on the "Entry Date" column header
- **Then** the table sorts by Entry Date in descending order (newest first)
- **And** the Entry Date column header shows a down arrow indicator

### Scenario 6: Pagination Reset on Sort
- **Given** the user is on page 3 of the Trade History table
- **When** they click a column header to sort
- **Then** the table is sorted by the selected column
- **And** the user is returned to page 1

### Scenario 7: Keyboard Navigation
- **Given** the user is using keyboard navigation
- **When** they tab to a column header and press Enter
- **Then** the table sorts by that column
- **And** the focus remains on the column header

### Scenario 8: Non-Sortable Columns
- **Given** the user is viewing the Trade History table
- **When** they click on the "Notes", "Tags", "Source", or "Reason" column header
- **Then** the table sort order does not change
- **And** no sort indicator appears on those columns
- **And** the cursor does not change to a pointer on those column headers

## Edge Cases

1. **Empty Table**: If no trades exist, sorting should not cause errors and the empty state should still display correctly
2. **Null/Undefined Values**: Trades with null/undefined values for a column should sort to the end (or beginning, consistently) regardless of direction
3. **Identical Values**: When multiple trades have the same value for the sorted column, maintain a stable secondary sort by exit_date descending
4. **Single Trade**: Sorting a table with only one trade should work without error
5. **Special Characters in Text**: Symbols or notes containing special characters should sort correctly using locale-aware string comparison
6. **Date Edge Cases**: Handle trades with missing or invalid dates gracefully (treat as oldest or newest consistently)
7. **Empty String vs Null**: Distinguish between empty strings and null values consistently in sorting
8. **Large Dataset Performance**: Ensure sorting remains responsive with 500+ trades
9. **Sticky Column Interaction**: The sticky Symbol column must maintain its sticky behavior while showing sort indicators correctly

## Testing Checklist

- [ ] Default sort is Exit Date descending on page load
- [ ] Clicking each column header sorts by that column
- [ ] Clicking the same column toggles sort direction
- [ ] Sort indicator (arrow) displays on the active column
- [ ] Sortable columns show MUI's sort indicator on hover
- [ ] Pagination resets to page 1 when sort changes
- [ ] Sorting works with empty table (no errors)
- [ ] Sorting handles null/undefined values gracefully
- [ ] Symbol column (sticky) sorts correctly and stays sticky
- [ ] Date columns sort chronologically (not alphabetically)
- [ ] Numeric columns sort numerically (not as strings)
- [ ] Non-sortable columns (Notes, Tags, Source, Reason) do not respond to clicks
- [ ] Non-sortable columns do not show sort indicators or pointer cursor
- [ ] Keyboard navigation works (Tab + Enter/Space)
- [ ] Screen reader announces sort state correctly
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Works on mobile devices (touch to sort)
- [ ] Sort state persists during pagination navigation
- [ ] Performance acceptable with 500+ trades
- [ ] Hover state on headers is visually distinct
- [ ] Dark mode styling is correct for sort indicators

## Related Resources

- [MUI Table Component](https://mui.com/material-ui/react-table/)
- [MUI Table Sorting & Selecting Example](https://mui.com/material-ui/react-table/#sorting-amp-selecting)
- [MUI TableSortLabel API](https://mui.com/material-ui/api/table-sort-label/)
- [MUI TablePagination API](https://mui.com/material-ui/api/table-pagination/)
- [ARIA Sort Attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-sort)
