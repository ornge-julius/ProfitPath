import React, { useMemo } from 'react';
import TradeHistoryTable from '../tables/TradeHistoryTable';
import CumulativeNetProfitChart from '../charts/CumulativeNetProfitChart';
import MonthlyNetPNLChart from '../charts/MonthlyNetPNLChart';
import Last30DaysNetPNLChart from '../charts/Last30DaysNetPNLChart';
import DashboardMetricsCards from '../ui/DashboardMetricsCards';
import {
  calculateMetrics,
  calculateBalanceAtDate,
  generateCumulativeProfitData,
  generateAccountBalanceData,
  generateBalanceTrendData,
  generateMonthlyNetPNLData,
  generateLast30DaysNetPNLData
} from '../../utils/calculations';
import { useDateFilter } from '../../context/DateFilterContext';
import { useFilteredTrades } from '../../hooks/useFilteredTrades';

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

      {/* Main Chart */}
      <CumulativeNetProfitChart data={cumulativeProfitData} />

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyNetPNLChart data={monthlyNetPNLData} />
        <Last30DaysNetPNLChart data={last30DaysNetPNLData} />
      </div>

      {/* Trade History */}
      <TradeHistoryTable trades={filteredTrades} title="Recent Trades" />
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
