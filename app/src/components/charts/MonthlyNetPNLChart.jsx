import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Rectangle } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

// Custom bar shape with rounded corners
const RoundedBar = (props) => {
  const { height, y, ...rest } = props;

  if (height < 0) {
    return (
      <Rectangle
        {...rest}
        y={y + height}
        height={-height}
        radius={[0, 0, 4, 4]}
      />
    );
  }

  return <Rectangle {...rest} y={y} height={height} radius={[4, 4, 0, 0]} />;
};

const MonthlyNetPNLChart = ({ data }) => {
  const { isDark } = useTheme();
  
  // Theme-aware colors
  const colors = {
    win: isDark ? '#C9A962' : '#6B8E23',
    loss: isDark ? '#8B4049' : '#A04050',
    grid: isDark ? '#2A2A2E' : '#E5E0D8',
    axis: isDark ? '#5A5A5D' : '#8B8B8E',
    reference: isDark ? '#3A3A3E' : '#D4CFC5',
    tooltipBg: isDark ? '#1A1A1D' : '#FFFFFF',
    tooltipBorder: isDark ? '#2A2A2E' : '#E5E0D8',
    cursorFill: isDark ? 'rgba(201, 169, 98, 0.05)' : 'rgba(158, 124, 60, 0.05)',
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const dataPoint = payload[0].payload;
    const value = Number(payload[0].value || 0);
    const isProfit = value >= 0;

    return (
      <div 
        className="rounded-lg px-4 py-3 shadow-luxe-md"
        style={{ 
          backgroundColor: colors.tooltipBg, 
          border: `1px solid ${colors.tooltipBorder}` 
        }}
      >
        <p className="font-mono text-xs mb-1" style={{ color: colors.axis }}>{dataPoint.monthFull}</p>
        <p className="font-display text-lg" style={{ color: isProfit ? colors.win : colors.loss }}>
          {isProfit ? '+' : ''}${value.toLocaleString()}
        </p>
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="card-luxe p-6">
        <div className="mb-6">
          <h3 className="font-display text-xl text-text-primary">Monthly P&L</h3>
          <p className="font-mono text-xs text-text-muted mt-1">Net profit/loss by month</p>
        </div>
        <div className="flex items-center justify-center h-[250px] text-text-muted font-mono text-sm">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="card-luxe p-6">
      <div className="mb-6">
        <h3 className="font-display text-xl text-text-primary">Monthly P&L</h3>
        <p className="font-mono text-xs text-text-muted mt-1">Net profit/loss by month</p>
      </div>
      <div className="w-full">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.grid} 
              vertical={false}
            />
            <XAxis
              dataKey="monthLabel"
              stroke={colors.axis}
              tick={{ fontSize: 10, fill: colors.axis, fontFamily: 'IBM Plex Mono' }}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
            />
            <YAxis
              stroke={colors.axis}
              tick={{ fontSize: 10, fill: colors.axis, fontFamily: 'IBM Plex Mono' }}
              tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
              width={60}
            />
            <ReferenceLine y={0} stroke={colors.reference} strokeDasharray="4 4" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.cursorFill }} />
            <Bar dataKey="netPNL" barSize={20} shape={<RoundedBar />}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.netPNL >= 0 ? colors.win : colors.loss} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyNetPNLChart;
