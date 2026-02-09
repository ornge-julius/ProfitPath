import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const NetProfitCard = ({ totalProfit = 0 }) => {
  const { isDark } = useTheme();
  
  // Theme-aware colors
  const colors = {
    positive: isDark ? '#C9A962' : '#6B8E23',
    positiveBg: isDark ? 'rgba(201, 169, 98, 0.12)' : 'rgba(107, 142, 35, 0.1)',
    negative: isDark ? '#8B4049' : '#A04050',
    negativeBg: isDark ? 'rgba(139, 64, 73, 0.12)' : 'rgba(160, 64, 80, 0.1)',
  };

  const validProfit = typeof totalProfit === 'number' && Number.isFinite(totalProfit) ? totalProfit : 0;
  const isPositive = validProfit > 0;
  const isNegative = validProfit < 0;
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [validProfit]);

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const color = isPositive ? colors.positive : isNegative ? colors.negative : undefined;
  const bgColor = isPositive ? colors.positiveBg : isNegative ? colors.negativeBg : undefined;

  return (
    <div className="card-luxe p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="stat-label">Net Profit</span>
        <div 
          className="p-1.5 rounded-lg"
          style={{ backgroundColor: bgColor || 'var(--color-bg-surface)' }}
        >
          <Icon 
            className="w-4 h-4"
            style={{ color: color || 'var(--color-text-muted)' }}
          />
        </div>
      </div>

      {/* Value */}
      <p 
        className="font-display text-3xl tracking-tight"
        style={{ color: color || 'var(--color-text-primary)' }}
      >
        <CountUp
          key={animationKey}
          start={0}
          end={validProfit}
          duration={1.2}
          decimals={0}
          decimal="."
          prefix={validProfit >= 0 ? '$' : '-$'}
          separator=","
          formattingFn={(value) => {
            const absValue = Math.abs(value);
            return (value < 0 ? '-$' : '$') + absValue.toLocaleString();
          }}
        />
      </p>

      {/* Status indicator */}
      <div className="mt-auto pt-4">
        <div 
          className="h-1 rounded-full w-full"
          style={{ backgroundColor: bgColor || 'var(--color-border)' }}
        >
          <div 
            className="h-full rounded-full transition-all duration-1000"
            style={{ 
              backgroundColor: color || 'var(--color-text-muted)',
              width: isPositive || isNegative ? '100%' : '0%',
              opacity: isPositive || isNegative ? 1 : 0.5 
            }}
          />
        </div>
        <p className="font-mono text-xs text-text-muted mt-2">
          {isPositive ? 'Profitable' : isNegative ? 'In loss' : 'Break even'}
        </p>
      </div>
    </div>
  );
};

export default NetProfitCard;
