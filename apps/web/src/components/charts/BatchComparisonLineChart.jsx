import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const BatchComparisonLineChart = ({ data }) => {
  const { isDark } = useTheme();
  
  // Theme-aware colors consistent with the rest of the app
  const colors = {
    current: isDark ? '#C9A962' : '#9E7C3C', // Gold - primary accent
    previous: isDark ? '#8B8B8E' : '#5A5A5D', // Secondary/muted
    grid: isDark ? '#2A2A2E' : '#E5E0D8',
    axis: isDark ? '#5A5A5D' : '#8B8B8E',
    reference: isDark ? '#3A3A3E' : '#D4CFC5',
    tooltipBg: isDark ? '#1A1A1D' : '#FFFFFF',
    tooltipBorder: isDark ? '#2A2A2E' : '#E5E0D8',
    tooltipText: isDark ? '#F5F5F5' : '#1A1A1D',
    textMuted: isDark ? '#8B8B8E' : '#5A5A5D',
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }
    
    const dataPoint = payload[0].payload;
    
    return (
      <div 
        className="rounded-lg px-4 py-3 shadow-luxe-md"
        style={{ 
          backgroundColor: colors.tooltipBg, 
          border: `1px solid ${colors.tooltipBorder}` 
        }}
      >
        <div className="font-mono text-xs mb-2" style={{ color: colors.textMuted }}>
          Trade #{dataPoint.tradeNumber}
        </div>
        {dataPoint.currentValue !== null && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-mono text-xs" style={{ color: colors.current }}>Current:</span>
            <span className="font-display text-lg" style={{ color: colors.current }}>
              ${dataPoint.currentValue.toLocaleString()}
            </span>
          </div>
        )}
        {dataPoint.previousValue !== null && (
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs" style={{ color: colors.previous }}>Previous:</span>
            <span className="font-display text-lg" style={{ color: colors.previous }}>
              ${dataPoint.previousValue.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  };
  
  if (!data || data.length === 0) {
    return (
      <div className="card-luxe p-6 w-full min-w-0 overflow-hidden">
        <div className="mb-6">
          <h3 className="font-display text-xl text-text-primary">Cumulative P&L Comparison</h3>
          <p className="font-mono text-xs text-text-muted mt-1">Track performance progression across batches</p>
        </div>
        <div className="flex items-center justify-center h-[300px] font-mono text-sm text-text-muted">
          No data available
        </div>
      </div>
    );
  }
  
  return (
    <div className="card-luxe p-6 w-full min-w-0 overflow-hidden">
      <div className="mb-6">
        <h3 className="font-display text-xl text-text-primary">Cumulative P&L Comparison</h3>
        <p className="font-mono text-xs text-text-muted mt-1">Track performance progression across batches</p>
      </div>
      <div className="w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.grid} 
              vertical={false}
            />
            <XAxis
              dataKey="tradeNumber"
              stroke={colors.axis}
              tick={{ fontSize: 10, fill: colors.axis, fontFamily: 'IBM Plex Mono' }}
              label={{ 
                value: 'Trade Number', 
                position: 'insideBottom', 
                offset: -5, 
                fill: colors.axis,
                fontFamily: 'IBM Plex Mono',
                fontSize: 10
              }}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
            />
            <YAxis
              stroke={colors.axis}
              tick={{ fontSize: 10, fill: colors.axis, fontFamily: 'IBM Plex Mono' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
              width={70}
            />
            <ReferenceLine 
              y={0} 
              stroke={colors.reference} 
              strokeDasharray="4 4" 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '16px',
                fontFamily: 'IBM Plex Mono',
                fontSize: '12px'
              }}
              iconType="line"
              formatter={(value) => (
                <span style={{ color: colors.axis }}>{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="currentValue"
              name="Current Batch"
              stroke={colors.current}
              strokeWidth={2}
              dot={{ r: 3, fill: colors.current, stroke: colors.tooltipBg, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: colors.current, stroke: colors.tooltipBg, strokeWidth: 2 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="previousValue"
              name="Previous Batch"
              stroke={colors.previous}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: colors.previous, stroke: colors.tooltipBg, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: colors.previous, stroke: colors.tooltipBg, strokeWidth: 2 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BatchComparisonLineChart;
