import React from 'react';
import { 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  AreaChart
} from 'recharts';
import { formatDate, formatDateForTooltip } from '../../utils/calculations';
import { useTheme } from '../../context/ThemeContext';

const CumulativeNetProfitChart = ({ data }) => {
  const { isDark } = useTheme();
  
  // Theme-aware colors
  const colors = {
    line: isDark ? '#C9A962' : '#9E7C3C',
    winFill: isDark ? '#C9A962' : '#6B8E23',
    lossFill: isDark ? '#8B4049' : '#A04050',
    grid: isDark ? '#2A2A2E' : '#E5E0D8',
    axis: isDark ? '#5A5A5D' : '#8B8B8E',
    reference: isDark ? '#3A3A3E' : '#D4CFC5',
    tooltipBg: isDark ? '#1A1A1D' : '#FFFFFF',
    tooltipBorder: isDark ? '#2A2A2E' : '#E5E0D8',
    tooltipText: isDark ? '#F5F5F5' : '#1A1A1D',
    activeDotStroke: isDark ? '#0A0A0B' : '#FFFFFF',
  };

  if (!data || data.length === 0) {
    return (
      <div className="card-luxe p-6">
        <div className="mb-6">
          <h3 className="font-display text-xl text-text-primary">Profit Curve</h3>
          <p className="font-mono text-xs text-text-muted mt-1">Cumulative net profit over time</p>
        </div>
        <div className="flex items-center justify-center h-[300px] text-text-muted font-mono text-sm">
          No trade data available
        </div>
      </div>
    );
  }

  const chartData = data;

  const cumulativeValues = chartData
    .map(point => point.cumulative)
    .filter(val => typeof val === 'number' && !isNaN(val));
  
  if (cumulativeValues.length === 0) {
    return null;
  }
  
  const minValue = Math.min(...cumulativeValues);
  const maxValue = Math.max(...cumulativeValues);
  
  const range = maxValue - minValue;
  const padding = range === 0 ? 100 : Math.max(range * 0.1, 10);
  
  let domainMin = Math.floor(minValue - padding);
  let domainMax = Math.ceil(maxValue + padding);
  
  if (maxValue > 0 && minValue < 0) {
    domainMin = Math.min(domainMin, -Math.max(padding, 10));
    domainMax = Math.max(domainMax, Math.max(padding, 10));
  }
  
  const domain = [domainMin, domainMax];

  const getGradientOffset = () => {
    if (maxValue <= 0) return '0%';
    if (minValue >= 0) return '100%';
    return `${(maxValue / (maxValue - minValue)) * 100}%`;
  };
  const gradientOffset = getGradientOffset();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isProfit = value >= 0;
      return (
        <div 
          className="rounded-lg px-4 py-3 shadow-luxe-md"
          style={{ 
            backgroundColor: colors.tooltipBg, 
            border: `1px solid ${colors.tooltipBorder}` 
          }}
        >
          <p className="font-mono text-xs mb-1" style={{ color: colors.axis }}>
            {formatDateForTooltip(label)}
          </p>
          <p className="font-display text-lg" style={{ color: isProfit ? colors.winFill : colors.lossFill }}>
            {isProfit ? '+' : ''}${value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-luxe p-6">
      <div className="mb-6">
        <h3 className="font-display text-xl text-text-primary">Profit Curve</h3>
        <p className="font-mono text-xs text-text-muted mt-1">Cumulative net profit over time</p>
      </div>
      
      <div className="w-full">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
            <defs>
              <linearGradient id="cumulativeSplit" x1="0" y1="0" x2="0" y2="1">
                <stop offset={gradientOffset} stopColor={colors.winFill} stopOpacity={0.2} />
                <stop offset={gradientOffset} stopColor={colors.lossFill} stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.grid} 
              vertical={false}
            />
          
            <XAxis
              dataKey="date"
              stroke={colors.axis}
              tick={{ fontSize: 10, fill: colors.axis, fontFamily: 'IBM Plex Mono' }}
              tickFormatter={(value) => formatDate(value)}
              angle={-45}
              textAnchor="end"
              height={50}
              interval="preserveStartEnd"
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
            />
          
            <YAxis
              stroke={colors.axis}
              tick={{ fontSize: 10, fill: colors.axis, fontFamily: 'IBM Plex Mono' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              domain={domain}
              allowDataOverflow={false}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
              width={70}
            />
          
            <ReferenceLine 
              y={0} 
              stroke={colors.reference} 
              strokeDasharray="4 4" 
            />

            <Area
              type="monotone"
              dataKey="cumulative"
              stroke={colors.line}
              strokeWidth={2}
              fill="url(#cumulativeSplit)"
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: colors.line, 
                stroke: colors.activeDotStroke,
                strokeWidth: 2 
              }}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />

            <Tooltip content={<CustomTooltip />} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CumulativeNetProfitChart;
