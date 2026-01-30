import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar } from 'lucide-react';
import CurrentBalanceCard from './cards/CurrentBalanceCard';

const MetricsCards = ({ metrics, balanceTrendData = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <CurrentBalanceCard currentBalance={metrics.currentBalance} trendData={balanceTrendData} />

      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-400 text-sm font-medium">Total Profit</h3>
          {metrics.totalProfit >= 0 ?
            <TrendingUp className="h-5 w-5 text-emerald-400" /> : 
            <TrendingDown className="h-5 w-5 text-red-400" />
          }
        </div>
        <p className={`text-2xl font-bold ${metrics.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          ${metrics.totalProfit.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">{metrics.totalTrades} total trades</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-400 text-sm font-medium">Win Rate</h3>
          <Target className="h-5 w-5 text-purple-400" />
        </div>
        <p className="text-2xl font-bold text-purple-400">
          {metrics.winRate.toFixed(1)}%
        </p>
        <p className="text-xs text-gray-500">{metrics.winningTrades}W / {metrics.losingTrades}L</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-400 text-sm font-medium">Avg Win/Loss</h3>
          <Calendar className="h-5 w-5 text-yellow-400" />
        </div>
        <p className="text-2xl font-bold text-yellow-400">
          ${metrics.avgWin.toFixed(0)}/${metrics.avgLoss.toFixed(0)}
        </p>
        <p className="text-xs text-gray-500">Risk/Reward Ratio</p>
      </div>
    </div>
  );
};

export default MetricsCards;
