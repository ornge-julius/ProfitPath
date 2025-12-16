# Date Picker Timezone Bug Fix

## Problem Statement

When users select a date for a trade entry using the date picker in the TradeForm component, the saved date is one day before the date that was selected. This is a timezone-related bug that occurs when dates are converted between different formats (ISO timestamps, Date objects, and date strings).

## Root Cause

The issue occurs due to timezone conversion when dates are retrieved from the database and displayed in the date input field. The problem manifests in two scenarios:

1. **When editing an existing trade**: Dates retrieved from the database may be in ISO timestamp format (e.g., `2024-01-15T00:00:00Z`). When this is converted to a JavaScript `Date` object and then to a string for the HTML date input, timezone conversion can shift the date by one day if the user's timezone is behind UTC.

2. **When saving a new trade**: If the date string from the input is converted to a Date object before saving, timezone conversion can occur, causing the saved date to be different from the selected date.

## Current Implementation

### TradeForm Component (`app/src/components/forms/TradeForm.jsx`)

The TradeForm component uses HTML5 date inputs (`type="date"`) which expect and return date strings in `YYYY-MM-DD` format:

```34:50:app/src/components/forms/TradeForm.jsx
  useEffect(() => {
    if (editingTrade) {
      const {
        tags: tradeTags,
        profit,
        account_id,
        user_id,
        trade_tags,
        ...tradeFields
      } = editingTrade;

      setFormData({
        ...tradeFields,
        entry_price: editingTrade.entry_price.toString(),
        exit_price: editingTrade.exit_price.toString(),
        quantity: editingTrade.quantity.toString()
      });
```

**Issue**: When `editingTrade.entry_date` and `editingTrade.exit_date` are set directly from the database, they may be in ISO timestamp format (e.g., `2024-01-15T00:00:00Z`). The date input field expects `YYYY-MM-DD` format, and if the date is converted through a Date object, timezone issues occur.

### Date Input Fields

```191:211:app/src/components/forms/TradeForm.jsx
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entry Date</label>
            <input
              type="date"
              value={formData.entry_date}
              onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exit Date</label>
            <input
              type="date"
              value={formData.exit_date}
              onChange={(e) => setFormData({...formData, exit_date: e.target.value})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
```

### Trade Management Hook (`app/src/hooks/useTradeManagement.js`)

Dates are passed directly from the form to the database without conversion:

```88:95:app/src/hooks/useTradeManagement.js
    const newTrade = {
      symbol: tradeData.symbol,
      position_type: Number.isNaN(positionType) ? null : positionType,
      entry_price: entryPrice,
      exit_price: exitPrice,
      quantity,
      entry_date: tradeData.entry_date,
      exit_date: tradeData.exit_date,
```

## Solution

### Approach

Create a utility function to safely convert dates to `YYYY-MM-DD` format without timezone conversion issues. This function will:

1. Handle ISO timestamp strings (e.g., `2024-01-15T00:00:00Z`)
2. Handle date-only strings (e.g., `2024-01-15`)
3. Handle Date objects
4. Always return a date string in `YYYY-MM-DD` format without timezone conversion

### Implementation Steps

1. **Create a date utility function** in `app/src/utils/calculations.js`:
   - Function name: `formatDateForInput(dateValue)`
   - Purpose: Convert any date format to `YYYY-MM-DD` string for HTML date inputs
   - Logic: Extract the date portion without timezone conversion

2. **Update TradeForm component**:
   - Import the new utility function
   - Use it when setting form data for editing trades (in the `useEffect` hook)
   - Ensure dates are properly formatted before being set in `formData`

3. **Verify date handling in useTradeManagement**:
   - Ensure dates are stored as date-only strings (not timestamps)
   - Verify that dates from the database are properly formatted before being used

## Technical Details

### Date Format Requirements

- **HTML date input**: Requires `YYYY-MM-DD` format (e.g., `2024-01-15`)
- **Database storage**: Should store dates as date-only strings or timestamps (depending on schema)
- **JavaScript Date objects**: Can cause timezone issues when converting to/from strings

### Timezone Issue Example

If a user in PST (UTC-8) selects January 15, 2024:
- Date input returns: `"2024-01-15"` (timezone-neutral)
- If converted to Date: `new Date("2024-01-15")` → `2024-01-15T00:00:00.000Z` (UTC)
- When converted back to local date string: `2024-01-14` (one day earlier in PST)

### Solution Pattern

The utility function should extract the date components directly from the string or use local date methods to avoid UTC conversion:

```javascript
function formatDateForInput(dateValue) {
  if (!dateValue) return '';
  
  // If already in YYYY-MM-DD format, return as-is
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  
  // Handle ISO timestamp strings (YYYY-MM-DDTHH:mm:ss.sssZ)
  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    return dateValue.split('T')[0];
  }
  
  // Handle Date objects - use local date methods to avoid timezone issues
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
```

## Files to Modify

1. **`app/src/utils/calculations.js`**
   - Add `formatDateForInput` utility function

2. **`app/src/components/forms/TradeForm.jsx`**
   - Import `formatDateForInput` from utils
   - Update the `useEffect` hook to format dates when setting form data for editing

## Testing Requirements

1. **New Trade Entry**:
   - Select a date in the date picker
   - Submit the form
   - Verify the saved date matches the selected date

2. **Edit Existing Trade**:
   - Open a trade for editing
   - Verify the date picker shows the correct date (not one day earlier)
   - Change the date and save
   - Verify the updated date matches the selected date

3. **Timezone Testing**:
   - Test in different timezones (PST, EST, UTC)
   - Verify dates are consistent regardless of timezone

4. **Edge Cases**:
   - Dates at month boundaries (e.g., January 1, February 29)
   - Dates near timezone boundaries
   - Invalid date formats (should handle gracefully)

## Expected Behavior After Fix

- When a user selects a date in the date picker, that exact date should be saved to the database
- When editing a trade, the date picker should display the same date that was originally saved
- Dates should be consistent regardless of the user's timezone
- No date shifting should occur when saving or retrieving trades

## Related Code References

- Date input fields: `app/src/components/forms/TradeForm.jsx` lines 191-211
- Form data initialization: `app/src/components/forms/TradeForm.jsx` lines 34-69
- Trade submission: `app/src/hooks/useTradeManagement.js` lines 60-159
- Date formatting utilities: `app/src/utils/calculations.js` lines 71-90

