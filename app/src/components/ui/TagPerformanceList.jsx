import React, { useMemo } from 'react';

const formatCurrency = (value) => {
  const abs = Math.abs(value);
  return `${value < 0 ? '-' : value > 0 ? '+' : ''}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const TagPerformanceList = ({ data = [] }) => {
  const maxMagnitude = useMemo(
    () => Math.max(1, ...data.map((entry) => Math.abs(entry.netPNL))),
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-text-muted font-mono text-sm text-center px-4">
        Tag your trades to see which strategies perform best
      </div>
    );
  }

  return (
    <div className="min-h-[220px] flex flex-col justify-center space-y-3">
      {data.slice(0, 8).map((entry) => {
        const isProfit = entry.netPNL >= 0;
        const barWidth = Math.max(4, (Math.abs(entry.netPNL) / maxMagnitude) * 100);

        return (
          <div key={entry.id}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="font-mono text-sm text-text-primary truncate">{entry.name}</span>
                <span className="font-mono text-[10px] text-text-muted flex-shrink-0">
                  {entry.count} trade{entry.count !== 1 ? 's' : ''} · {entry.winRate.toFixed(0)}% W
                </span>
              </div>
              <span className={`font-mono text-sm font-medium flex-shrink-0 ml-3 ${isProfit ? 'text-gold' : 'text-loss'}`}>
                {formatCurrency(entry.netPNL)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-surface overflow-hidden">
              <div
                className={`h-full rounded-full ${isProfit ? 'bg-gold' : 'bg-loss'}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TagPerformanceList;
