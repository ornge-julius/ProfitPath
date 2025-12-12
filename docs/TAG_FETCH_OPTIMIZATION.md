# Tag Data Fetching Optimization

## Problem Statement

The application is making **15+ duplicate API requests** to fetch tag data whenever a page loads. This causes:
- Unnecessary network traffic
- Slower page load times
- Increased server load
- Poor user experience

## Root Cause Analysis

### Why This Is Happening

Multiple components are independently calling the `useTagManagement()` hook, and each instance makes its own separate API request to fetch tags. There is no shared state or caching mechanism, so every component that needs tags triggers a new fetch.

### Components Currently Fetching Tags

1. **GlobalTagFilter** (`app/src/components/ui/GlobalTagFilter.jsx`)
   - Used in the Header component
   - Rendered on dashboard (`/`) and history (`/history`) pages
   - Line 10: `const { tags, loading } = useTagManagement();`

2. **TradeForm** (`app/src/components/forms/TradeForm.jsx`)
   - Always mounted in the app (conditionally visible)
   - Line 32: `const { tags, loading: tagsLoading } = useTagManagement();`

3. **TagsManagementView** (`app/src/components/views/TagsManagementView.jsx`)
   - Rendered on the tags management page (`/tags`)
   - Line 15: `const { tags, loading, error, createTag, updateTag, deleteTag } = useTagManagement();`

### Additional Issue in the Hook

The `useTagManagement` hook has a dependency chain that can cause extra fetches:

```javascript
// In useTagManagement.js
const fetchTags = useCallback(async () => {
  // ... fetch logic
}, [user]); // Depends on user

useEffect(() => {
  fetchTags();
}, [fetchTags]); // Depends on fetchTags, which changes when user changes
```

When the `user` object changes (even slightly), `fetchTags` is recreated, which triggers the `useEffect` again, causing another fetch.

## Solution: Create a Tag Context Provider

The solution is to create a **Tag Context Provider** that:
1. Fetches tags **once** at the application level
2. Shares the same tag data across all components
3. Provides a single source of truth for tag state
4. Automatically updates all components when tags change

This pattern is already used in the codebase for `TagFilterContext` and `DateFilterContext`, so we'll follow the same approach.

## Implementation Steps

### Step 1: Create the Tag Context File

Create a new file: `app/src/context/TagContext.jsx`

This context will:
- Manage tag state globally
- Fetch tags once when the provider mounts
- Provide tag data and management functions to all child components
- Handle loading and error states

### Step 2: Update useTagManagement Hook

Modify `app/src/hooks/useTagManagement.js` to:
- Use the Tag Context instead of fetching directly
- Remove the internal fetch logic
- Return data from context

### Step 3: Add TagProvider to App.jsx

Wrap the application with `TagProvider` in `app/src/App.jsx` (similar to how `TagFilterProvider` is used).

### Step 4: Update Components

Update all components that use `useTagManagement()` to use the new context-based hook.

## Detailed Implementation Guide

### Step 1: Create TagContext.jsx

**File:** `app/src/context/TagContext.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';

const TagContext = createContext(null);

export const useTagContext = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTagContext must be used within a TagProvider');
  }
  return context;
};

export const TagProvider = ({ children }) => {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tags')
        .select('*, trade_tags(id)')
        .order('name', { ascending: true });

      // If user is logged in, filter by user_id
      // If not logged in, try to fetch all tags (may fail due to RLS)
      if (user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        // If error is due to RLS (not authenticated), set empty tags array
        // Otherwise, throw the error
        if (fetchError.code === 'PGRST301' || fetchError.message?.includes('permission') || fetchError.message?.includes('RLS')) {
          setTags([]);
          setError(null);
          return;
        }
        throw fetchError;
      }

      // Transform data to include usage count
      const tagsWithUsage = (data || []).map(tag => ({
        ...tag,
        usage_count: tag.trade_tags?.length || 0
      }));

      setTags(tagsWithUsage);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tags:', err);
      // Set empty tags on error to prevent UI from breaking
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch tags when component mounts or user changes
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(async (tagData) => {
    if (!user) return null;

    try {
      const { data, error: createError } = await supabase
        .from('tags')
        .insert([{
          name: tagData.name,
          color: tagData.color || null,
          user_id: user.id
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Refetch tags to get updated list
      await fetchTags();
      return data;
    } catch (err) {
      throw err;
    }
  }, [user, fetchTags]);

  const updateTag = useCallback(async (tagId, tagData) => {
    if (!user) return null;

    try {
      const { data, error: updateError } = await supabase
        .from('tags')
        .update({
          name: tagData.name,
          color: tagData.color || null
        })
        .eq('id', tagId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refetch tags to get updated list
      await fetchTags();
      return data;
    } catch (err) {
      throw err;
    }
  }, [user, fetchTags]);

  const deleteTag = useCallback(async (tagId) => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Refetch tags to get updated list
      await fetchTags();
    } catch (err) {
      throw err;
    }
  }, [user, fetchTags]);

  const value = {
    tags,
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
    refetch: fetchTags
  };

  return (
    <TagContext.Provider value={value}>
      {children}
    </TagContext.Provider>
  );
};
```

**Key Points:**
- The context manages all tag state in one place
- `fetchTags` is called only once when the provider mounts or when the user changes
- All tag CRUD operations trigger a refetch to keep data in sync
- The context provides the same API as the old hook for easy migration

### Step 2: Update useTagManagement Hook

**File:** `app/src/hooks/useTagManagement.js`

Replace the entire file content with:

```javascript
import { useTagContext } from '../context/TagContext';

/**
 * Hook to access tag data and management functions.
 * This is now a thin wrapper around TagContext for backward compatibility.
 * 
 * @returns {Object} Tag data and management functions
 */
export const useTagManagement = () => {
  return useTagContext();
};
```

**Why This Works:**
- Maintains backward compatibility - all existing components continue to work
- The hook now just returns the context value
- No breaking changes needed in components

### Step 3: Add TagProvider to App.jsx

**File:** `app/src/App.jsx`

1. Import the TagProvider at the top:

```javascript
import { TagProvider } from './context/TagContext';
```

2. Wrap the application with TagProvider. Update the App function:

```javascript
function App() {
  return (
    <ThemeProvider>
      <DateFilterProvider>
        <TagFilterProvider>
          <TagProvider>
            <BrowserRouter>
              <AppContent />
              <SpeedInsights />
              <Analytics />
            </BrowserRouter>
          </TagProvider>
        </TagFilterProvider>
      </DateFilterProvider>
    </ThemeProvider>
  );
}
```

**Important:** The `TagProvider` should be inside `TagFilterProvider` but outside `BrowserRouter` so it's available to all routes.

### Step 4: Verify Components Work

No changes are needed to the components! Since `useTagManagement()` now returns the context value, all existing components will automatically:
- Use the shared tag data
- Stop making duplicate requests
- Get updates when tags change

## Testing the Fix

### Before the Fix
1. Open browser DevTools → Network tab
2. Filter by "tags" requests
3. Load the dashboard page (`/`)
4. You should see **multiple requests** to `tags?select=...`

### After the Fix
1. Open browser DevTools → Network tab
2. Filter by "tags" requests
3. Load the dashboard page (`/`)
4. You should see **only 1 request** to `tags?select=...`
5. Navigate to different pages - no additional tag requests should be made
6. Open/close the TradeForm - no additional tag requests should be made

### Test Scenarios

1. **Page Load**
   - Navigate to dashboard → Should see 1 tag request
   - Navigate to history → Should see 0 new tag requests (already loaded)

2. **Tag Operations**
   - Create a tag → Should see 1 refetch request
   - Update a tag → Should see 1 refetch request
   - Delete a tag → Should see 1 refetch request

3. **Multiple Components**
   - Open TradeForm while on dashboard → Should see 0 new tag requests
   - Both GlobalTagFilter and TradeForm should show the same tags

4. **User Authentication**
   - Sign in → Should see 1 tag request
   - Sign out → Tags should clear (no error)

## Benefits of This Solution

1. **Performance**: Reduces API calls from 15+ to 1 per page load
2. **Consistency**: All components see the same tag data
3. **Maintainability**: Single source of truth for tag state
4. **User Experience**: Faster page loads, less network usage
5. **Backward Compatible**: No changes needed to existing components

## Common Issues and Solutions

### Issue: "useTagContext must be used within a TagProvider"
**Solution:** Make sure `TagProvider` wraps your component tree in `App.jsx`

### Issue: Tags not updating after create/update/delete
**Solution:** Check that `fetchTags()` is being called after tag operations in the context

### Issue: Still seeing multiple requests
**Solution:** 
- Check that all components are using `useTagManagement()` (not fetching directly)
- Verify `TagProvider` is only added once in `App.jsx`
- Check browser DevTools to see which component is making the request

## Summary

The fix involves:
1. ✅ Creating `TagContext.jsx` to manage tag state globally
2. ✅ Updating `useTagManagement.js` to use the context
3. ✅ Adding `TagProvider` to `App.jsx`
4. ✅ No changes needed to components (backward compatible)

This follows the same pattern as `TagFilterContext` and `DateFilterContext`, making it consistent with the existing codebase architecture.

