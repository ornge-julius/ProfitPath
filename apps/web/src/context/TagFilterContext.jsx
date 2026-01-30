import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'dashboardTagFilter';
const FILTER_MODE_KEY = 'dashboardTagFilterMode';

const TagFilterContext = createContext(null);

const FILTER_MODES = {
  OR: 'or',
  AND: 'and'
};

const DEFAULT_FILTER_MODE = FILTER_MODES.OR;

const readTagFilterFromUrl = () => {
  if (typeof window === 'undefined') {
    return { tagIds: null, mode: null };
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const tagsParam = params.get('tags');
    const modeParam = params.get('tagMode');
    
    let tagIds = null;
    if (tagsParam) {
      // Parse comma-separated tag IDs
      const parsed = tagsParam
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
      tagIds = parsed.length > 0 ? parsed : null;
    }

    const mode = modeParam && (modeParam === FILTER_MODES.OR || modeParam === FILTER_MODES.AND)
      ? modeParam
      : null;

    return { tagIds, mode };
  } catch (error) {
    return { tagIds: null, mode: null };
  }
};

const readTagFilterFromStorage = () => {
  if (typeof window === 'undefined') {
    return { tagIds: null, mode: null };
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    const storedMode = window.localStorage.getItem(FILTER_MODE_KEY);
    
    let tagIds = null;
    if (storedValue) {
      const parsed = JSON.parse(storedValue);
      if (Array.isArray(parsed)) {
        // Validate that all items are strings
        const validTagIds = parsed.filter(id => typeof id === 'string' && id.length > 0);
        tagIds = validTagIds.length > 0 ? validTagIds : null;
      }
    }

    const mode = storedMode && (storedMode === FILTER_MODES.OR || storedMode === FILTER_MODES.AND)
      ? storedMode
      : null;

    return { tagIds, mode };
  } catch (error) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(FILTER_MODE_KEY);
    }
    return { tagIds: null, mode: null };
  }
};

const persistTagFilter = (selectedTagIds, filterMode) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!selectedTagIds || selectedTagIds.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTagIds));
    }

    if (filterMode && (filterMode === FILTER_MODES.OR || filterMode === FILTER_MODES.AND)) {
      window.localStorage.setItem(FILTER_MODE_KEY, filterMode);
    } else {
      window.localStorage.removeItem(FILTER_MODE_KEY);
    }
  } catch (error) {
    // Error handling
  }
};

const updateUrl = (selectedTagIds, filterMode) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    if (!selectedTagIds || selectedTagIds.length === 0) {
      params.delete('tags');
    } else {
      // Store as comma-separated values
      params.set('tags', selectedTagIds.join(','));
    }

    if (filterMode && filterMode !== DEFAULT_FILTER_MODE) {
      params.set('tagMode', filterMode);
    } else {
      params.delete('tagMode');
    }

    const nextUrl = `${url.pathname}${params.toString() ? `?${params.toString()}` : ''}${url.hash}`;
    window.history.replaceState({}, '', nextUrl);
  } catch (error) {
    // Error handling
  }
};

export const TagFilterProvider = ({ children }) => {
  const initialData = useMemo(() => {
    const urlData = readTagFilterFromUrl();
    const storageData = readTagFilterFromStorage();
    
    return {
      tagIds: urlData.tagIds || storageData.tagIds || [],
      mode: urlData.mode || storageData.mode || DEFAULT_FILTER_MODE
    };
  }, []);

  const [selectedTagIds, setSelectedTagIds] = useState(initialData.tagIds);
  const [filterMode, setFilterMode] = useState(initialData.mode);
  const previousTagIds = useRef(selectedTagIds);
  const previousMode = useRef(filterMode);

  useEffect(() => {
    persistTagFilter(selectedTagIds, filterMode);
    updateUrl(selectedTagIds, filterMode);

    if (previousTagIds.current !== selectedTagIds || previousMode.current !== filterMode) {
      previousTagIds.current = selectedTagIds;
      previousMode.current = filterMode;
    }
  }, [selectedTagIds, filterMode]);

  const setSelectedTags = useCallback((tagIds) => {
    if (!Array.isArray(tagIds)) {
      return;
    }

    // Validate that all items are strings
    const validTagIds = tagIds.filter(id => typeof id === 'string' && id.length > 0);
    setSelectedTagIds(validTagIds);
  }, []);

  const addTag = useCallback((tagId) => {
    if (!tagId || typeof tagId !== 'string') {
      return;
    }

    setSelectedTagIds((current) => {
      if (current.includes(tagId)) {
        return current;
      }
      return [...current, tagId];
    });
  }, []);

  const removeTag = useCallback((tagId) => {
    setSelectedTagIds((current) => current.filter((id) => id !== tagId));
  }, []);

  const clearTags = useCallback(() => {
    setSelectedTagIds([]);
  }, []);

  const setMode = useCallback((mode) => {
    if (mode === FILTER_MODES.OR || mode === FILTER_MODES.AND) {
      setFilterMode(mode);
    }
  }, []);

  const value = useMemo(() => ({
    selectedTagIds,
    filterMode,
    setSelectedTags,
    addTag,
    removeTag,
    clearTags,
    setMode,
    FILTER_MODES,
  }), [selectedTagIds, filterMode, setSelectedTags, addTag, removeTag, clearTags, setMode]);

  return (
    <TagFilterContext.Provider value={value}>
      {children}
    </TagFilterContext.Provider>
  );
};

export const useTagFilter = () => {
  const context = useContext(TagFilterContext);
  if (!context) {
    throw new Error('useTagFilter must be used within a TagFilterProvider');
  }
  return context;
};

export const filterTradesByTags = (trades, selectedTagIds, filterMode = FILTER_MODES.OR) => {
  if (!Array.isArray(trades)) {
    return [];
  }

  if (!selectedTagIds || selectedTagIds.length === 0) {
    return trades;
  }

  const mode = filterMode === FILTER_MODES.AND ? FILTER_MODES.AND : FILTER_MODES.OR;

  return trades.filter((trade) => {
    if (!trade) {
      return false;
    }

    // Handle trades with no tags or empty tags array
    const tradeTags = trade.tags || [];
    if (!Array.isArray(tradeTags) || tradeTags.length === 0) {
      return false;
    }

    const tradeTagIds = tradeTags.map((tag) => tag?.id).filter(Boolean);

    if (mode === FILTER_MODES.AND) {
      // AND logic: trade must have ALL selected tags
      return selectedTagIds.every((selectedId) => tradeTagIds.includes(selectedId));
    } else {
      // OR logic: trade must have at least ONE of the selected tags
      return selectedTagIds.some((selectedId) => tradeTagIds.includes(selectedId));
    }
  });
};

