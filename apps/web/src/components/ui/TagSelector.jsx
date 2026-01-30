import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import TagBadge from './TagBadge';

const TagSelector = ({
  tags = [],
  selectedTagIds = [],
  onChange,
  disabled = false,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  const handleTagToggle = (tagId) => {
    if (!onChange) return;

    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleRemoveTag = (tagId) => {
    if (!onChange) return;
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleToggleDropdown = () => {
    if (disabled || loading) {
      return;
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="label-luxe">
        Tags
      </label>

      <div
        onClick={handleToggleDropdown}
        className={`w-full min-h-[48px] bg-bg-surface border border-border rounded-lg px-3 py-2 flex flex-wrap items-center gap-2 cursor-pointer transition-all hover:border-border-accent ${
          disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
        } ${isOpen ? 'border-gold' : ''}`}
        role="button"
        tabIndex={0}
      >
        {loading ? (
          <span className="font-mono text-sm text-text-muted">Loading tags...</span>
        ) : selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onRemove={handleRemoveTag}
              showRemove={!disabled}
              size="small"
            />
          ))
        ) : (
          <span className="font-mono text-sm text-text-muted">
            {tags.length === 0 ? 'No tags available' : 'Select tags...'}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 ml-auto text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && !disabled && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-bg-card border border-border rounded-lg shadow-luxe-lg max-h-60 overflow-auto">
          <div className="p-3 border-b border-border">
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
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-2">
            {availableTags.length > 0 ? (
              availableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-elevated transition-colors flex items-center gap-2"
                >
                  <TagBadge tag={tag} size="small" />
                </button>
              ))
            ) : (
              <div className="px-3 py-2 font-mono text-xs text-text-muted">
                {searchQuery ? 'No tags found' : 'No available tags'}
              </div>
            )}
          </div>

          {tags.length === 0 && (
            <div className="p-2 border-t border-border">
              <a
                href="/tags"
                className="block px-3 py-2 font-mono text-xs text-gold hover:text-gold-light hover:bg-bg-elevated rounded-lg transition-colors"
              >
                Create your first tag →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
