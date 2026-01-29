import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { subDays, startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth, startOfYear, format, parseISO, isValid, isWithinInterval } from 'date-fns';
import { storageJson } from '../utils/storage';
import { normalizeDate } from '@profitpath/shared';

const STORAGE_KEY = 'profitpath_date_filter';

// Filter type constants
export const DATE_FILTER_TYPES = {
  ALL_TIME: 'ALL_TIME',
  LAST_7_DAYS: 'LAST_7_DAYS',
  LAST_30_DAYS: 'LAST_30_DAYS',
  THIS_MONTH: 'THIS_MONTH',
  LAST_MONTH: 'LAST_MONTH',
  YEAR_TO_DATE: 'YEAR_TO_DATE',
  CUSTOM: 'CUSTOM'
};

// Get default filter (All Time)
const getDefaultFilter = () => ({
  type: DATE_FILTER_TYPES.ALL_TIME,
  startDate: null,
  endDate: null
});

// Build filter dates based on type
const buildFilter = (filterConfig) => {
  if (!filterConfig || !filterConfig.type) {
    return getDefaultFilter();
  }

  const now = new Date();

  switch (filterConfig.type) {
    case DATE_FILTER_TYPES.ALL_TIME:
      return { type: filterConfig.type, startDate: null, endDate: null };
    
    case DATE_FILTER_TYPES.LAST_7_DAYS:
      return {
        type: filterConfig.type,
        startDate: startOfDay(subDays(now, 6)),
        endDate: endOfDay(now)
      };
    
    case DATE_FILTER_TYPES.LAST_30_DAYS:
      return {
        type: filterConfig.type,
        startDate: startOfDay(subDays(now, 29)),
        endDate: endOfDay(now)
      };
    
    case DATE_FILTER_TYPES.THIS_MONTH:
      return {
        type: filterConfig.type,
        startDate: startOfMonth(now),
        endDate: endOfDay(now)
      };
    
    case DATE_FILTER_TYPES.LAST_MONTH: {
      const lastMonth = subMonths(now, 1);
      return {
        type: filterConfig.type,
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth)
      };
    }
    
    case DATE_FILTER_TYPES.YEAR_TO_DATE:
      return {
        type: filterConfig.type,
        startDate: startOfYear(now),
        endDate: endOfDay(now)
      };
    
    case DATE_FILTER_TYPES.CUSTOM:
      return {
        type: filterConfig.type,
        startDate: filterConfig.startDate ? new Date(filterConfig.startDate) : null,
        endDate: filterConfig.endDate ? new Date(filterConfig.endDate) : null
      };
    
    default:
      return getDefaultFilter();
  }
};

const DateFilterContext = createContext(null);

export const DateFilterProvider = ({ children }) => {
  // Initialize with default value so consumers always have usable data
  const [filter, setFilterState] = useState(getDefaultFilter());
  const [isLoading, setIsLoading] = useState(true);

  // Async initialization - updates filter once storage is read
  useEffect(() => {
    const loadPersistedFilter = async () => {
      try {
        const stored = await storageJson.get(STORAGE_KEY);
        if (stored && stored.type) {
          setFilterState(buildFilter(stored));
        }
        // If no stored value, keep the default (already set in useState)
      } catch (error) {
        console.error('Error loading date filter:', error);
        // Keep default on error
      } finally {
        setIsLoading(false);
      }
    };
    loadPersistedFilter();
  }, []);

  // Async persistence (fire-and-forget)
  useEffect(() => {
    if (!isLoading) {
      const toStore = {
        type: filter.type,
        startDate: filter.startDate?.toISOString() || null,
        endDate: filter.endDate?.toISOString() || null
      };
      storageJson.set(STORAGE_KEY, toStore).catch(() => {});
    }
  }, [filter, isLoading]);

  // Setter that rebuilds filter dates based on type
  const setFilter = useCallback((newFilter) => {
    setFilterState(buildFilter(newFilter));
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    filter,
    setFilter,
    isLoading,
    DATE_FILTER_TYPES
  }), [filter, setFilter, isLoading]);

  // ALWAYS render the Provider - never return null
  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter must be used within DateFilterProvider');
  }
  return context;
};

/**
 * Filter trades by exit date based on the current date filter.
 */
export const filterTradesByExitDate = (trades, filter) => {
  if (!Array.isArray(trades)) return [];
  
  // All Time - return all trades
  if (filter.type === DATE_FILTER_TYPES.ALL_TIME || (!filter.startDate && !filter.endDate)) {
    return trades;
  }

  return trades.filter((trade) => {
    if (!trade.exit_date) return false;
    
    const exitDateNormalized = normalizeDate(trade.exit_date);
    if (!exitDateNormalized) return false;
    
    const exitDate = parseISO(exitDateNormalized);
    if (!isValid(exitDate)) return false;

    // Check if within interval
    if (filter.startDate && filter.endDate) {
      return isWithinInterval(exitDate, {
        start: startOfDay(filter.startDate),
        end: endOfDay(filter.endDate)
      });
    }

    // Only start date
    if (filter.startDate) {
      return exitDate >= startOfDay(filter.startDate);
    }

    // Only end date
    if (filter.endDate) {
      return exitDate <= endOfDay(filter.endDate);
    }

    return true;
  });
};
