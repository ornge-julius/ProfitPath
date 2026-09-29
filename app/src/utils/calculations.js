import { format, parseISO, isValid, isDate, differenceInDays, compareAsc } from 'date-fns';

// Normalize date to YYYY-MM-DD format (for DB storage/retrieval)
// Handles: ISO timestamps, YYYY-MM-DD strings, Date objects
export const normalizeDate = (dateValue) => {
  if (!dateValue) return null;
  
  // If already in YYYY-MM-DD format, return as-is
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  
  // Handle ISO timestamp strings - extract date part directly
  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    return dateValue.split('T')[0];
  }
  
  // Parse and format using date-fns
  try {
    const date = isDate(dateValue) ? dateValue : parseISO(dateValue);
    if (!isValid(date)) return null;
    return format(date, 'yyyy-MM-dd');
  } catch (e) {
    return null;
  }
};

// Calculate profit for a trade
export const calculateProfit = (entryPrice, exitPrice, quantity, type) => {
  const profit = (exitPrice * 100 - entryPrice * 100) * quantity;
  return profit
};

// Calculate balance at a specific date
// Returns the account balance at the start of the target date (before any trades on that date)
export const calculateBalanceAtDate = (trades, startingBalance, targetDate) => {
  if (!targetDate) {
    return startingBalance;
  }

  if (!Array.isArray(trades) || trades.length === 0) {
    return startingBalance;
  }

  const targetDateNormalized = normalizeDate(targetDate);
  if (!targetDateNormalized) {
    return startingBalance;
  }

  const targetDateObj = parseISO(targetDateNormalized);
  if (!isValid(targetDateObj)) {
    return startingBalance;
  }

  // Filter trades that exited before the target date
  const tradesBeforeDate = trades.filter((trade) => {
    if (!trade || !trade.exit_date) {
      return false;
    }
    const exitDateNormalized = normalizeDate(trade.exit_date);
    if (!exitDateNormalized) {
      return false;
    }
    const exitDateObj = parseISO(exitDateNormalized);
    if (!isValid(exitDateObj)) {
      return false;
    }
    // Include trades that exited before the target date (not on or after)
    return compareAsc(exitDateObj, targetDateObj) < 0;
  });

  // Calculate total profit from trades before the target date
  const totalProfit = tradesBeforeDate.reduce((sum, trade) => sum + (trade.profit || 0), 0);

  return startingBalance + totalProfit;
};

// Calculate trade metrics
export const calculateMetrics = (trades, startingBalance) => {
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.profit > 0).length;
  const losingTrades = trades.filter(t => t.profit < 0).length;
  const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  const avgWin = winningTrades > 0 
    ? trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0) / winningTrades 
    : 0;
  
  const avgLoss = losingTrades > 0 
    ? Math.abs(trades.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0) / losingTrades) 
    : 0;
  
  return {
    totalTrades,
    winningTrades,
    losingTrades,
    totalProfit,
    winRate,
    avgWin,
    avgLoss,
    currentBalance: startingBalance + totalProfit
  };
};

// Format date for display (MM/DD/YYYY) without timezone conversion
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const normalized = normalizeDate(dateString);
  if (!normalized) return dateString;
  
  try {
    const date = parseISO(normalized);
    if (!isValid(date)) return dateString;
    return format(date, 'MM/dd/yyyy');
  } catch (e) {
    return dateString;
  }
};

// Format date for tooltips
export const formatDateForTooltip = (dateString) => {
  if (!dateString) return 'Date: N/A';
  const formatted = formatDate(dateString);
  return formatted ? `Date: ${formatted}` : `Date: ${dateString}`;
};

// Format date for HTML date input (YYYY-MM-DD)
export const formatDateForInput = (dateValue) => {
  const normalized = normalizeDate(dateValue);
  return normalized || '';
};

// Generate chart data for cumulative profit (sorted by date)
export const generateCumulativeProfitData = (trades) => {
  if (!trades || trades.length === 0) {
    return [];
  }

  const tradesWithExitDate = trades.filter((trade) => {
    if (!trade || !trade.exit_date) return false;
    const normalized = normalizeDate(trade.exit_date);
    if (!normalized) return false;
    const date = parseISO(normalized);
    return isValid(date);
  });

  if (tradesWithExitDate.length === 0) {
    return [];
  }

  const sortedTrades = [...tradesWithExitDate].sort((a, b) => {
    const dateA = parseISO(normalizeDate(a.exit_date));
    const dateB = parseISO(normalizeDate(b.exit_date));
    return compareAsc(dateA, dateB);
  });

  let cumulative = 0;
  const data = [];

  sortedTrades.forEach((trade) => {
    cumulative += trade.profit || 0;
    data.push({
      date: normalizeDate(trade.exit_date),
      cumulative: cumulative,
      profit: trade.profit
    });
  });

  return data;
};

// Generate chart data for account balance
export const generateAccountBalanceData = (trades, startingBalance) => {
  const tradesWithExitDate = trades.filter((trade) => {
    if (!trade || !trade.exit_date) return false;
    const normalized = normalizeDate(trade.exit_date);
    if (!normalized) return false;
    const date = parseISO(normalized);
    return isValid(date);
  });

  if (tradesWithExitDate.length === 0) {
    return [{ date: 'Start', balance: startingBalance, tradeNum: 0 }];
  }

  const sortedTrades = [...tradesWithExitDate].sort((a, b) => {
    const dateA = parseISO(normalizeDate(a.exit_date));
    const dateB = parseISO(normalizeDate(b.exit_date));
    return compareAsc(dateA, dateB);
  });

  let balance = startingBalance;
  const data = [{ date: 'Start', balance: startingBalance, tradeNum: 0 }];

  sortedTrades.forEach((trade, index) => {
    const profit = trade.profit || 0;
    balance += profit;
    data.push({
      date: normalizeDate(trade.exit_date),
      balance,
      tradeNum: index + 1
    });
  });

  return data;
};

// Generate last 30 days net P&L data
export const generateLast30DaysNetPNLData = (trades) => {
  if (!trades || trades.length === 0) {
    return [];
  }

  const exitDates = trades
    .map((trade) => {
      if (!trade.exit_date) return null;
      const normalized = normalizeDate(trade.exit_date);
      if (!normalized) return null;
      return parseISO(normalized);
    })
    .filter((date) => date && isValid(date));

  if (exitDates.length === 0) {
    return [];
  }

  const mostRecentDate = new Date(Math.max(...exitDates.map((date) => date.getTime())));

  const startDate = new Date(mostRecentDate);
  startDate.setDate(startDate.getDate() - 30);

  const dailyData = {};

  for (let cursor = new Date(startDate); cursor <= mostRecentDate; cursor.setDate(cursor.getDate() + 1)) {
    const dateKey = format(cursor, 'yyyy-MM-dd');
    const formattedDate = formatDate(dateKey);
    dailyData[dateKey] = {
      date: dateKey,
      dateLabel: formattedDate,
      monthFull: formattedDate,
      netPNL: 0,
      isPositive: true
    };
  }

  trades.forEach((trade) => {
    if (!trade.exit_date) {
      return;
    }

    const exitDateNormalized = normalizeDate(trade.exit_date);
    if (!exitDateNormalized) {
      return;
    }

    const exitDate = parseISO(exitDateNormalized);
    if (!isValid(exitDate)) {
      return;
    }

    const dateKey = format(exitDate, 'yyyy-MM-dd');

    if (exitDate >= startDate && exitDate <= mostRecentDate && dailyData[dateKey]) {
      dailyData[dateKey].netPNL += trade.profit || 0;
    }
  });

  return Object.values(dailyData)
    .map((item) => {
      const formattedDate = formatDate(item.date);
      return {
        ...item,
        dateLabel: formattedDate,
        monthFull: formattedDate,
        isPositive: item.netPNL >= 0
      };
    })
    .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
};

// Generate trimmed balance trend data for mini charts
export const generateBalanceTrendData = (accountBalanceData, pointCount = 10) => {
  if (!accountBalanceData || accountBalanceData.length === 0) {
    return [];
  }

  const lastPoints = accountBalanceData.slice(-pointCount);

  return lastPoints.map((point) => ({
    balance: point.balance ?? point.value ?? 0
  }));
};

// Generate win/loss data for pie chart
export const generateWinLossData = (winningTrades, losingTrades) => [
  { name: 'Winning Trades', value: winningTrades, color: '#10B981' },
  { name: 'Losing Trades', value: losingTrades, color: '#EF4444' }
];

// Calculate trade duration in days
export const calculateTradeDuration = (entry_date, exit_date) => {
  const entryNormalized = normalizeDate(entry_date);
  const exitNormalized = normalizeDate(exit_date);
  
  if (!entryNormalized || !exitNormalized) {
    return 0;
  }
  
  const entryDate = parseISO(entryNormalized);
  const exitDate = parseISO(exitNormalized);
  
  if (!isValid(entryDate) || !isValid(exitDate)) {
    return 0;
  }
  
  return Math.max(0, differenceInDays(exitDate, entryDate) + 1); // +1 to include both days
};

// Calculate return percentage
export const calculateReturnPercentage = (entryPrice, exitPrice) => {
  return ((exitPrice - entryPrice) / entryPrice) * 100;
};

// Convert numeric result to text
export const getResultText = (result) => {
  if (result === 1) return 'WIN';
  if (result === 0) return 'LOSS';
  return '';
};

// Convert text result to numeric
export const getResultNumber = (resultText) => {
  if (resultText === 'WIN') return 1;
  if (resultText === 'LOSS') return 0;
  return undefined;
};

// Check if trade is a win based on numeric result
export const isWin = (result) => result === 1;

// Check if trade is a loss based on numeric result
export const isLoss = (result) => result === 0;

// Convert numeric trade type to text
export const getTradeTypeText = (type) => {
  if (type === 1) return 'CALL';
  if (type === 2) return 'PUT';
  return '';
};

// Convert text trade type to numeric
export const getTradeTypeNumber = (typeText) => {
  if (typeText === 'CALL') return 1;
  if (typeText === 'PUT') return 2;
  return undefined;
};

// Check if trade type is CALL
export const isCall = (type) => type === 1;

// Check if trade type is PUT
export const isPut = (type) => type === 2;

// Generate monthly net P&L data
export const generateMonthlyNetPNLData = (trades) => {
  if (!trades || trades.length === 0) {
    return [];
  }

  const monthlyData = {};

  trades.forEach((trade) => {
    if (!trade.exit_date) {
      return;
    }
    
    const exitDateNormalized = normalizeDate(trade.exit_date);
    if (!exitDateNormalized) {
      return;
    }
    
    const exitDate = parseISO(exitDateNormalized);
    if (!isValid(exitDate)) {
      return;
    }

    const year = exitDate.getFullYear();
    const month = exitDate.getMonth();
    const monthKey = format(exitDate, 'yyyy-MM');

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        monthKey,
        year,
        month,
        netPNL: 0,
        count: 0
      };
    }

    monthlyData[monthKey].netPNL += trade.profit || 0;
    monthlyData[monthKey].count += 1;
  });

  const dataArray = Object.values(monthlyData).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return dataArray.map((item) => ({
    monthKey: item.monthKey,
    monthLabel: monthLabels[item.month],
    monthFull: `${monthLabels[item.month]} ${item.year}`,
    netPNL: item.netPNL,
    year: item.year,
    monthIndex: item.month,
    tradeCount: item.count
  }));
};

// Calculate trade batches (current and previous batch of up to 10 trades each)
// Trades are ordered by entry_date descending (newest first, index 0 = most recent)
export const calculateTradeBatches = (trades) => {
  const totalTrades = trades.length;
  
  if (totalTrades === 0) {
    return { currentBatch: [], previousBatch: [] };
  }
  
  // Special case: 10 or fewer trades - show same data for both batches
  if (totalTrades <= 10) {
    const allTrades = trades.slice(0); // Copy all trades
    return { currentBatch: allTrades, previousBatch: allTrades };
  }
  
  // Normal case: 11+ trades
  const remainder = totalTrades % 10;
  
  // Current batch (most recent up to 10 trades)
  let currentBatchStart = 0;
  let currentBatchEnd;
  
  if (remainder === 0) {
    // Exactly a multiple of 10: current batch is the last 10
    currentBatchEnd = 9;
  } else {
    // Incomplete batch: current batch is the remainder
    currentBatchEnd = remainder - 1;
  }
  
  const currentBatch = trades.slice(currentBatchStart, currentBatchEnd + 1);
  
  // Previous batch (previous 10 trades)
  let previousBatchStart;
  let previousBatchEnd;
  
  if (remainder === 0) {
    // If current batch is exactly 10, previous batch starts at index 10
    previousBatchStart = 10;
    previousBatchEnd = Math.min(19, totalTrades - 1);
  } else {
    // Current batch is incomplete, previous batch starts after it
    previousBatchStart = remainder;
    previousBatchEnd = Math.min(remainder + 9, totalTrades - 1);
  }
  
  const previousBatch = trades.slice(previousBatchStart, previousBatchEnd + 1);
  
  return { currentBatch, previousBatch };
};

// Generate win/loss chart data for a batch
export const generateWinLossChartData = (batch) => {
  if (!batch || batch.length === 0) {
    return [
      { name: 'Wins', value: 0, color: '#10B981' },
      { name: 'Losses', value: 100, color: '#111827' }
    ];
  }
  
  const winningTrades = batch.filter(t => t.profit > 0 || t.result === 1).length;
  const totalTrades = batch.length;
  
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const lossRate = 100 - winRate;
  
  return [
    { name: 'Wins', value: winRate, color: '#10B981' },
    { name: 'Losses', value: lossRate, color: '#111827' }
  ];
};

// Generate a map of every day that has at least one closed trade to its net P&L
// Used to paint the calendar view; keyed by normalized YYYY-MM-DD exit date
export const generateDailyPNLMap = (trades) => {
  const map = {};

  if (!Array.isArray(trades) || trades.length === 0) {
    return map;
  }

  trades.forEach((trade) => {
    if (!trade || !trade.exit_date) {
      return;
    }

    const dateKey = normalizeDate(trade.exit_date);
    if (!dateKey) {
      return;
    }

    if (!map[dateKey]) {
      map[dateKey] = { date: dateKey, netPNL: 0, tradeCount: 0, wins: 0, losses: 0 };
    }

    map[dateKey].netPNL += trade.profit || 0;
    map[dateKey].tradeCount += 1;
    if (trade.profit > 0) {
      map[dateKey].wins += 1;
    } else if (trade.profit < 0) {
      map[dateKey].losses += 1;
    }
  });

  return map;
};

// Aggregate trade performance by tag (win rate, net P&L, trade count per tag)
export const generateTagPerformanceData = (trades) => {
  if (!Array.isArray(trades) || trades.length === 0) {
    return [];
  }

  const byTag = {};

  trades.forEach((trade) => {
    const tags = Array.isArray(trade?.tags) ? trade.tags : [];
    tags.forEach((tag) => {
      if (!tag || !tag.id) return;

      if (!byTag[tag.id]) {
        byTag[tag.id] = {
          id: tag.id,
          name: tag.name || 'Untitled',
          color: tag.color || '#C9A962',
          count: 0,
          wins: 0,
          netPNL: 0
        };
      }

      byTag[tag.id].count += 1;
      byTag[tag.id].netPNL += trade.profit || 0;
      if (trade.profit > 0) {
        byTag[tag.id].wins += 1;
      }
    });
  });

  return Object.values(byTag)
    .map((entry) => ({
      ...entry,
      winRate: entry.count > 0 ? (entry.wins / entry.count) * 100 : 0
    }))
    .sort((a, b) => b.netPNL - a.netPNL);
};

// Aggregate trade performance by day of week (Sunday first, matching Date#getDay)
export const generateDayOfWeekPerformanceData = (trades) => {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const buckets = DAY_LABELS.map((label, index) => ({
    day: index,
    label,
    count: 0,
    wins: 0,
    netPNL: 0
  }));

  if (!Array.isArray(trades) || trades.length === 0) {
    return buckets.map((bucket) => ({ ...bucket, winRate: 0 }));
  }

  trades.forEach((trade) => {
    if (!trade || !trade.exit_date) return;
    const normalized = normalizeDate(trade.exit_date);
    if (!normalized) return;
    const date = parseISO(normalized);
    if (!isValid(date)) return;

    const bucket = buckets[date.getDay()];
    bucket.count += 1;
    bucket.netPNL += trade.profit || 0;
    if (trade.profit > 0) {
      bucket.wins += 1;
    }
  });

  return buckets.map((bucket) => ({
    ...bucket,
    winRate: bucket.count > 0 ? (bucket.wins / bucket.count) * 100 : 0
  }));
};

// Compare CALL vs PUT performance
export const generatePositionTypePerformanceData = (trades) => {
  const types = [
    { type: 1, label: 'CALL', count: 0, wins: 0, netPNL: 0 },
    { type: 2, label: 'PUT', count: 0, wins: 0, netPNL: 0 }
  ];

  if (Array.isArray(trades)) {
    trades.forEach((trade) => {
      const bucket = types.find((t) => t.type === trade.position_type);
      if (!bucket) return;
      bucket.count += 1;
      bucket.netPNL += trade.profit || 0;
      if (trade.profit > 0) {
        bucket.wins += 1;
      }
    });
  }

  return types.map((bucket) => ({
    ...bucket,
    winRate: bucket.count > 0 ? (bucket.wins / bucket.count) * 100 : 0
  }));
};

// Calculate current streak and longest win/loss streaks (ordered by exit date ascending)
export const calculateStreaks = (trades) => {
  const empty = { currentType: null, currentCount: 0, longestWinStreak: 0, longestLossStreak: 0 };

  if (!Array.isArray(trades) || trades.length === 0) {
    return empty;
  }

  const decided = trades.filter((trade) => trade && trade.exit_date && trade.profit !== 0 && trade.profit !== undefined);
  if (decided.length === 0) {
    return empty;
  }

  const ordered = [...decided].sort((a, b) => {
    const dateA = parseISO(normalizeDate(a.exit_date));
    const dateB = parseISO(normalizeDate(b.exit_date));
    return compareAsc(dateA, dateB);
  });

  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let runType = null;
  let runCount = 0;

  ordered.forEach((trade) => {
    const isWinTrade = trade.profit > 0;
    const type = isWinTrade ? 'W' : 'L';

    if (type === runType) {
      runCount += 1;
    } else {
      runType = type;
      runCount = 1;
    }

    if (type === 'W') {
      longestWinStreak = Math.max(longestWinStreak, runCount);
    } else {
      longestLossStreak = Math.max(longestLossStreak, runCount);
    }
  });

  return {
    currentType: runType,
    currentCount: runCount,
    longestWinStreak,
    longestLossStreak
  };
};

// Profit factor, expectancy, and average hold time in one bundle for the Insights page
export const calculateAdvancedMetrics = (trades) => {
  if (!Array.isArray(trades) || trades.length === 0) {
    return { profitFactor: 0, expectancy: 0, avgHoldDays: 0 };
  }

  const grossWin = trades.filter((t) => t.profit > 0).reduce((sum, t) => sum + t.profit, 0);
  const grossLoss = Math.abs(trades.filter((t) => t.profit < 0).reduce((sum, t) => sum + t.profit, 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : (grossWin > 0 ? Infinity : 0);

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.profit > 0).length;
  const losingTrades = trades.filter((t) => t.profit < 0).length;
  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
  const lossRate = totalTrades > 0 ? losingTrades / totalTrades : 0;
  const avgWin = winningTrades > 0 ? grossWin / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;
  const expectancy = (winRate * avgWin) - (lossRate * avgLoss);

  const holdDurations = trades
    .filter((t) => t.entry_date && t.exit_date)
    .map((t) => calculateTradeDuration(t.entry_date, t.exit_date));
  const avgHoldDays = holdDurations.length > 0
    ? holdDurations.reduce((sum, d) => sum + d, 0) / holdDurations.length
    : 0;

  return { profitFactor, expectancy, avgHoldDays };
};

// Generate cumulative P&L line chart data for batch comparison
export const generateBatchComparisonData = (currentBatch, previousBatch) => {
  if ((!currentBatch || currentBatch.length === 0) && (!previousBatch || previousBatch.length === 0)) {
    return [];
  }

  const getExitTimestamp = (trade) => {
    if (!trade || !trade.exit_date) {
      return Number.POSITIVE_INFINITY;
    }

    const exitDateNormalized = normalizeDate(trade.exit_date);
    if (!exitDateNormalized) {
      return Number.POSITIVE_INFINITY;
    }

    const exitDate = parseISO(exitDateNormalized);
    if (!isValid(exitDate)) {
      return Number.POSITIVE_INFINITY;
    }

    return exitDate.getTime();
  };

  const sortByExitDate = (batch) => {
    if (!Array.isArray(batch)) {
      return [];
    }

    return [...batch].sort((a, b) => getExitTimestamp(a) - getExitTimestamp(b));
  };

  const orderedCurrentBatch = sortByExitDate(currentBatch);
  const orderedPreviousBatch = sortByExitDate(previousBatch);

  const maxLength = Math.max(orderedCurrentBatch.length, orderedPreviousBatch.length);
  const data = [];

  let currentCumulative = 0;
  let previousCumulative = 0;

  for (let i = 0; i < maxLength; i++) {
    const currentTrade = orderedCurrentBatch[i];
    const previousTrade = orderedPreviousBatch[i];

    if (currentTrade) {
      currentCumulative += currentTrade.profit || 0;
    }
    
    if (previousTrade) {
      previousCumulative += previousTrade.profit || 0;
    }
    
    data.push({
      tradeNumber: i + 1,
      currentCumulative: currentCumulative,
      previousCumulative: previousCumulative,
      currentValue: currentTrade ? currentCumulative : null,
      previousValue: previousTrade ? previousCumulative : null
    });
  }
  
  return data;
};
