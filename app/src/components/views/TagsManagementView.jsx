import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { useTagManagement } from '../../hooks/useTagManagement';
import { useAuth } from '../../hooks/useAuth';
import { useTagFilter } from '../../context/TagFilterContext';
import TagForm from '../forms/TagForm';
import ConfirmModal from '../ui/ConfirmModal';

const TagsManagementView = () => {
  const { isAuthenticated } = useAuth();
  const { setSelectedTags, setMode, FILTER_MODES } = useTagFilter();
  const navigate = useNavigate();
  const { tags, loading, error, createTag, updateTag, deleteTag } = useTagManagement();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);

  const handleCreateTag = async (tagData) => {
    try {
      await createTag(tagData);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating tag:', err);
    }
  };

  const handleUpdateTag = async (tagData) => {
    try {
      await updateTag(editingTag.id, tagData);
      setEditingTag(null);
    } catch (err) {
      console.error('Error updating tag:', err);
    }
  };

  const handleDeleteTag = async () => {
    try {
      await deleteTag(deletingTag.id);
      setDeletingTag(null);
    } catch (err) {
      console.error('Error deleting tag:', err);
    }
  };

  const handleViewTrades = (tag) => {
    setSelectedTags([tag.id]);
    setMode(FILTER_MODES.OR);
    navigate('/history', {
      state: {
        from: '/tags',
        selectedTagIds: [tag.id]
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="spinner mb-4"></div>
        <p className="font-mono text-sm text-text-secondary">Loading tags...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="font-mono text-sm text-loss">Error loading tags: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between pt-4">
        <div>
          <h1 className="font-display text-display-md text-text-primary mb-2">Tags</h1>
          <p className="font-mono text-sm text-text-muted">Organize and categorize your trades</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Tag
          </button>
        )}
        {!isAuthenticated && (
          <p className="font-mono text-xs text-text-muted">
            Sign in to manage tags
          </p>
        )}
      </div>

      {showCreateForm && (
        <TagForm
          isOpen={true}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateTag}
        />
      )}

      {editingTag && (
        <TagForm
          isOpen={true}
          onClose={() => setEditingTag(null)}
          onSubmit={handleUpdateTag}
          editingTag={editingTag}
        />
      )}

      {tags.length === 0 ? (
        <div className="card-luxe p-12 text-center">
          <p className="font-mono text-sm text-text-muted mb-2">
            {isAuthenticated
              ? "No tags yet. Create your first tag to get started!"
              : "No tags available. Sign in to view your tags."}
          </p>
        </div>
      ) : (
        <div className="card-luxe overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-display text-xl text-text-primary">All Tags</h3>
            <p className="font-mono text-xs text-text-muted mt-0.5">
              {tags.length} tag{tags.length !== 1 ? 's' : ''}, ranked by usage
            </p>
          </div>
          <div className="divide-y divide-border-subtle">
            {[...tags].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0)).map((tag) => {
              const tagColor = tag.color || '#C9A962';

              return (
                <div key={tag.id} className="group flex items-center gap-4 px-6 py-3.5 hover:bg-bg-surface/50 transition-colors">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tagColor, boxShadow: `0 0 8px ${tagColor}40` }}
                  />
                  <button
                    type="button"
                    onClick={() => handleViewTrades(tag)}
                    className="font-mono text-sm text-text-primary hover:text-gold transition-colors text-left min-w-0 truncate flex-1"
                  >
                    {tag.name}
                  </button>
                  <span className="font-mono text-xs text-text-muted flex-shrink-0 w-20 text-right">
                    {tag.usage_count || 0} trade{tag.usage_count !== 1 ? 's' : ''}
                  </span>

                  <div className="flex items-center gap-1 flex-shrink-0 w-[88px] justify-end">
                    {isAuthenticated && (
                      <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTag(tag)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated text-text-muted hover:text-gold transition-all"
                          title="Edit tag"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTag(tag)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated text-text-muted hover:text-loss transition-all"
                          title="Delete tag"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={() => handleViewTrades(tag)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated text-text-muted hover:text-gold transition-all flex-shrink-0"
                      title="View trades"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {deletingTag && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeletingTag(null)}
          onConfirm={handleDeleteTag}
          title="Delete Tag"
          message={`Are you sure you want to delete "${deletingTag.name}"? ${deletingTag.usage_count > 0 ? `This tag is used by ${deletingTag.usage_count} trade(s). Deleting it will remove the tag from all associated trades.` : ''}`}
          confirmText="Delete Tag"
          cancelText="Cancel"
          confirmButtonColor="bg-loss hover:bg-loss/80"
        />
      )}
    </div>
  );
};

export default TagsManagementView;
