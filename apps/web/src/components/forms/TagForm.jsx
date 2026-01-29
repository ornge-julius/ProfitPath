import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TagForm = ({ isOpen, onClose, onSubmit, editingTag }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTag) {
      setFormData({
        name: editingTag.name || '',
        color: editingTag.color || ''
      });
    } else {
      setFormData({ name: '', color: '' });
    }
    setErrors({});
  }, [editingTag, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Tag name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({ name: '', color: '' });
      setErrors({});
    } catch (err) {
      if (err.message.includes('unique') || err.message.includes('duplicate')) {
        setErrors({ name: 'A tag with this name already exists' });
      } else {
        setErrors({ name: 'An error occurred. Please try again.' });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="card-luxe p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl text-text-primary">
            {editingTag ? 'Edit Tag' : 'Create Tag'}
          </h3>
          <p className="font-mono text-xs text-text-muted mt-1">
            {editingTag ? 'Update tag details' : 'Add a new tag to organize trades'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated transition-colors"
        >
          <X className="h-4 w-4 text-text-muted" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label className="label-luxe">
              Tag Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              className={`input-luxe ${errors.name ? 'border-loss focus:border-loss' : ''}`}
              placeholder="e.g., Options, Swing Trade, Day Trade"
              required
            />
            {errors.name && (
              <p className="mt-2 font-mono text-xs text-loss">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="label-luxe">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color || '#C9A962'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-12 bg-bg-surface border border-border rounded-lg cursor-pointer"
              />
              <span className="font-mono text-xs text-text-muted">
                {formData.color || '#C9A962'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {editingTag ? 'Update Tag' : 'Create Tag'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TagForm;
