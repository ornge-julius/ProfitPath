import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';
import { getResultNumber, getTradeTypeNumber, formatDateForInput } from '../../utils/calculations';
import ConfirmModal from '../ui/ConfirmModal';
import { useTagManagement } from '../../hooks/useTagManagement';
import TagSelector from '../ui/TagSelector';
import { useAuth } from '../../hooks/useAuth';

// Module-level storage to persist form data across component remounts
let persistedFormData = null;
let persistedTagIds = null;

const TradeForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingTrade, 
  onCancel,
  onDelete 
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState(() => {
    if (editingTrade) {
      const {
        tags: tradeTags,
        profit,
        account_id,
        user_id,
        trade_tags,
        ...tradeFields
      } = editingTrade;
      
      return {
        ...tradeFields,
        entry_price: editingTrade.entry_price.toString(),
        exit_price: editingTrade.exit_price.toString(),
        quantity: editingTrade.quantity.toString(),
        entry_date: formatDateForInput(editingTrade.entry_date),
        exit_date: formatDateForInput(editingTrade.exit_date)
      };
    }
    if (persistedFormData) {
      return persistedFormData;
    }
    return {
      symbol: '',
      position_type: getTradeTypeNumber('CALL'),
      entry_price: '',
      exit_price: '',
      quantity: '',
      entry_date: '',
      exit_date: '',
      notes: '',
      reasoning: '',
      result: getResultNumber('WIN'),
      option: '',
      source: ''
    };
  });
  
  const [selectedTagIds, setSelectedTagIds] = useState(() => {
    if (editingTrade) {
      return (editingTrade.tags || []).map((tag) => tag.id);
    }
    if (persistedTagIds) {
      return persistedTagIds;
    }
    return [];
  });
  
  const { tags, loading: tagsLoading } = useTagManagement();
  const { user } = useAuth();
  const prevEditingTradeRef = useRef(editingTrade);
  const prevUserIdRef = useRef(user?.id);
  
  useEffect(() => {
    const currentUserId = user?.id;
    const prevUserId = prevUserIdRef.current;
    
    if (prevUserId !== undefined && prevUserId !== currentUserId) {
      persistedFormData = null;
      persistedTagIds = null;
      if (!editingTrade) {
        setFormData({
          symbol: '',
          position_type: getTradeTypeNumber('CALL'),
          entry_price: '',
          exit_price: '',
          quantity: '',
          entry_date: '',
          exit_date: '',
          notes: '',
          reasoning: '',
          result: getResultNumber('WIN'),
          option: '',
          source: ''
        });
        setSelectedTagIds([]);
      }
    }
    
    prevUserIdRef.current = currentUserId;
  }, [user?.id, editingTrade]);
  
  useEffect(() => {
    if (!editingTrade) {
      persistedFormData = formData;
      persistedTagIds = selectedTagIds;
    }
  }, [formData, selectedTagIds, editingTrade]);

  useEffect(() => {
    const editingTradeChanged = prevEditingTradeRef.current !== editingTrade;
    
    if (!editingTradeChanged) {
      return;
    }
    
    if (editingTrade) {
      const {
        tags: tradeTags,
        profit,
        account_id,
        user_id,
        trade_tags,
        ...tradeFields
      } = editingTrade;

      setFormData({
        ...tradeFields,
        entry_price: editingTrade.entry_price.toString(),
        exit_price: editingTrade.exit_price.toString(),
        quantity: editingTrade.quantity.toString(),
        entry_date: formatDateForInput(editingTrade.entry_date),
        exit_date: formatDateForInput(editingTrade.exit_date)
      });
      setSelectedTagIds((tradeTags || []).map((tag) => tag.id));
    } else if (prevEditingTradeRef.current !== null) {
      setFormData({
        symbol: '',
        position_type: getTradeTypeNumber('CALL'),
        entry_price: '',
        exit_price: '',
        quantity: '',
        entry_date: '',
        exit_date: '',
        notes: '',
        reasoning: '',
        result: getResultNumber('WIN'),
        option: '',
        source: ''
      });
      
      setSelectedTagIds([]);
      persistedFormData = null;
      persistedTagIds = null;
    }

    prevEditingTradeRef.current = editingTrade;
  }, [editingTrade]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      const result = await onSubmit({
        ...formData,
        tagIds: selectedTagIds
      });
      if (result && !editingTrade) {
        const emptyFormData = {
          symbol: '',
          position_type: getTradeTypeNumber('CALL'),
          entry_price: '',
          exit_price: '',
          quantity: '',
          entry_date: '',
          exit_date: '',
          notes: '',
          reasoning: '',
          result: getResultNumber('WIN'),
          option: '',
          source: ''
        };
        setFormData(emptyFormData);
        setSelectedTagIds([]);
        persistedFormData = emptyFormData;
        persistedTagIds = [];
      }
    } catch (err) {
      console.error('Error submitting trade:', err);
    }
  };

  const handleCancel = () => {
    if (editingTrade) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <div className={isOpen ? 'block' : 'hidden'}>
      <div className="mt-32 max-w-6xl mx-auto px-6 sm:px-8">
        <div className="card-luxe p-6 mb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-2xl text-text-primary">
                {editingTrade ? 'Edit Trade' : 'New Trade'}
              </h3>
              <p className="font-mono text-xs text-text-muted mt-1">
                {editingTrade ? 'Update your trade details' : 'Record a new trading position'}
              </p>
            </div>
            <button 
              onClick={handleCancel}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-border hover:border-border-accent hover:bg-bg-elevated transition-all"
            >
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Symbol */}
              <div>
                <label className="label-luxe">Symbol</label>
                <input
                  type="text"
                  placeholder="e.g., AAPL"
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                  className="input-luxe"
                  required
                />
              </div>
              
              {/* Position Type */}
              <div>
                <label className="label-luxe">Position Type</label>
                <select
                  value={formData.position_type}
                  onChange={(e) => setFormData({...formData, position_type: parseInt(e.target.value)})}
                  className="input-luxe"
                >
                  <option value={getTradeTypeNumber('CALL')}>CALL</option>
                  <option value={getTradeTypeNumber('PUT')}>PUT</option>
                </select>
              </div>
              
              {/* Option Contract */}
              <div>
                <label className="label-luxe">Option Contract</label>
                <input
                  type="text"
                  placeholder="e.g., AAPL 08/18 $150 Call"
                  value={formData.option}
                  onChange={(e) => setFormData({...formData, option: e.target.value})}
                  className="input-luxe"
                />
              </div>
              
              {/* Entry Price */}
              <div>
                <label className="label-luxe">Entry Price</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.entry_price}
                  onChange={(e) => setFormData({...formData, entry_price: e.target.value})}
                  className="input-luxe"
                  required
                />
              </div>
              
              {/* Exit Price */}
              <div>
                <label className="label-luxe">Exit Price</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.exit_price}
                  onChange={(e) => setFormData({...formData, exit_price: e.target.value})}
                  className="input-luxe"
                  required
                />
              </div>
              
              {/* Quantity */}
              <div>
                <label className="label-luxe">Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="input-luxe"
                  required
                />
              </div>
              
              {/* Entry Date */}
              <div>
                <label className="label-luxe">Entry Date</label>
                <input
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
                  className="input-luxe"
                  required
                />
              </div>
              
              {/* Exit Date */}
              <div>
                <label className="label-luxe">Exit Date</label>
                <input
                  type="date"
                  value={formData.exit_date}
                  onChange={(e) => setFormData({...formData, exit_date: e.target.value})}
                  className="input-luxe"
                  required
                />
              </div>
              
              {/* Source */}
              <div>
                <label className="label-luxe">Source</label>
                <input
                  type="text"
                  placeholder="e.g., TradingView, Discord"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="input-luxe"
                />
              </div>
              
              {/* Reason for Trade */}
              <div className="md:col-span-2">
                <label className="label-luxe">Reason for Trade</label>
                <input
                  type="text"
                  placeholder="Why did you enter this trade?"
                  value={formData.reasoning}
                  onChange={(e) => setFormData({...formData, reasoning: e.target.value})}
                  className="input-luxe"
                  required
                />
              </div>
              
              {/* Trade Result */}
              <div>
                <label className="label-luxe">Trade Result</label>
                <select
                  value={formData.result}
                  onChange={(e) => setFormData({...formData, result: parseInt(e.target.value)})}
                  className="input-luxe"
                >
                  <option value="">Select result</option>
                  <option value={1}>WIN</option>
                  <option value={0}>LOSS</option>
                </select>
              </div>
              
              {/* Tags */}
              <div className="md:col-span-3">
                <TagSelector
                  tags={tags}
                  selectedTagIds={selectedTagIds}
                  onChange={setSelectedTagIds}
                  disabled={tagsLoading}
                  loading={tagsLoading}
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-3">
                <label className="label-luxe">Additional Notes</label>
                <textarea
                  placeholder="Any additional thoughts or observations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input-luxe h-24 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 md:col-span-3 pt-2">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingTrade ? 'Update Trade' : 'Add Trade'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                {editingTrade && onDelete && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-3 rounded-lg border border-loss/50 text-loss hover:bg-loss-bg hover:border-loss transition-all font-mono text-sm font-medium flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </form>
          
          {/* Delete Confirmation Modal */}
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={async () => {
              if (onDelete && editingTrade) {
                await onDelete(editingTrade.id);
                setShowDeleteModal(false);
              }
            }}
            title="Delete Trade"
            message={`Are you sure you want to delete this trade? This action cannot be undone.`}
            confirmText="Delete Trade"
            cancelText="Cancel"
            confirmButtonColor="bg-loss hover:bg-loss/80"
          />
        </div>
      </div>
    </div>
  );
};

export default TradeForm;
