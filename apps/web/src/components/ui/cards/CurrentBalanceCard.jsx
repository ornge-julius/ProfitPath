import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';

const CurrentBalanceCard = ({ currentBalance = 0, trendData = [] }) => {
  const [hoverBalance, setHoverBalance] = React.useState(null);
  const { isDark } = useTheme();
  
  // Theme-aware colors
  const colors = {
    positive: isDark ? '#C9A962' : '#6B8E23',
    negative: isDark ? '#8B4049' : '#A04050',
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const chartData = trendData.slice(-10).map((point, index) => ({
    index,
    value: point.balance ?? point.value ?? 0
  }));

  // Determine trend direction
  const isPositive = chartData.length >= 2 && 
    chartData[chartData.length - 1].value >= chartData[0].value;

  return (
    <div className="card-luxe p-5 h-full flex flex-col">
      {/* Header */}
      <span className="stat-label mb-1">Current Balance</span>

      {/* Value */}
      <p className="font-display text-3xl text-text-primary tracking-tight mb-auto">
        {formatCurrency(hoverBalance ?? currentBalance)}
      </p>

      {/* Sparkline Chart */}
      {chartData.length > 0 && (
        <div className="mt-4 h-12 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
              onMouseMove={(state) => {
                if (state && state.activePayload && state.activePayload.length > 0) {
                  const value = state.activePayload[0].payload?.value;
                  if (typeof value === 'number') {
                    setHoverBalance(value);
                  }
                }
              }}
              onMouseLeave={() => setHoverBalance(null)}
            >
              <YAxis 
                hide 
                domain={[
                  (dataMin) => dataMin - Math.abs(dataMin) * 0.02 - 1,
                  (dataMax) => dataMax + Math.abs(dataMax) * 0.02 + 1
                ]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={isPositive ? colors.positive : colors.negative}
                strokeWidth={1.5}
                dot={false}
                strokeLinecap="round"
                strokeLinejoin="round"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trend indicator */}
      {chartData.length >= 2 && (
        <div className="flex items-center gap-2 mt-2">
          <span 
            className="font-mono text-xs"
            style={{ color: isPositive ? colors.positive : colors.negative }}
          >
            {isPositive ? '↑' : '↓'} Trending {isPositive ? 'up' : 'down'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CurrentBalanceCard;
