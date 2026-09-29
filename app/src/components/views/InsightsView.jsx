import React, { useMemo } from 'react';
import { Flame, Target, Gauge, Clock } from 'lucide-react';
import {
  calculateMetrics,
  calculateAdvancedMetrics,
  generateTagPerformanceData,
  generateDayOfWeekPerformanceData,
  generatePositionTypePerformanceData,
  calculateStreaks
} from '../../utils/calculations';
import { useFilteredTrades } from '../../hooks/useFilteredTrades';
import DayOfWeekChart from '../charts/DayOfWeekChart';
import TagPerformanceList from '../ui/TagPerformanceList';
import TradeBatchComparisonView from './TradeBatchComparisonView';

const formatCurrency = (value) => {
  const abs = Math.abs(value);
  return `${value < 0 ? '-' : value > 0 ? '+' : ''}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const InsightsView = ({ trades }) => {
  const filteredTrades = useFilteredTrades(trades);

  const metrics = useMemo(() => calculateMetrics(filteredTrades, 0), [filteredTrades]);
  const advanced = useMemo(() => calculateAdvancedMetrics(filteredTrades), [filteredTrades]);
  const tagPerformance = useMemo(() => generateTagPerformanceData(filteredTrades), [filteredTrades]);
  const dayOfWeekPerformance = useMemo(() => generateDayOfWeekPerformanceData(filteredTrades), [filteredTrades]);
  const positionPerformance = useMemo(() => generatePositionTypePerformanceData(filteredTrades), [filteredTrades]);
  const streaks = useMemo(() => calculateStreaks(filteredTrades), [filteredTrades]);

  const hasTrades = filteredTrades && filteredTrades.length > 0;
  const maxPositionCount = Math.max(1, ...positionPerformance.map((p) => p.count));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pt-4">
        <h1 className="font-display text-display-md text-text-primary mb-2">Insights</h1>
        <p className="font-mono text-sm text-text-muted">The edges behind your numbers</p>
      </div>

      {!hasTrades ? (
        <div className="card-luxe p-12 text-center">
          <p className="font-mono text-sm text-text-muted">
            No trades match the current filters. Adjust filters or log a trade to see insights.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="card-luxe p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="stat-label">Win Rate</span>
                <Target className="w-3.5 h-3.5 text-text-muted" />
              </div>
              <p className="font-display text-3xl text-text-primary tracking-tight">{metrics.winRate.toFixed(1)}%</p>
            </div>

            <div className="card-luxe p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="stat-label">Profit Factor</span>
                <Gauge className="w-3.5 h-3.5 text-text-muted" />
              </div>
              <p className={`font-display text-3xl tracking-tight ${advanced.profitFactor >= 1 ? 'text-gold' : 'text-text-primary'}`}>
                {Number.isFinite(advanced.profitFactor) ? advanced.profitFactor.toFixed(2) : '∞'}
              </p>
            </div>

            <div className="card-luxe p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="stat-label">Expectancy / Trade</span>
                <Flame className="w-3.5 h-3.5 text-text-muted" />
              </div>
              <p className={`font-display text-3xl tracking-tight ${advanced.expectancy >= 0 ? 'text-gold' : 'text-loss'}`}>
                {formatCurrency(advanced.expectancy)}
              </p>
            </div>

            <div className="card-luxe p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="stat-label">Avg Hold Time</span>
                <Clock className="w-3.5 h-3.5 text-text-muted" />
              </div>
              <p className="font-display text-3xl text-text-primary tracking-tight">
                {advanced.avgHoldDays.toFixed(1)}<span className="text-text-muted text-lg ml-1">d</span>
              </p>
            </div>
          </div>

          {/* Streaks */}
          <div className="card-luxe p-5 sm:p-6">
            <span className="stat-label mb-4 block">Streaks</span>
            <div className="grid grid-cols-3 divide-x divide-border-subtle">
              <div className="text-center px-2">
                <p className={`font-display text-2xl sm:text-3xl tracking-tight ${
                  streaks.currentType === 'W' ? 'text-gold' : streaks.currentType === 'L' ? 'text-loss' : 'text-text-primary'
                }`}>
                  {streaks.currentType ? `${streaks.currentCount}${streaks.currentType}` : '—'}
                </p>
                <span className="font-mono text-xs text-text-muted mt-1 block">Current</span>
              </div>
              <div className="text-center px-2">
                <p className="font-display text-2xl sm:text-3xl text-gold tracking-tight">{streaks.longestWinStreak}</p>
                <span className="font-mono text-xs text-text-muted mt-1 block">Best Win Streak</span>
              </div>
              <div className="text-center px-2">
                <p className="font-display text-2xl sm:text-3xl text-loss tracking-tight">{streaks.longestLossStreak}</p>
                <span className="font-mono text-xs text-text-muted mt-1 block">Worst Loss Streak</span>
              </div>
            </div>
          </div>

          {/* Tag Performance + Day of Week */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-luxe p-5 sm:p-6">
              <h3 className="font-display text-xl text-text-primary mb-1">Performance by Tag</h3>
              <p className="font-mono text-xs text-text-muted mb-5">Which strategies are carrying results</p>
              <TagPerformanceList data={tagPerformance} />
            </div>

            <div className="card-luxe p-5 sm:p-6">
              <h3 className="font-display text-xl text-text-primary mb-1">Day of Week Edge</h3>
              <p className="font-mono text-xs text-text-muted mb-5">Net P&L by exit day</p>
              <DayOfWeekChart data={dayOfWeekPerformance} />
            </div>
          </div>

          {/* CALL vs PUT */}
          <div className="card-luxe p-5 sm:p-6">
            <h3 className="font-display text-xl text-text-primary mb-1">Calls vs Puts</h3>
            <p className="font-mono text-xs text-text-muted mb-5">Which side of the market has your edge</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {positionPerformance.map((position) => (
                <div key={position.type} className="p-4 rounded-lg border border-border-subtle bg-bg-surface">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`badge ${position.label === 'CALL' ? 'badge-win' : 'badge-loss'}`}>{position.label}</span>
                    <span className="font-mono text-xs text-text-muted">{position.count} trade{position.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-baseline justify-between mb-3">
                    <span className={`font-display text-2xl tracking-tight ${position.netPNL >= 0 ? 'text-gold' : 'text-loss'}`}>
                      {position.count > 0 ? formatCurrency(position.netPNL) : '—'}
                    </span>
                    <span className="font-mono text-sm text-text-secondary">{position.winRate.toFixed(0)}% W</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${(position.count / maxPositionCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Batch Comparison */}
          <TradeBatchComparisonView trades={filteredTrades} />
        </>
      )}
    </div>
  );
};

export default InsightsView;
