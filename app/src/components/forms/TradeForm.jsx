import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';
import { getResultNumber, getTradeTypeNumber, formatDateForInput } from '../../utils/calculations';
import ConfirmModal from '../ui/ConfirmModal';
import { useTagManagement } from '../../hooks/useTagManagement';
import TagSelector from '../ui/TagSelector';

// Module-level storage to persist form data across component remounts
// This is more appropriate than localStorage as it's in-memory and session-scoped
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
  
  // Initialize form data from persisted data if available, otherwise use defaults
  const [formData, setFormData] = useState(() => {
    if (persistedFormData && !editingTrade) {
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
      reasoning: '',  // changed from reason to reasoning
      result: getResultNumber('WIN'),
      option: '',
      source: ''
    };
  });
  
  const [selectedTagIds, setSelectedTagIds] = useState(() => {
    if (persistedTagIds && !editingTrade) {
      return persistedTagIds;
    }
    return [];
  });
  
  const { tags, loading: tagsLoading } = useTagManagement();
  // Track previous editingTrade to detect intentional mode switches
  const prevEditingTradeRef = useRef(editingTrade);
  
  // Persist form data whenever it changes (only for new trades, not edits)
  useEffect(() => {
    if (!editingTrade) {
      persistedFormData = formData;
      persistedTagIds = selectedTagIds;
    }
  }, [formData, selectedTagIds, editingTrade]);

  // Only reset form when intentionally switching modes, not on every render
  useEffect(() => {
    // Only run when editingTrade actually changed
    const editingTradeChanged = prevEditingTradeRef.current !== editingTrade;
    
    // Don't do anything if editingTrade hasn't changed
    if (!editingTradeChanged) {
      return;
    }
    
    if (editingTrade) {
      // We're editing a trade - load the trade data
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
      // We're switching FROM editing mode TO new trade mode
      // Always reset the form in this case - the data came from the edited trade, not user input
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
      
      // Clear persisted data to prevent edited trade data from persisting
      persistedFormData = null;
      persistedTagIds = null;
    }
    // Note: We intentionally do NOT reset the form when:
    // - User switches tabs/windows (editingTrade hasn't changed)
    // - Form already has user-entered data (we preserve it)
    // - Component remounts (formData persists in React state as long as component stays mounted)

    // Update ref
    prevEditingTradeRef.current = editingTrade;
  }, [editingTrade]); // Only depend on editingTrade to prevent unnecessary runs

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use browser validation for required fields
    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      await onSubmit({
        ...formData,
        tagIds: selectedTagIds
      });
      // Reset form after successful submission
      if (!editingTrade) {
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
        // Clear persisted data
        persistedFormData = emptyFormData;
        persistedTagIds = [];
      }
    } catch (err) {
      // Error handling
    }
  };

  const handleCancel = () => {
    if (editingTrade) {
      onCancel();
    } else {
      onClose();
    }
  };

  // Keep component mounted but hidden to preserve state when closed
  return (
    <div className={isOpen ? 'block' : 'hidden'}>
      <div className="mt-32 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
          {editingTrade ? 'Edit Trade' : 'Add New Trade'}
        </h3>
        <button 
          onClick={handleCancel}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Symbol</label>
            <input
              type="text"
              placeholder="e.g., AAPL"
              value={formData.symbol}
              onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position Type</label>
            <select
              value={formData.position_type}
              onChange={(e) => setFormData({...formData, position_type: parseInt(e.target.value)})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={getTradeTypeNumber('CALL')}>CALL</option>
              <option value={getTradeTypeNumber('PUT')}>PUT</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Option Contract</label>
            <input
              type="text"
              placeholder="e.g., AAPL 08/18 $150 Call"
              value={formData.option}
              onChange={(e) => setFormData({...formData, option: e.target.value})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entry Price</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.entry_price}
              onChange={(e) => setFormData({...formData, entry_price: e.target.value})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exit Price</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.exit_price}
              onChange={(e) => setFormData({...formData, exit_price: e.target.value})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
            <input
              type="number"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entry Date</label>
            <input
              type="date"
              value={formData.entry_date}
              onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exit Date</label>
            <input
              type="date"
              value={formData.exit_date}
              onChange={(e) => setFormData({...formData, exit_date: e.target.value})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
            <input
              type="text"
              placeholder="e.g., TradingView, Discord"
              value={formData.source}
              onChange={(e) => setFormData({...formData, source: e.target.value})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Trade</label>
            <input
              type="text"
              placeholder="Why did you enter this trade?"
              value={formData.reasoning}
              onChange={(e) => setFormData({...formData, reasoning: e.target.value})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trade Result</label>
            <select
              value={formData.result}
              onChange={(e) => setFormData({...formData, result: parseInt(e.target.value)})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select result</option>
              <option value={1}>WIN</option>
              <option value={0}>LOSS</option>
            </select>
          </div>
          
          <div className="md:col-span-3">
            <TagSelector
              tags={tags}
              selectedTagIds={selectedTagIds}
              onChange={setSelectedTagIds}
              disabled={tagsLoading}
              loading={tagsLoading}
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Notes</label>
            <textarea
              placeholder="Any additional thoughts or observations..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
          </div>

          <div className="flex gap-2 md:col-span-3">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg font-medium transition-colors flex-1 text-white"
            >
              {editingTrade ? 'Update Trade' : 'Add Trade'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 px-4 py-3 rounded-lg font-medium transition-colors text-gray-900 dark:text-white"
            >
              Cancel
            </button>
            {editingTrade && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-white"
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
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />
      </div>
      </div>
    </div>
  );
};

export default TradeForm;
