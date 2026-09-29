import React, { useMemo } from 'react';
import { calculateMetrics } from '../../utils/calculations';
import { 
  calculateTradeBatches, 
  generateWinLossChartData, 
  generateBatchComparisonData 
} from '../../utils/calculations';
import WinLossChart from '../charts/WinLossChart';
import BatchComparisonLineChart from '../charts/BatchComparisonLineChart';
import BatchMetricsCard from '../ui/BatchMetricsCard';
import AvgWLCard from '../ui/cards/AvgWLCard';

const TradeBatchComparisonView = ({ trades }) => {
  // Calculate batches
  const { currentBatch, previousBatch } = useMemo(() => {
    return calculateTradeBatches(trades);
  }, [trades]);
  
  // Calculate metrics for each batch
  const currentMetrics = useMemo(() => {
    return calculateMetrics(currentBatch, 0);
  }, [currentBatch]);
  
  const previousMetrics = useMemo(() => {
    return calculateMetrics(previousBatch, 0);
  }, [previousBatch]);
  
  // Generate chart data
  const currentWinLossData = useMemo(() => {
    return generateWinLossChartData(currentBatch);
  }, [currentBatch]);
  
  const previousWinLossData = useMemo(() => {
    return generateWinLossChartData(previousBatch);
  }, [previousBatch]);
  
  const comparisonLineData = useMemo(() => {
    return generateBatchComparisonData(currentBatch, previousBatch);
  }, [currentBatch, previousBatch]);

  // Handle empty state
  if (!trades || trades.length === 0) {
    return (
      <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
        <div className="card-luxe p-6 sm:p-8 text-center">
          <p className="font-mono text-sm text-text-secondary">Add trades to see a batch comparison</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      {/* Section Header */}
      <div>
        <h2 className="font-display text-2xl text-text-primary mb-1">Batch Comparison</h2>
        <p className="font-mono text-xs text-text-muted">
          {trades.length <= 10
            ? `Baseline view with ${currentBatch.length} trades — full comparison unlocks at 11+ trades`
            : `Most recent ${currentBatch.length} trades vs previous ${previousBatch.length}`
          }
        </p>
      </div>

      {/* Win Rate Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full">
        {/* Previous Batch Win Rate */}
        <div className="card-luxe p-5 w-full min-w-0 overflow-hidden">
          <div className="mb-4">
            <span className="stat-label">Previous Batch</span>
            <p className="font-display text-3xl text-text-primary tracking-tight mt-1">
              {previousMetrics.winRate.toFixed(1)}%
            </p>
          </div>
          <div className="w-full min-w-0">
            <WinLossChart
              data={previousWinLossData}
              winningTrades={previousMetrics.winningTrades}
              losingTrades={previousMetrics.losingTrades}
              winRate={previousMetrics.winRate}
            />
          </div>
        </div>
        
        {/* Current Batch Win Rate */}
        <div className="card-luxe p-5 w-full min-w-0 overflow-hidden">
          <div className="mb-4">
            <span className="stat-label">Current Batch</span>
            <p className="font-display text-3xl text-text-primary tracking-tight mt-1">
              {currentMetrics.winRate.toFixed(1)}%
            </p>
          </div>
          <div className="w-full min-w-0">
            <WinLossChart
              data={currentWinLossData}
              winningTrades={currentMetrics.winningTrades}
              losingTrades={currentMetrics.losingTrades}
              winRate={currentMetrics.winRate}
            />
          </div>
        </div>

        {/* Previous Avg W/L $ */}
        <AvgWLCard
          title="Previous Avg W/L $"
          subtitle={`${previousBatch.length} trades`}
          metrics={previousMetrics}
          trades={previousBatch}
          avgWin={previousMetrics.avgWin}
          avgLoss={previousMetrics.avgLoss}
        />

        {/* Current Avg W/L $ */}
        <AvgWLCard
          title="Current Avg W/L $"
          subtitle={`${currentBatch.length} trades`}
          metrics={currentMetrics}
          trades={currentBatch}
          avgWin={currentMetrics.avgWin}
          avgLoss={currentMetrics.avgLoss}
        />
      </div>
      
      {/* Cumulative P&L Comparison Line Chart */}
      <div className="w-full min-w-0 overflow-hidden">
        <BatchComparisonLineChart data={comparisonLineData} />
      </div>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full">        
        {/* Previous Batch Metrics */}
        <BatchMetricsCard
          title="Previous Batch"
          subtitle={`${previousBatch.length} trades`}
          metrics={previousMetrics}
          trades={previousBatch}
        />

        {/* Current Batch Metrics */}
        <BatchMetricsCard
          title="Current Batch"
          subtitle={`${currentBatch.length} trades`}
          metrics={currentMetrics}
          trades={currentBatch}
        />
      </div>
    </div>
  );
};

export default TradeBatchComparisonView;
