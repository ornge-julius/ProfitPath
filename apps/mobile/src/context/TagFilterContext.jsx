import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSupabase, useAuth } from '@profitpath/shared';
import { storageJson } from '../utils/storage';

const STORAGE_KEY = 'profitpath_tag_filter';

// Filter mode constants
export const TAG_FILTER_MODES = {
  AND: 'AND',
  OR: 'OR'
};

// Alias for consistency
export const FILTER_MODES = TAG_FILTER_MODES;

const TagFilterContext = createContext(null);

export const TagFilterProvider = ({ children }) => {
  const supabase = useSupabase();
  const { user, isAuthenticated } = useAuth();
  
  // Initialize with default values so consumers always have usable data
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [filterMode, setFilterMode] = useState(TAG_FILTER_MODES.OR);
  const [allTags, setAllTags] = useState([]);
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

  // Fetch all tags for the user
  useEffect(() => {
    if (!user?.id || !isAuthenticated) {
      setAllTags([]);
      return;
    }

    const fetchTags = async () => {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .eq('auth_user_id', user.id)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching tags:', error);
          return;
        }

        if (data) {
          setAllTags(data.map(tag => ({
            id: tag.id,
            name: tag.name,
            color: tag.color || '#10B981',
          })));
        }
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };

    fetchTags();
  }, [user?.id, isAuthenticated, supabase]);

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

  // Select all tags
  const selectAllTags = useCallback(() => {
    setSelectedTagIds(allTags.map(tag => tag.id));
  }, [allTags]);

  // Memoize context value
  const value = useMemo(() => ({
    selectedTagIds,
    filterMode,
    allTags,
    isLoading,
    toggleTag,
    clearTags,
    selectAllTags,
    setSelectedTagIds,
    setFilterMode,
    toggleFilterMode,
    TAG_FILTER_MODES,
    FILTER_MODES
  }), [selectedTagIds, filterMode, allTags, isLoading, toggleTag, clearTags, selectAllTags, toggleFilterMode]);

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
