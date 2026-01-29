import React from 'react';
import { Edit2, Trash2, ArrowRight } from 'lucide-react';

const TagCard = ({ tag, onEdit, onDelete, onViewTrades, canEdit = true }) => {
  const tagColor = tag.color || '#C9A962';

  return (
    <div className="card-luxe p-5 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-bg-card"
            style={{ backgroundColor: tagColor, boxShadow: `0 0 12px ${tagColor}40` }}
          />
          <button
            type="button"
            onClick={onViewTrades ? () => onViewTrades(tag) : undefined}
            className="font-display text-lg text-text-primary hover:text-gold transition-colors"
            title={onViewTrades ? 'View trades with this tag' : undefined}
          >
            {tag.name}
          </button>
        </div>
        {canEdit && (onEdit || onDelete) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={onEdit}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated text-text-muted hover:text-gold transition-all"
                title="Edit tag"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated text-text-muted hover:text-loss transition-all"
                title="Delete tag"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-text-muted">
          {tag.usage_count || 0} trade{tag.usage_count !== 1 ? 's' : ''}
        </span>
        {onViewTrades && (
          <button
            onClick={() => onViewTrades(tag)}
            className="font-mono text-xs text-gold hover:text-gold-light flex items-center gap-1 transition-colors"
          >
            View <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TagCard;
