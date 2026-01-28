import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const BatchMetricsCard = ({ title, subtitle, metrics, trades }) => {
  const location = useLocation();
  const fromPath = `${location.pathname}${location.search}`;
  const { isDark } = useTheme();

  // Theme-aware colors
  const colors = {
    win: isDark ? '#C9A962' : '#6B8E23',
    loss: isDark ? '#8B4049' : '#A04050',
    link: isDark ? '#C9A962' : '#9E7C3C',
    linkHover: isDark ? '#D4B87A' : '#B8924A',
  };

  if (!metrics) {
    return (
      <div className="card-luxe p-5 w-full min-w-0 overflow-hidden">
        <h3 className="font-display text-xl text-text-primary mb-1">{title}</h3>
        <p className="font-mono text-xs text-text-muted mb-4">{subtitle}</p>
        <div className="font-mono text-sm text-text-secondary">No data available</div>
      </div>
    );
  }

  const {
    totalTrades = 0,
    totalProfit = 0,
    winRate = 0,
    winningTrades = 0,
    losingTrades = 0,
    avgWin = 0,
    avgLoss = 0
  } = metrics;

  // Find best and worst trades
  const bestTrade = trades && trades.length > 0 
    ? trades.reduce((best, trade) => (trade.profit > (best?.profit || -Infinity) ? trade : best), trades[0])
    : null;
  
  const worstTrade = trades && trades.length > 0 
    ? trades.reduce((worst, trade) => (trade.profit < (worst?.profit || Infinity) ? trade : worst), trades[0])
    : null;

  const formatCurrency = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '$0';
    return `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getProfitColor = (value) => {
    if (value > 0) return colors.win;
    if (value < 0) return colors.loss;
    return undefined;
  };

  const winners = trades.filter(trade => trade.result === 1);
  const losers = trades.filter(trade => trade.result === 0);

  const renderSymbolLink = (trade) => {
    const key = trade.id ?? `${trade.symbol}-${trade.entry_date}`;
    const symbol = trade.symbol || '—';

    if (!trade.id) {
      return (
        <span key={key} className="font-mono text-xs text-text-secondary cursor-default">
          {symbol}
        </span>
      );
    }

    return (
      <Link
        key={key}
        to={`/detail/${trade.id}`}
        state={{ from: fromPath }}
        className="font-mono text-xs transition-colors"
        style={{ color: colors.link }}
        onMouseEnter={(e) => e.target.style.color = colors.linkHover}
        onMouseLeave={(e) => e.target.style.color = colors.link}
      >
        {symbol}
      </Link>
    );
  };

  const renderTradeSymbol = (trade, isWin) => {
    if (!trade) {
      return '—';
    }

    const color = isWin ? colors.win : colors.loss;
    const prefix = trade.profit >= 0 ? '+' : '-';

    if (!trade.id) {
      return (
        <span style={{ color }}>
          ({trade.symbol || '—'}) {prefix}{formatCurrency(trade.profit)}
        </span>
      );
    }

    return (
      <>
        (
        <Link
          to={`/detail/${trade.id}`}
          state={{ from: fromPath }}
          className="underline-offset-2 hover:underline"
          style={{ color }}
        >
          {trade.symbol || '—'}
        </Link>
        ) {prefix}{formatCurrency(trade.profit)}
      </>
    );
  };

  const MetricRow = ({ label, value, valueColor, children }) => (
    <div className="flex justify-between items-center py-3 border-b border-border-subtle last:border-b-0">
      <span className="font-mono text-xs text-text-muted uppercase tracking-wider">{label}</span>
      {children || (
        <span 
          className="font-mono text-sm font-medium"
          style={{ color: valueColor || 'var(--color-text-primary)' }}
        >
          {value}
        </span>
      )}
    </div>
  );

  return (
    <div className="card-luxe p-5 w-full min-w-0 overflow-hidden">
      <div className="mb-4">
        <h3 className="font-display text-xl text-text-primary mb-1">{title}</h3>
        <p className="font-mono text-xs text-text-muted">{subtitle}</p>
      </div>

      <div>
        <MetricRow label="Total Trades" value={totalTrades} />

        <MetricRow 
          label="Total P/L" 
          value={`${totalProfit >= 0 ? '+' : '-'}${formatCurrency(totalProfit)}`}
          valueColor={getProfitColor(totalProfit)}
        />

        <MetricRow label="Win Rate" value={`${winRate.toFixed(1)}%`} />

        <MetricRow label="Winning Trades" value={winningTrades} valueColor={colors.win} />

        {winners && winners.length > 0 && (
          <div className="py-3 border-b border-border-subtle">
            <div className="flex justify-between items-start gap-4">
              <span className="font-mono text-xs text-text-muted uppercase tracking-wider pt-0.5">Winners</span>
              <div className="flex flex-wrap justify-end gap-2">
                {winners.map((winner) => renderSymbolLink(winner))}
              </div>
            </div>
          </div>
        )}

        <MetricRow label="Losing Trades" value={losingTrades} valueColor={colors.loss} />

        {losers && losers.length > 0 && (
          <div className="py-3 border-b border-border-subtle">
            <div className="flex justify-between items-start gap-4">
              <span className="font-mono text-xs text-text-muted uppercase tracking-wider pt-0.5">Losers</span>
              <div className="flex flex-wrap justify-end gap-2">
                {losers.map((loser) => renderSymbolLink(loser))}
              </div>
            </div>
          </div>
        )}

        <MetricRow 
          label="Avg Win" 
          value={winningTrades > 0 ? `+${formatCurrency(avgWin)}` : '$0'}
          valueColor={colors.win}
        />

        <MetricRow 
          label="Avg Loss" 
          value={losingTrades > 0 ? `-${formatCurrency(avgLoss)}` : '$0'}
          valueColor={colors.loss}
        />

        {bestTrade && (
          <MetricRow label="Best Trade">
            <span className="font-mono text-sm font-medium" style={{ color: colors.win }}>
              {renderTradeSymbol(bestTrade, true)}
            </span>
          </MetricRow>
        )}

        {worstTrade && (
          <MetricRow label="Worst Trade">
            <span className="font-mono text-sm font-medium" style={{ color: colors.loss }}>
              {renderTradeSymbol(worstTrade, false)}
            </span>
          </MetricRow>
        )}
      </div>
    </div>
  );
};

export default BatchMetricsCard;
