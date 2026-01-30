import React from 'react';
import WinRateCard from './cards/WinRateCard';
import CurrentBalanceCard from './cards/CurrentBalanceCard';
import AvgWLCard from './cards/AvgWLCard';
import NetProfitCard from './cards/NetProfitCard';

const DashboardMetricsCards = ({ metrics, currentBalance, balanceTrendData }) => {
  if (!metrics) {
    return null;
  }

  const {
    winRate = 0,
    winningTrades = 0,
    losingTrades = 0,
    totalTrades = 0,
    avgWin = 0,
    avgLoss = 0,
    totalProfit = 0,
  } = metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <WinRateCard
        winRate={winRate}
        winningTrades={winningTrades}
        losingTrades={losingTrades}
        totalTrades={totalTrades}
      />

      <CurrentBalanceCard
        currentBalance={currentBalance}
        trendData={balanceTrendData}
      />

      <AvgWLCard
        title="Risk/Reward"
        avgWin={avgWin}
        avgLoss={avgLoss}
      />

      <NetProfitCard
        totalProfit={totalProfit}
      />
    </div>
  );
};

export default DashboardMetricsCards;
