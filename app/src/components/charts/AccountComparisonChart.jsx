import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const AccountComparisonChart = ({ data }) => {
  const { isDark } = useTheme();

  const colors = {
    starting: isDark ? '#5A5A5D' : '#8B8B8E',
    current: isDark ? '#C9A962' : '#9E7C3C',
    currentLoss: isDark ? '#8B4049' : '#A04050',
    grid: isDark ? '#2A2A2E' : '#E5E0D8',
    axis: isDark ? '#5A5A5D' : '#8B8B8E',
    tooltipBg: isDark ? '#1A1A1D' : '#FFFFFF',
    tooltipBorder: isDark ? '#2A2A2E' : '#E5E0D8',
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div
        className="rounded-lg px-4 py-3 shadow-luxe-md"
        style={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}` }}
      >
        <p className="font-mono text-xs mb-2" style={{ color: colors.axis }}>{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-baseline gap-2">
            <span className="font-mono text-xs" style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-display text-base" style={{ color: entry.color }}>
              ${Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-text-muted font-mono text-sm">
        No accounts to compare
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis
          dataKey="name"
          stroke={colors.axis}
          tick={{ fontSize: 11, fill: colors.axis, fontFamily: 'IBM Plex Mono' }}
          axisLine={{ stroke: colors.grid }}
          tickLine={{ stroke: colors.grid }}
        />
        <YAxis
          stroke={colors.axis}
          tick={{ fontSize: 10, fill: colors.axis, fontFamily: 'IBM Plex Mono' }}
          tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
          axisLine={{ stroke: colors.grid }}
          tickLine={{ stroke: colors.grid }}
          width={64}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(158, 124, 60, 0.05)' }} />
        <Legend
          wrapperStyle={{ paddingTop: '12px', fontFamily: 'IBM Plex Mono', fontSize: '12px' }}
          formatter={(value) => <span style={{ color: colors.axis }}>{value}</span>}
        />
        <Bar dataKey="startingBalance" name="Starting" fill={colors.starting} radius={[4, 4, 0, 0]} barSize={20} />
        <Bar dataKey="currentBalance" name="Current" fill={colors.current} radius={[4, 4, 0, 0]} barSize={20}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.currentBalance >= entry.startingBalance ? colors.current : colors.currentLoss} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AccountComparisonChart;
