import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { getResultNumber, getTradeTypeNumber } from '../../utils/calculations';
import ConfirmModal from '../ui/ConfirmModal';
import { useTagManagement } from '../../hooks/useTagManagement';
import TagSelector from '../ui/TagSelector';

const TradeForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingTrade, 
  onCancel,
  onDelete 
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
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
  });
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const { tags, loading: tagsLoading } = useTagManagement();

  useEffect(() => {
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
        quantity: editingTrade.quantity.toString()
      });
      setSelectedTagIds((tradeTags || []).map((tag) => tag.id));
    } else {
      setFormData({
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
      });
      setSelectedTagIds([]);
    }
  }, [editingTrade]);

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

  if (!isOpen) return null;

  return (
    <div className="mt-32 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="gradient-border glass-panel rounded-3xl p-6 sm:p-8 mb-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="badge-pill mb-3">Journal with intention</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {editingTrade ? 'Edit Trade' : 'Add New Trade'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Softer surfaces, clearer guidance. Everything you need to log a trade with confidence.</p>
          </div>
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
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Symbol</label>
              <input
                type="text"
                placeholder="e.g., AAPL"
                value={formData.symbol}
                onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                className="w-full bg-white/80 dark:bg-slate-800/60 border border-gray-200/70 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Position Type</label>
              <select
                value={formData.position_type}
                onChange={(e) => setFormData({...formData, position_type: parseInt(e.target.value)})}
                className="w-full bg-white/80 dark:bg-slate-800/60 border border-gray-200/70 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value={getTradeTypeNumber('CALL')}>CALL</option>
                <option value={getTradeTypeNumber('PUT')}>PUT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Option Contract</label>
              <input
                type="text"
                placeholder="e.g., AAPL 08/18 $150 Call"
                value={formData.option}
                onChange={(e) => setFormData({...formData, option: e.target.value})}
                className="w-full bg-white/80 dark:bg-slate-800/60 border border-gray-200/70 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Entry Price</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.entry_price}
                onChange={(e) => setFormData({...formData, entry_price: e.target.value})}
                className="w-full bg-white/80 dark:bg-slate-800/60 border border-gray-200/70 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Exit Price</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.exit_price}
                onChange={(e) => setFormData({...formData, exit_price: e.target.value})}
                className="w-full bg-white/80 dark:bg-slate-800/60 border border-gray-200/70 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Quantity</label>
              <input
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full bg-white/80 dark:bg-slate-800/60 border border-gray-200/70 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Entry Date</label>
              <input
                type="date"
                value={formData.entry_date}
                onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
                className="w-full bg-white/80 dark:bg-slate-800/60 border border-gray-200/70 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>
          
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Exit Date</label>
              <input
                type="date"
                value={formData.exit_date}
                onChange={(e) => setFormData({...formData, exit_date: e.target.value})}
                className="w-full bg-white/80 dark:bg-slate-800/60 border border-gray-200/70 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Source</label>
              <input
                type="text"
                placeholder="e.g., TradingView, Discord"
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                className="w-full bg-white/80 dark:bg-slate-800/60 border border-gray-200/70 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Reason for Trade</label>
              <input
                type="text"
                placeholder="Why did you enter this trade?"
                value={formData.reasoning}
                onChange={(e) => setFormData({...formData, reasoning: e.target.value})}
                className="w-full bg-white/80 dark:bg-slate-800/60 border border-gray-200/70 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Trade Result</label>
              <select
                value={formData.result}
                onChange={(e) => setFormData({...formData, result: parseInt(e.target.value)})}
                className="w-full bg-white/80 dark:bg-slate-800/60 border border-gray-200/70 dark:border-white/10 rounded-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Additional Notes</label>
              <textarea
                placeholder="Any additional thoughts or observations..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-white/80 dark:bg-slate-800/60 border border-gray-200/70 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 h-24 resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:col-span-3 mt-2">
              <button
                type="submit"
                className="button-primary px-6 py-3 rounded-xl font-semibold transition-colors flex-1 text-white"
              >
                {editingTrade ? 'Update Trade' : 'Add Trade'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="button-ghost px-4 py-3 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              {editingTrade && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
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
  );
};

export default TradeForm;
