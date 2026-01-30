import { useMemo } from 'react';
import { filterTradesByExitDate, useDateFilter } from '../context/DateFilterContext';
import { filterTradesByTags, useTagFilter } from '../context/TagFilterContext';

/**
 * Hook that combines date and tag filtering
 * Applies date filter first, then tag filter to the result
 * @param {Array} trades - Array of trade objects to filter
 * @returns {Array} - Filtered array of trades
 */
export const useFilteredTrades = (trades) => {
  const { filter: dateFilter } = useDateFilter();
  const { selectedTagIds, filterMode } = useTagFilter();

  const filteredTrades = useMemo(() => {
    if (!Array.isArray(trades)) {
      return [];
    }

    // First apply date filter
    const dateFiltered = filterTradesByExitDate(trades, dateFilter);

    // Then apply tag filter with the selected mode
    const tagFiltered = filterTradesByTags(dateFiltered, selectedTagIds, filterMode);

    return tagFiltered;
  }, [trades, dateFilter, selectedTagIds, filterMode]);

  return filteredTrades;
};

