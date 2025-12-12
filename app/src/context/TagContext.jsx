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

