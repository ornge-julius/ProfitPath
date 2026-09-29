import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Skull, Flame, Clock3 } from 'lucide-react';
import RecentTradesList from '../ui/RecentTradesList';
import CumulativeNetProfitChart from '../charts/CumulativeNetProfitChart';
import MonthlyNetPNLChart from '../charts/MonthlyNetPNLChart';
import Last30DaysNetPNLChart from '../charts/Last30DaysNetPNLChart';
import DashboardMetricsCards from '../ui/DashboardMetricsCards';
import {
  calculateMetrics,
  calculateBalanceAtDate,
  calculateAdvancedMetrics,
  calculateStreaks,
  generateCumulativeProfitData,
  generateAccountBalanceData,
  generateBalanceTrendData,
  generateMonthlyNetPNLData,
  generateLast30DaysNetPNLData
} from '../../utils/calculations';
import { useDateFilter } from '../../context/DateFilterContext';
import { useFilteredTrades } from '../../hooks/useFilteredTrades';

const formatCurrency = (value) => {
  const abs = Math.abs(value);
  return `${value < 0 ? '-' : value > 0 ? '+' : ''}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const DashboardContent = ({ trades, startingBalance }) => {
  const { filter } = useDateFilter();
  const filteredTrades = useFilteredTrades(trades);

  // Calculate all-time metrics from all trades (not filtered)
  const allTimeMetrics = useMemo(() => {
    return calculateMetrics(trades, startingBalance);
  }, [trades, startingBalance]);

  // Calculate metrics for filtered trades (used for other cards)
  const metrics = useMemo(() => {
    return calculateMetrics(filteredTrades, startingBalance);
  }, [filteredTrades, startingBalance]);

  const cumulativeProfitData = useMemo(() => {
    return generateCumulativeProfitData(filteredTrades);
  }, [filteredTrades]);

  // Calculate the starting balance at the beginning of the filtered period
  const filteredPeriodStartingBalance = useMemo(() => {
    if (!filter || !filter.fromUtc) {
      return startingBalance;
    }
    return calculateBalanceAtDate(trades, startingBalance, filter.fromUtc);
  }, [trades, startingBalance, filter]);

  const accountBalanceData = useMemo(() => {
    return generateAccountBalanceData(filteredTrades, filteredPeriodStartingBalance);
  }, [filteredTrades, filteredPeriodStartingBalance]);

  const balanceTrendData = useMemo(() => {
    return generateBalanceTrendData(accountBalanceData);
  }, [accountBalanceData]);

  const monthlyNetPNLData = useMemo(() => {
    return generateMonthlyNetPNLData(filteredTrades);
  }, [filteredTrades]);

  const last30DaysNetPNLData = useMemo(() => {
    return generateLast30DaysNetPNLData(trades);
  }, [trades]);

  const highlights = useMemo(() => {
    const decided = filteredTrades.filter((t) => typeof t.profit === 'number');
    const bestTrade = decided.reduce((best, t) => (!best || t.profit > best.profit ? t : best), null);
    const worstTrade = decided.reduce((worst, t) => (!worst || t.profit < worst.profit ? t : worst), null);
    const streaks = calculateStreaks(filteredTrades);
    const advanced = calculateAdvancedMetrics(filteredTrades);

    return { bestTrade, worstTrade, streaks, avgHoldDays: advanced.avgHoldDays };
  }, [filteredTrades]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pt-4">
        <h1 className="font-display text-display-md text-text-primary mb-2">Dashboard</h1>
        <p className="font-mono text-sm text-text-muted">Your trading performance at a glance</p>
      </div>

      {/* Metrics Cards */}
      <DashboardMetricsCards
        metrics={metrics}
        currentBalance={allTimeMetrics.currentBalance}
        balanceTrendData={balanceTrendData}
      />

      {/* Highlights Strip */}
      {filteredTrades.length > 0 && (
        <div className="card-luxe px-5 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">
            <div className="flex items-center gap-3 py-3 sm:py-0 sm:pr-6 flex-1">
              <Trophy className="w-4 h-4 text-gold flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block">Best Trade</span>
                <span className="font-mono text-sm text-gold">
                  {highlights.bestTrade ? `${highlights.bestTrade.symbol} ${formatCurrency(highlights.bestTrade.profit)}` : '—'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3 sm:py-0 sm:px-6 flex-1">
              <Skull className="w-4 h-4 text-loss flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block">Worst Trade</span>
                <span className="font-mono text-sm text-loss">
                  {highlights.worstTrade ? `${highlights.worstTrade.symbol} ${formatCurrency(highlights.worstTrade.profit)}` : '—'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3 sm:py-0 sm:px-6 flex-1">
              <Flame className={`w-4 h-4 flex-shrink-0 ${highlights.streaks.currentType === 'W' ? 'text-gold' : highlights.streaks.currentType === 'L' ? 'text-loss' : 'text-text-muted'}`} />
              <div className="min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block">Current Streak</span>
                <span className="font-mono text-sm text-text-primary">
                  {highlights.streaks.currentType ? `${highlights.streaks.currentCount}${highlights.streaks.currentType}` : '—'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3 sm:py-0 sm:pl-6 flex-1">
              <Clock3 className="w-4 h-4 text-text-muted flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block">Avg Hold</span>
                <span className="font-mono text-sm text-text-primary">{highlights.avgHoldDays.toFixed(1)}d</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <CumulativeNetProfitChart data={cumulativeProfitData} />

      {/* Secondary Charts */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-display text-lg text-text-primary">Recent Performance</h2>
          <Link
            to="/calendar"
            className="font-mono text-xs text-gold hover:text-gold-light flex items-center gap-1 transition-colors"
          >
            View Calendar <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyNetPNLChart data={monthlyNetPNLData} />
          <Last30DaysNetPNLChart data={last30DaysNetPNLData} />
        </div>
      </div>

      {/* Recent Trades */}
      <RecentTradesList trades={filteredTrades} />
    </div>
  );
};

const DashboardView = ({ trades, startingBalance }) => {
  return (
    <DashboardContent
      trades={trades}
      startingBalance={startingBalance}
    />
  );
};

export default DashboardView;
