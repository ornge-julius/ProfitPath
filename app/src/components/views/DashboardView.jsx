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
      // No filter or no start date - use original starting balance
      return startingBalance;
    }
    // Calculate balance at the start of the filtered period
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
    <div className="space-y-10">
      <section className="gradient-border glass-panel rounded-3xl px-6 py-6 sm:px-10 sm:py-10 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="badge-pill w-fit">Elevate your trading story</div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Performance cockpit</h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-2 max-w-3xl">
                Crisp metrics, softer visuals, and a guided layout inspired by modern product dashboards. Track confidence, momentum, and opportunities in one glance.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="soft-card rounded-2xl px-4 py-3 text-left min-w-[180px]">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Current balance</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">${allTimeMetrics.currentBalance?.toLocaleString()}</p>
            </div>
            <div className="soft-card rounded-2xl px-4 py-3 text-left min-w-[180px]">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Win rate</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{metrics.winRate?.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </section>

      <DashboardMetricsCards metrics={metrics} currentBalance={allTimeMetrics.currentBalance} balanceTrendData={balanceTrendData} />

      <CumulativeNetProfitChart data={cumulativeProfitData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MonthlyNetPNLChart data={monthlyNetPNLData} />
        <Last30DaysNetPNLChart data={last30DaysNetPNLData} />
      </div>

      <TradeHistoryTable trades={filteredTrades} title="Trade History" />
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
