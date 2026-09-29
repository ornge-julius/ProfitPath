import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatDate, getTradeTypeText } from '../../utils/calculations';
import TagBadge from './TagBadge';

const RecentTradesList = ({ trades = [], limit = 6 }) => {
  const location = useLocation();
  const fromPath = `${location.pathname}${location.search}`;

  const recentTrades = [...trades]
    .filter((trade) => trade && trade.exit_date)
    .sort((a, b) => new Date(b.exit_date) - new Date(a.exit_date))
    .slice(0, limit);

  return (
    <div className="card-luxe overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="font-display text-xl text-text-primary">Recent Trades</h3>
          <p className="font-mono text-xs text-text-muted mt-0.5">Your latest closed positions</p>
        </div>
        <Link
          to="/history"
          className="font-mono text-xs text-gold hover:text-gold-light flex items-center gap-1 transition-colors flex-shrink-0"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {recentTrades.length === 0 ? (
        <div className="py-12 text-center">
          <p className="font-mono text-sm text-text-muted">No trades yet</p>
        </div>
      ) : (
        <div className="divide-y divide-border-subtle">
          {recentTrades.map((trade) => {
            const isProfit = trade.profit >= 0;

            return (
              <Link
                key={trade.id}
                to={`/detail/${trade.id}`}
                state={{ from: fromPath }}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-bg-surface/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-text-primary">{trade.symbol}</span>
                    <span className={`badge ${trade.position_type === 1 ? 'badge-win' : 'badge-loss'}`}>
                      {getTradeTypeText(trade.position_type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-text-muted">{formatDate(trade.exit_date)}</span>
                    {trade.tags && trade.tags.length > 0 && (
                      <div className="hidden sm:flex gap-1">
                        {trade.tags.slice(0, 2).map((tag) => (
                          <TagBadge key={tag.id} tag={tag} size="small" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`font-mono text-sm font-medium flex-shrink-0 ${isProfit ? 'text-gold' : 'text-loss'}`}>
                  {isProfit ? '+' : ''}${trade.profit.toLocaleString()}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTradesList;
