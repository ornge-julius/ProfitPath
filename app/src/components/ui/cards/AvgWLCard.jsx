import React from 'react';
import AnimatedContent from '../animation/AnimatedContent';
import { useTheme } from '../../../context/ThemeContext';

const AvgWLCard = ({ title, avgWin, avgLoss }) => {
  const { isDark } = useTheme();
  
  // Theme-aware colors
  const colors = {
    win: isDark ? '#C9A962' : '#6B8E23',
    winText: isDark ? '#0A0A0B' : '#FFFFFF',
    lossBar: isDark ? '#222225' : '#E5E0D8',
    lossText: isDark ? '#8B8B8E' : '#5A5A5D',
  };

  const calculateRatio = () => {
    if (!avgLoss || avgLoss === 0) return avgWin > 0 ? '∞' : '0.00';
    return (avgWin / avgLoss).toFixed(2);
  };

  const roundedWin = Math.round(avgWin || 0);
  const roundedLoss = Math.round(avgLoss || 0);
  
  // Normalize values for bar display
  const total = roundedWin + roundedLoss || 1;
  const winPercentage = (roundedWin / total) * 100;
  const lossPercentage = (roundedLoss / total) * 100;

  const ratio = calculateRatio();
  const isGood = ratio !== '∞' && parseFloat(ratio) >= 1;

  return (
    <div className="card-luxe p-5 h-full flex flex-col">
      {/* Header */}
      <span className="stat-label mb-1">{title}</span>

      {/* Ratio Value */}
      <p className="font-display text-3xl tracking-tight mb-4" style={{ color: isGood ? colors.win : undefined }}>
        {ratio}
        <span className="text-text-muted text-lg ml-1">:1</span>
      </p>

      {/* Bar Chart */}
      <AnimatedContent 
        key={`${roundedWin}-${roundedLoss}`}
        ease="back.out" 
        direction="horizontal" 
        distance={50} 
        duration={0.8}
        immediate={true}
      >
        <div className="flex items-stretch h-7 gap-1 rounded overflow-hidden">
          {/* Win Bar */}
          {roundedWin > 0 && (
            <div 
              className="rounded flex items-center justify-center min-w-[40px] transition-all"
              style={{ width: `${winPercentage}%`, backgroundColor: colors.win }}
            >
              <span 
                className="font-mono text-xs font-medium px-1"
                style={{ color: colors.winText }}
              >
                ${roundedWin}
              </span>
            </div>
          )}
          
          {/* Loss Bar */}
          {roundedLoss > 0 && (
            <div 
              className="rounded flex items-center justify-center min-w-[40px] transition-all"
              style={{ width: `${lossPercentage}%`, backgroundColor: colors.lossBar }}
            >
              <span 
                className="font-mono text-xs font-medium px-1"
                style={{ color: colors.lossText }}
              >
                ${roundedLoss}
              </span>
            </div>
          )}
          
          {/* No data state */}
          {roundedWin === 0 && roundedLoss === 0 && (
            <div className="flex-1 flex items-center justify-center bg-bg-surface rounded">
              <span className="font-mono text-xs text-text-muted">No data</span>
            </div>
          )}
        </div>
      </AnimatedContent>

      {/* Labels */}
      <div className="flex items-center justify-between mt-3">
        <span className="font-mono text-xs text-text-muted">Avg Win</span>
        <span className="font-mono text-xs text-text-muted">Avg Loss</span>
      </div>
    </div>
  );
};

export default AvgWLCard;
