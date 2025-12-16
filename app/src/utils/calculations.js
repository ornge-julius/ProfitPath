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

  const targetTime = new Date(targetDate).getTime();
  if (Number.isNaN(targetTime)) {
    return startingBalance;
  }

  // Filter trades that exited before the target date
  const tradesBeforeDate = trades.filter((trade) => {
    if (!trade || !trade.exit_date) {
      return false;
    }
    const exitTime = new Date(trade.exit_date).getTime();
    if (Number.isNaN(exitTime)) {
      return false;
    }
    // Include trades that exited before the target date (not on or after)
    return exitTime < targetTime;
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

// Format date for X-axis labels (MM/DD/YYYY) without timezone conversion
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // If already in YYYY-MM-DD format, extract components directly
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  }
  
  // Handle ISO timestamp strings (YYYY-MM-DDTHH:mm:ss.sssZ)
  if (typeof dateString === 'string' && dateString.includes('T')) {
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${month}/${day}/${year}`;
  }
  
  // Fallback: try to parse as Date object, but use local date methods
  // This handles edge cases where the date might be in a different format
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    
    // Use local date methods to avoid timezone issues
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (e) {
    return dateString; // Return original if parsing fails
  }
};

// Format date for tooltips without timezone conversion
export const formatDateForTooltip = (dateString) => {
  if (!dateString) return 'Date: N/A';
  
  // If already in YYYY-MM-DD format, extract components directly
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `Date: ${month}/${day}/${year}`;
  }
  
  // Handle ISO timestamp strings (YYYY-MM-DDTHH:mm:ss.sssZ)
  if (typeof dateString === 'string' && dateString.includes('T')) {
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `Date: ${month}/${day}/${year}`;
  }
  
  // Fallback: try to parse as Date object, but use local date methods
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return `Date: ${dateString}`;
    
    // Use local date methods to avoid timezone issues
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `Date: ${month}/${day}/${year}`;
  } catch (e) {
    return `Date: ${dateString}`; // Return original if parsing fails
  }
};

// Format date for HTML date input (YYYY-MM-DD) without timezone conversion
// Handles ISO timestamps, date-only strings, and Date objects
export const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  
  // If already in YYYY-MM-DD format, return as-is
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  
  // Handle ISO timestamp strings (YYYY-MM-DDTHH:mm:ss.sssZ)
  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    return dateValue.split('T')[0];
  }
  
  // Handle Date objects - use local date methods to avoid timezone issues
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Generate chart data for cumulative profit (sorted by date)
export const generateCumulativeProfitData = (trades) => {
  if (!trades || trades.length === 0) {
    return [];
  }

  const tradesWithExitDate = trades.filter((trade) => trade && trade.exit_date && !Number.isNaN(new Date(trade.exit_date).getTime()));

  if (tradesWithExitDate.length === 0) {
    return [];
  }

  const sortedTrades = [...tradesWithExitDate].sort((a, b) => {
    const dateA = new Date(a.exit_date);
    const dateB = new Date(b.exit_date);
    return dateA - dateB;
  });

  let cumulative = 0;
  const data = [];

  sortedTrades.forEach((trade) => {
    cumulative += trade.profit || 0;
    data.push({
      date: trade.exit_date,
      cumulative: cumulative,
      profit: trade.profit
    });
  });

  return data;
};

// Generate chart data for account balance
export const generateAccountBalanceData = (trades, startingBalance) => {
  const tradesWithExitDate = trades.filter((trade) => trade && trade.exit_date && !Number.isNaN(new Date(trade.exit_date).getTime()));

  if (tradesWithExitDate.length === 0) {
    return [{ date: 'Start', balance: startingBalance, tradeNum: 0 }];
  }

  const sortedTrades = [...tradesWithExitDate].sort((a, b) => {
    const dateA = new Date(a.exit_date);
    const dateB = new Date(b.exit_date);
    return dateA - dateB;
  });

  let balance = startingBalance;
  const data = [{ date: 'Start', balance: startingBalance, tradeNum: 0 }];

  sortedTrades.forEach((trade, index) => {
    const profit = trade.profit || 0;
    balance += profit;
    data.push({
      date: trade.exit_date,
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
    .map((trade) => (trade.exit_date ? new Date(trade.exit_date) : null))
    .filter((date) => date && !isNaN(date.getTime()));

  if (exitDates.length === 0) {
    return [];
  }

  const mostRecentDate = new Date(Math.max(...exitDates.map((date) => date.getTime())));

  const startDate = new Date(mostRecentDate);
  startDate.setDate(startDate.getDate() - 30);

  const dailyData = {};

  for (let cursor = new Date(startDate); cursor <= mostRecentDate; cursor.setDate(cursor.getDate() + 1)) {
    const dateKey = cursor.toISOString().split('T')[0];
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

    const exitDate = new Date(trade.exit_date);
    if (isNaN(exitDate.getTime())) {
      return;
    }

    const dateKey = exitDate.toISOString().split('T')[0];

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
    .sort((a, b) => new Date(a.date) - new Date(b.date));
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
  return Math.ceil((new Date(exit_date) - new Date(entry_date)) / (1000 * 60 * 60 * 24));
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
    const exitDate = trade.exit_date ? new Date(trade.exit_date) : null;
    if (!exitDate || isNaN(exitDate.getTime())) {
      return;
    }

    const year = exitDate.getFullYear();
    const month = exitDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

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

// Generate cumulative P&L line chart data for batch comparison
export const generateBatchComparisonData = (currentBatch, previousBatch) => {
  if ((!currentBatch || currentBatch.length === 0) && (!previousBatch || previousBatch.length === 0)) {
    return [];
  }

  const getExitTimestamp = (trade) => {
    if (!trade || !trade.exit_date) {
      return Number.POSITIVE_INFINITY;
    }

    const timestamp = new Date(trade.exit_date).getTime();
    return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
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
      // Only include values if trade exists
      currentValue: currentTrade ? currentCumulative : null,
      previousValue: previousTrade ? previousCumulative : null
    });
  }
  
  return data;
};
