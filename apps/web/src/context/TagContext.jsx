import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from './DemoModeContext';

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
  const { isDemoMode, demoAuthUserId } = useDemoMode();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTags = useCallback(async () => {
    // Determine which user ID to use for fetching tags
    const targetUserId = user?.id || (isDemoMode && demoAuthUserId ? demoAuthUserId : null);

    try {
      setLoading(true);
      let query = supabase
        .from('tags')
        .select('*, trade_tags(id)')
        .order('name', { ascending: true });

      // Filter by user_id if we have a target user (authenticated or demo)
      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
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

      // Only update state if tags actually changed
      setTags(prevTags => {
        // Check if IDs changed (tags added/removed)
        const prevTagIds = prevTags.map(t => t.id).sort().join(',');
        const newTagIds = tagsWithUsage.map(t => t.id).sort().join(',');
        if (prevTagIds !== newTagIds || prevTags.length !== tagsWithUsage.length) {
          return tagsWithUsage; // IDs changed, definitely update
        }

        // IDs are the same, check if any tag properties changed
        const tagsChanged = prevTags.some(prevTag => {
          const newTag = tagsWithUsage.find(t => t.id === prevTag.id);
          if (!newTag) return true; // Tag not found, changed

          // Compare relevant properties
          return (
            prevTag.name !== newTag.name ||
            prevTag.color !== newTag.color ||
            prevTag.usage_count !== newTag.usage_count
          );
        });

        if (tagsChanged) {
          return tagsWithUsage; // Properties changed, update state
        }

        return prevTags; // No changes detected, return previous state
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tags:', err);
      // Set empty tags on error to prevent UI from breaking
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isDemoMode, demoAuthUserId]);

  // Fetch tags when component mounts or user ID changes
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(async (tagData) => {
    if (!user?.id) return null;

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
  }, [user?.id, fetchTags]);

  const updateTag = useCallback(async (tagId, tagData) => {
    if (!user?.id) return null;

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
  }, [user?.id, fetchTags]);

  const deleteTag = useCallback(async (tagId) => {
    if (!user?.id) return;

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
  }, [user?.id, fetchTags]);

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

