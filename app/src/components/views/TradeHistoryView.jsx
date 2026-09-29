import React, { useEffect, useMemo } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFilteredTrades } from '../../hooks/useFilteredTrades';
import { useAuth } from '../../hooks/useAuth';
import { useTagFilter } from '../../context/TagFilterContext';
import { calculateMetrics } from '../../utils/calculations';
import TradeHistoryTable from '../tables/TradeHistoryTable';

const formatCurrency = (value) => {
  const abs = Math.abs(value);
  return `${value < 0 ? '-' : value > 0 ? '+' : ''}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const TradeHistoryView = ({ trades, onToggleTradeForm }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setSelectedTags, setMode, FILTER_MODES } = useTagFilter();
  const filteredTrades = useFilteredTrades(trades);
  const summary = useMemo(() => calculateMetrics(filteredTrades, 0), [filteredTrades]);

  const selectedTagIdsFromState = useMemo(() => {
    if (!location.state || typeof location.state !== 'object') {
      return null;
    }

    return Array.isArray(location.state.selectedTagIds)
      ? location.state.selectedTagIds
      : null;
  }, [location.state]);

  useEffect(() => {
    if (selectedTagIdsFromState && selectedTagIdsFromState.length > 0) {
      setSelectedTags(selectedTagIdsFromState);
      setMode(FILTER_MODES.OR);
    }
  }, [selectedTagIdsFromState, setSelectedTags, setMode, FILTER_MODES]);

  const fromTagsPage = useMemo(() => {
    if (!location.state || typeof location.state !== 'object') {
      return false;
    }

    return location.state.from === '/tags';
  }, [location.state]);

  return (
    <div className="space-y-8 relative h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-start justify-between pt-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          {fromTagsPage && (
            <button
              type="button"
              onClick={() => navigate('/tags')}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-border hover:border-border-accent hover:bg-bg-elevated transition-all"
            >
              <ArrowLeft className="h-4 w-4 text-text-secondary" />
            </button>
          )}
          <div>
            <h1 className="font-display text-display-md text-text-primary mb-2">Trade History</h1>
            <p className="font-mono text-sm text-text-muted">
              Complete record of all your trades
            </p>
          </div>
        </div>
        {isAuthenticated && (
          <button
            onClick={onToggleTradeForm}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Trade
          </button>
        )}
        {!isAuthenticated && (
          <p className="font-mono text-xs text-text-muted">
            Sign in to add trades
          </p>
        )}
      </div>

      {/* Quick Stats */}
      {filteredTrades.length > 0 && (
        <div className="card-luxe px-5 sm:px-6 py-4 flex-shrink-0">
          <div className="flex flex-wrap divide-x divide-border-subtle -mx-2">
            <div className="px-4 sm:px-6 first:pl-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block mb-0.5">Trades</span>
              <span className="font-mono text-sm text-text-primary">{summary.totalTrades}</span>
            </div>
            <div className="px-4 sm:px-6">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block mb-0.5">Win Rate</span>
              <span className="font-mono text-sm text-text-primary">{summary.winRate.toFixed(1)}%</span>
            </div>
            <div className="px-4 sm:px-6 last:pr-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block mb-0.5">Net P&L</span>
              <span className={`font-mono text-sm ${summary.totalProfit >= 0 ? 'text-gold' : 'text-loss'}`}>
                {formatCurrency(summary.totalProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 min-h-0">
        <TradeHistoryTable trades={filteredTrades} title="All Trades" />
      </div>
    </div>
  );
};

export default TradeHistoryView;
