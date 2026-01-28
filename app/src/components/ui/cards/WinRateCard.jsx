import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';

const clampPercentage = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

const WinRateCard = ({
  winRate = 0,
  winningTrades = 0,
  losingTrades = 0,
  totalTrades,
}) => {
  const { isDark } = useTheme();
  
  // Theme-aware colors
  const colors = {
    win: isDark ? '#C9A962' : '#6B8E23',
    loss: isDark ? '#32323A' : '#E5E0D8',
  };

  const validWinRate = clampPercentage(winRate);
  const lossRate = 100 - validWinRate;

  const wins = Number.isFinite(winningTrades) && winningTrades > 0 ? Math.round(winningTrades) : 0;
  const losses = Number.isFinite(losingTrades) && losingTrades > 0 ? Math.round(losingTrades) : 0;

  const chartData = useMemo(() => {
    const baseData = [
      { name: 'Wins', value: validWinRate, color: colors.win },
      { name: 'Losses', value: lossRate, color: colors.loss },
    ];

    if (validWinRate === 0 && lossRate === 0) {
      return [
        { name: 'Wins', value: 0, color: colors.win },
        { name: 'Losses', value: 100, color: colors.loss },
      ];
    }

    return baseData;
  }, [lossRate, validWinRate, colors.win, colors.loss]);

  const displayTotalTrades = Number.isFinite(totalTrades) && totalTrades > 0 ? Math.round(totalTrades) : 0;

  return (
    <div className="card-luxe p-5 h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <span className="stat-label">Win Rate</span>
        <span className="stat-label">Total</span>
      </div>

      {/* Values */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="font-display text-3xl text-text-primary tracking-tight">
          {validWinRate.toFixed(1)}%
        </span>
        <span className="font-mono text-xl text-text-secondary">
          {displayTotalTrades.toLocaleString()}
        </span>
      </div>

      {/* Chart */}
      <div className="h-24 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={28}
              outerRadius={44}
              dataKey="value"
              stroke="transparent"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`win-rate-segment-${entry.name}-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.win }} />
          <span className="font-mono text-xs text-text-secondary">
            {wins} <span className="text-text-muted">W</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.loss }} />
          <span className="font-mono text-xs text-text-secondary">
            {losses} <span className="text-text-muted">L</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default WinRateCard;
