import React, { useEffect, useState, useRef } from 'react';
import { Tag, ChevronDown, Search, X } from 'lucide-react';
import { useTagFilter } from '../../context/TagFilterContext';
import { useTagManagement } from '../../hooks/useTagManagement';
import TagBadge from './TagBadge';

const GlobalTagFilter = ({ variant = 'default' }) => {
  const { selectedTagIds, filterMode, setSelectedTags, addTag, removeTag, clearTags, setMode, FILTER_MODES } = useTagFilter();
  const { tags, loading } = useTagManagement();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const isAndMode = filterMode === FILTER_MODES.AND;

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
  const availableTags = tags.filter(
    (tag) =>
      !selectedTagIds.includes(tag.id) &&
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (tags.length > 0 && selectedTagIds.length > 0) {
      const validTagIds = tags.map(tag => tag.id);
      const invalidTagIds = selectedTagIds.filter(id => !validTagIds.includes(id));
      
      if (invalidTagIds.length > 0) {
        const updatedTagIds = selectedTagIds.filter(id => validTagIds.includes(id));
        setSelectedTags(updatedTagIds);
      }
    }
  }, [tags, selectedTagIds, setSelectedTags]);

  const handleTagToggle = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      removeTag(tagId);
    } else {
      addTag(tagId);
    }
  };

  const handleRemoveTag = (tagId) => {
    removeTag(tagId);
  };

  const isNavbarVariant = variant === 'navbar';
  const dropdownPosition = isNavbarVariant 
    ? 'fixed left-4 right-4 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full' 
    : 'absolute right-0';
  const hasSelectedTags = selectedTagIds.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`flex items-center gap-2 rounded-lg transition-all border focus:outline-none focus-ring ${
          isNavbarVariant
            ? 'bg-bg-surface/80 hover:bg-bg-elevated border-border px-3 py-2 backdrop-blur'
            : 'bg-bg-card hover:bg-bg-elevated border-border px-4 py-2'
        } ${hasSelectedTags ? 'border-gold/50' : ''}`}
      >
        <Tag className="h-4 w-4 text-text-muted" />
        <span className={`font-mono text-xs text-text-secondary ${isNavbarVariant ? 'hidden sm:inline' : ''}`}>
          Tags
        </span>
        {hasSelectedTags && (
          <span className={`font-mono text-[10px] font-medium bg-gold text-bg-primary rounded px-1.5 py-0.5 ${isNavbarVariant ? 'hidden sm:inline-block' : ''}`}>
            {selectedTagIds.length}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''} ${isNavbarVariant ? 'hidden sm:block' : ''}`} />
      </button>

      {isOpen && (
        <div className={`${dropdownPosition} mt-2 sm:w-72 bg-bg-card border border-border rounded-xl shadow-luxe-lg z-50 p-4`}>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tags..."
                className="input-luxe pl-9 pr-8 py-2 text-xs"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Mode Toggle */}
          <div className="mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMode(FILTER_MODES.OR)}
                disabled={selectedTagIds.length === 0}
                className={`flex-1 py-1.5 rounded-lg font-mono text-xs transition-all ${
                  !isAndMode 
                    ? 'bg-gold text-bg-primary' 
                    : 'bg-bg-surface text-text-muted hover:text-text-secondary'
                } ${selectedTagIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                OR
              </button>
              <button
                onClick={() => setMode(FILTER_MODES.AND)}
                disabled={selectedTagIds.length === 0}
                className={`flex-1 py-1.5 rounded-lg font-mono text-xs transition-all ${
                  isAndMode 
                    ? 'bg-gold text-bg-primary' 
                    : 'bg-bg-surface text-text-muted hover:text-text-secondary'
                } ${selectedTagIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                AND
              </button>
            </div>
            <p className="font-mono text-[10px] text-text-muted mt-2 text-center">
              {selectedTagIds.length === 0
                ? 'Select tags to filter'
                : isAndMode
                  ? 'Show trades with ALL tags'
                  : 'Show trades with ANY tag'}
            </p>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Selected ({selectedTags.length})
                </span>
                <button
                  type="button"
                  onClick={clearTags}
                  className="font-mono text-[10px] text-gold hover:text-gold-light transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    onRemove={handleRemoveTag}
                    showRemove={true}
                    size="small"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Available Tags */}
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-2 block">
              {selectedTags.length > 0 ? 'Available' : 'Tags'}
            </span>
            {loading ? (
              <div className="py-3 text-center">
                <div className="spinner mx-auto"></div>
              </div>
            ) : availableTags.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-bg-elevated transition-colors"
                  >
                    <TagBadge tag={tag} size="small" />
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <p className="font-mono text-xs text-text-muted py-2">No tags found</p>
            ) : tags.length === 0 ? (
              <div className="py-2">
                <p className="font-mono text-xs text-text-muted mb-2">No tags available</p>
                <a
                  href="/tags"
                  className="font-mono text-xs text-gold hover:text-gold-light transition-colors"
                >
                  Create your first tag →
                </a>
              </div>
            ) : (
              <p className="font-mono text-xs text-text-muted py-2">All tags selected</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalTagFilter;
