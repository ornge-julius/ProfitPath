import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTagManagement } from '../../hooks/useTagManagement';
import { useAuth } from '../../hooks/useAuth';
import { useTagFilter } from '../../context/TagFilterContext';
import TagForm from '../forms/TagForm';
import TagCard from '../ui/TagCard';
import ConfirmModal from '../ui/ConfirmModal';
import AnimatedContent from '../ui/animation/AnimatedContent';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...tags].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0)).map((tag, index) => (
            <AnimatedContent 
              key={tag.id} 
              ease="back.out"
              scale={0.95}
              duration={0.4}
              delay={index * 0.05}
              distance={0}
              immediate={true}
            >
              <TagCard
                tag={tag}
                onEdit={isAuthenticated ? () => setEditingTag(tag) : undefined}
                onDelete={isAuthenticated ? () => setDeletingTag(tag) : undefined}
                onViewTrades={handleViewTrades}
                canEdit={isAuthenticated}
              />
            </AnimatedContent>
          ))}
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
