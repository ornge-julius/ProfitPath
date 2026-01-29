import React from 'react';
import { ArrowLeft, Edit, TrendingUp, TrendingDown } from 'lucide-react';
import { calculateTradeDuration, calculateReturnPercentage, getResultText, isWin, getTradeTypeText, formatDate } from '../../utils/calculations';
import TradeForm from '../forms/TradeForm';
import TagBadge from './TagBadge';

const TradeDetailView = ({
  trade,
  onBack,
  onEdit,
  isEditing,
  onSubmit,
  onCancelEdit,
  onDelete,
  isAuthenticated
}) => {
  if (!trade) return null;

  const duration = calculateTradeDuration(trade.entry_date, trade.exit_date);
  const returnPercentage = calculateReturnPercentage(trade.entry_price, trade.exit_price);
  const formattedEntryDate = formatDate(trade.entry_date);
  const formattedExitDate = formatDate(trade.exit_date);
  const isProfit = trade.profit >= 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-sm text-gold hover:text-gold-light transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-display-lg text-text-primary mb-2">
              {trade.symbol}
            </h1>
            <p className="font-mono text-sm text-text-muted">
              {trade.option || 'Stock Trade'} · {formattedEntryDate}
            </p>
          </div>
          {!isEditing && isAuthenticated && (
            <button
              onClick={() => onEdit(trade)}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Trade Form - Only show when editing */}
      {isEditing && (
        <TradeForm
          isOpen={true}
          onClose={onCancelEdit}
          onSubmit={onSubmit}
          editingTrade={trade}
          onCancel={onCancelEdit}
          onDelete={onDelete}
        />
      )}

      {/* Trade Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-luxe p-5">
          <span className="stat-label mb-2 block">P&L</span>
          <p className={`font-display text-2xl ${isProfit ? 'text-gold' : 'text-loss'}`}>
            {isProfit ? '+' : ''}${trade.profit.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {isProfit ? (
              <TrendingUp className="w-3 h-3 text-gold" />
            ) : (
              <TrendingDown className="w-3 h-3 text-loss" />
            )}
            <span className={`font-mono text-xs ${isProfit ? 'text-gold' : 'text-loss'}`}>
              {returnPercentage.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="card-luxe p-5">
          <span className="stat-label mb-2 block">Position</span>
          <p className="font-display text-2xl text-text-primary">
            {getTradeTypeText(trade.position_type)}
          </p>
          <span className="font-mono text-xs text-text-muted mt-2 block">
            {trade.quantity} contracts
          </span>
        </div>

        <div className="card-luxe p-5">
          <span className="stat-label mb-2 block">Duration</span>
          <p className="font-display text-2xl text-text-primary">
            {duration}<span className="text-text-muted text-lg">d</span>
          </p>
          <span className="font-mono text-xs text-text-muted mt-2 block">
            Hold time
          </span>
        </div>

        <div className="card-luxe p-5">
          <span className="stat-label mb-2 block">Result</span>
          {trade.result !== undefined ? (
            <>
              <p className={`font-display text-2xl ${isWin(trade.result) ? 'text-gold' : 'text-loss'}`}>
                {getResultText(trade.result)}
              </p>
              <span className={`badge mt-2 ${isWin(trade.result) ? 'badge-win' : 'badge-loss'}`}>
                {isWin(trade.result) ? 'Profitable' : 'Loss'}
              </span>
            </>
          ) : (
            <p className="font-mono text-sm text-text-muted">Not set</p>
          )}
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trade Details */}
        <div className="card-luxe p-6">
          <h3 className="font-display text-xl text-text-primary mb-6">Trade Details</h3>
          <div className="space-y-0">
            <div className="flex justify-between py-3 border-b border-border-subtle">
              <span className="font-mono text-xs text-text-muted uppercase tracking-wide">Entry Price</span>
              <span className="font-mono text-sm text-text-primary">${trade.entry_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border-subtle">
              <span className="font-mono text-xs text-text-muted uppercase tracking-wide">Exit Price</span>
              <span className="font-mono text-sm text-text-primary">${trade.exit_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border-subtle">
              <span className="font-mono text-xs text-text-muted uppercase tracking-wide">Quantity</span>
              <span className="font-mono text-sm text-text-primary">{trade.quantity}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border-subtle">
              <span className="font-mono text-xs text-text-muted uppercase tracking-wide">Entry Date</span>
              <span className="font-mono text-sm text-text-primary">{formattedEntryDate}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border-subtle">
              <span className="font-mono text-xs text-text-muted uppercase tracking-wide">Exit Date</span>
              <span className="font-mono text-sm text-text-primary">{formattedExitDate}</span>
            </div>
            {trade.source && (
              <div className="flex justify-between py-3 border-b border-border-subtle">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wide">Source</span>
                <span className="font-mono text-sm text-gold">{trade.source}</span>
              </div>
            )}
            <div className="py-3">
              <span className="font-mono text-xs text-text-muted uppercase tracking-wide block mb-3">Tags</span>
              <div className="flex flex-wrap gap-2">
                {trade.tags && trade.tags.length > 0 ? (
                  trade.tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))
                ) : (
                  <span className="font-mono text-xs text-text-muted">No tags assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="card-luxe p-6">
          <h3 className="font-display text-xl text-text-primary mb-6">Analysis</h3>
          <div className="space-y-6">
            {trade.reasoning && (
              <div>
                <h4 className="font-mono text-xs text-text-muted uppercase tracking-wide mb-3">
                  Entry Reason
                </h4>
                <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
                  <p className="font-mono text-sm text-text-secondary leading-relaxed">{trade.reasoning}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-mono text-xs text-text-muted uppercase tracking-wide mb-3">
                Performance
              </h4>
              <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle space-y-3">
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-text-muted">Return</span>
                  <span className={`font-mono text-sm font-medium ${returnPercentage >= 0 ? 'text-gold' : 'text-loss'}`}>
                    {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-text-muted">Net P&L</span>
                  <span className={`font-mono text-sm font-medium ${trade.profit >= 0 ? 'text-gold' : 'text-loss'}`}>
                    {trade.profit >= 0 ? '+' : ''}${trade.profit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extended Notes Section */}
      {trade.notes && (
        <div className="card-luxe p-6">
          <h3 className="font-display text-xl text-text-primary mb-4">Notes</h3>
          <div className="bg-bg-surface rounded-lg p-6 border border-border-subtle">
            <p className="font-mono text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
              {trade.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeDetailView;
