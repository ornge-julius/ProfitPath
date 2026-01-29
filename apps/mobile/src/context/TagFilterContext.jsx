import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storageJson } from '../utils/storage';

const STORAGE_KEY = 'profitpath_tag_filter';

// Filter mode constants
export const TAG_FILTER_MODES = {
  AND: 'AND',
  OR: 'OR'
};

const TagFilterContext = createContext(null);

export const TagFilterProvider = ({ children }) => {
  // Initialize with default values so consumers always have usable data
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [filterMode, setFilterMode] = useState(TAG_FILTER_MODES.OR);
  const [isLoading, setIsLoading] = useState(true);

  // Async initialization
  useEffect(() => {
    const loadPersistedFilter = async () => {
      try {
        const stored = await storageJson.get(STORAGE_KEY);
        if (stored) {
          if (Array.isArray(stored.selectedTagIds)) {
            setSelectedTagIds(stored.selectedTagIds);
          }
          if (stored.filterMode && Object.values(TAG_FILTER_MODES).includes(stored.filterMode)) {
            setFilterMode(stored.filterMode);
          }
        }
      } catch (error) {
        console.error('Error loading tag filter:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPersistedFilter();
  }, []);

  // Async persistence
  useEffect(() => {
    if (!isLoading) {
      storageJson.set(STORAGE_KEY, { selectedTagIds, filterMode }).catch(() => {});
    }
  }, [selectedTagIds, filterMode, isLoading]);

  // Toggle a tag selection
  const toggleTag = useCallback((tagId) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  // Clear all selected tags
  const clearTags = useCallback(() => {
    setSelectedTagIds([]);
  }, []);

  // Toggle filter mode between AND/OR
  const toggleFilterMode = useCallback(() => {
    setFilterMode(prev => 
      prev === TAG_FILTER_MODES.AND ? TAG_FILTER_MODES.OR : TAG_FILTER_MODES.AND
    );
  }, []);

  // Memoize context value
  const value = useMemo(() => ({
    selectedTagIds,
    filterMode,
    isLoading,
    toggleTag,
    clearTags,
    setSelectedTagIds,
    setFilterMode,
    toggleFilterMode,
    TAG_FILTER_MODES
  }), [selectedTagIds, filterMode, isLoading, toggleTag, clearTags, toggleFilterMode]);

  return (
    <TagFilterContext.Provider value={value}>
      {children}
    </TagFilterContext.Provider>
  );
};

export const useTagFilter = () => {
  const context = useContext(TagFilterContext);
  if (!context) {
    throw new Error('useTagFilter must be used within TagFilterProvider');
  }
  return context;
};

/**
 * Filter trades by tags based on selected tag IDs and filter mode.
 */
export const filterTradesByTags = (trades, selectedTagIds, filterMode) => {
  if (!Array.isArray(trades)) return [];
  
  // No tags selected - return all trades
  if (!selectedTagIds || selectedTagIds.length === 0) {
    return trades;
  }

  return trades.filter((trade) => {
    const tradeTags = trade.tags || [];
    const tradeTagIds = tradeTags.map(tag => tag.id);

    if (filterMode === TAG_FILTER_MODES.AND) {
      // AND mode: trade must have ALL selected tags
      return selectedTagIds.every(tagId => tradeTagIds.includes(tagId));
    } else {
      // OR mode: trade must have at least ONE selected tag
      return selectedTagIds.some(tagId => tradeTagIds.includes(tagId));
    }
  });
};
