import React from 'react';
import { X } from 'lucide-react';

const sizeClasses = {
  small: 'text-[10px] px-2 py-0.5',
  default: 'text-xs px-2.5 py-1',
  large: 'text-sm px-3 py-1.5'
};

const TagBadge = ({ tag, onRemove, showRemove = false, size = 'default', className = '' }) => {
  if (!tag) {
    return null;
  }

  const tagColor = tag.color || '#C9A962';
  const appliedSize = sizeClasses[size] || sizeClasses.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono font-medium border transition-all ${appliedSize} ${
        showRemove 
          ? 'bg-bg-elevated border-border hover:border-border-accent cursor-pointer text-text-secondary' 
          : 'border-transparent'
      } ${className}`.trim()}
      style={!showRemove ? { 
        backgroundColor: `${tagColor}15`, 
        color: tagColor,
        borderColor: `${tagColor}30`
      } : {}}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: tagColor }}
      />
      <span className="truncate max-w-[5rem]">{tag.name}</span>
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(tag.id);
          }}
          className="ml-0.5 hover:bg-bg-card rounded p-0.5 transition-colors"
          aria-label={`Remove tag ${tag.name}`}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
};

export default TagBadge;
