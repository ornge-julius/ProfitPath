import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { parseISO, isValid } from 'date-fns';
import { normalizeDate } from '../utils/calculations';

const STORAGE_KEY = 'dashboardDateRange';

const PRESET_OPTIONS = [
  { value: 'custom', label: 'Custom Range' },
  { value: 'allTime', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'qtd', label: 'Quarter to Date' }
];

const VALID_PRESETS = new Set(PRESET_OPTIONS.map((option) => option.value));

const DEFAULT_FILTER = Object.freeze({
  preset: 'allTime',
  from: null,
  to: null,
  fromUtc: null,
  toUtc: null
});

const DateFilterContext = createContext(null);

const isValidDateInput = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toUtcStartOfDay = (dateString) => {
  if (!dateString) {
    return null;
  }

  const date = new Date(`${dateString}T00:00:00`);
  return date.toISOString();
};

const toUtcEndOfDay = (dateString) => {
  if (!dateString) {
    return null;
  }

  const date = new Date(`${dateString}T23:59:59.999`);
  return date.toISOString();
};

const getQuarterStart = (date) => {
  const month = date.getMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  const quarterStart = new Date(date);
  quarterStart.setMonth(quarterStartMonth, 1);
  quarterStart.setHours(0, 0, 0, 0);
  return quarterStart;
};

const getPresetRange = (preset) => {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  switch (preset) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { from: formatLocalDate(start), to: formatLocalDate(endOfToday) };
    }
    case 'yesterday': {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { from: formatLocalDate(start), to: formatLocalDate(end) };
    }
    case 'last7': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { from: formatLocalDate(start), to: formatLocalDate(endOfToday) };
    }
    case 'last30': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { from: formatLocalDate(start), to: formatLocalDate(endOfToday) };
    }
    case 'last90': {
      const start = new Date(now);
      start.setDate(start.getDate() - 89);
      start.setHours(0, 0, 0, 0);
      return { from: formatLocalDate(start), to: formatLocalDate(endOfToday) };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      return { from: formatLocalDate(start), to: formatLocalDate(endOfToday) };
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { from: formatLocalDate(start), to: formatLocalDate(end) };
    }
    case 'ytd': {
      const start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      return { from: formatLocalDate(start), to: formatLocalDate(endOfToday) };
    }
    case 'qtd': {
      const start = getQuarterStart(now);
      return { from: formatLocalDate(start), to: formatLocalDate(endOfToday) };
    }
    case 'allTime':
      return { from: null, to: null };
    default:
      return null;
  }
};

const buildFilter = ({ preset, from, to }) => {
  const normalizedPreset = VALID_PRESETS.has(preset) ? preset : undefined;

  if (normalizedPreset && normalizedPreset !== 'custom' && normalizedPreset !== 'allTime') {
    const range = getPresetRange(normalizedPreset);
    if (range) {
      return createFilter({ preset: normalizedPreset, ...range });
    }
  }

  if (normalizedPreset === 'allTime' && !from && !to) {
    return DEFAULT_FILTER;
  }

  if (from && !isValidDateInput(from)) {
    return null;
  }

  if (to && !isValidDateInput(to)) {
    return null;
  }

  if (from && to && from > to) {
    return null;
  }

  if (!from && !to) {
    return normalizedPreset ? createFilter({ preset: normalizedPreset }) : DEFAULT_FILTER;
  }

  return createFilter({
    preset: normalizedPreset === 'allTime' ? 'allTime' : 'custom',
    from: from || null,
    to: to || null
  });
};

const createFilter = ({ preset, from, to }) => {
  const nextPreset = preset || (from || to ? 'custom' : 'allTime');
  const normalizedFrom = from || null;
  const normalizedTo = to || null;

  return {
    preset: nextPreset,
    from: nextPreset === 'allTime' ? null : normalizedFrom,
    to: nextPreset === 'allTime' ? null : normalizedTo,
    fromUtc: nextPreset === 'allTime' || !normalizedFrom ? null : toUtcStartOfDay(normalizedFrom),
    toUtc: nextPreset === 'allTime' || !normalizedTo ? null : toUtcEndOfDay(normalizedTo)
  };
};

const getDefaultFilter = () => {
  const range = getPresetRange('thisMonth');
  if (!range) {
    return DEFAULT_FILTER;
  }
  return createFilter({ preset: 'thisMonth', ...range });
};

const readFilterFromUrl = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const presetParam = params.get('preset') || undefined;
    const fromParam = params.get('from') || undefined;
    const toParam = params.get('to') || undefined;

    if (!presetParam && !fromParam && !toParam) {
      return null;
    }

    return buildFilter({ preset: presetParam, from: fromParam, to: toParam });
  } catch (error) {
    return null;
  }
};

const readFilterFromStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return null;
    }

    const parsed = JSON.parse(storedValue);
    if (!parsed) {
      return null;
    }

    return buildFilter(parsed);
  } catch (error) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }
};

const persistFilter = (filter) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!filter || filter.preset === 'allTime') {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const { preset, from, to } = filter;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ preset, from, to })
    );
  } catch (error) {
    // Error handling
  }
};

const updateUrl = (filter) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    if (!filter || filter.preset === 'allTime') {
      params.delete('from');
      params.delete('to');
      params.delete('preset');
    } else {
      if (filter.from) {
        params.set('from', filter.from);
      } else {
        params.delete('from');
      }

      if (filter.to) {
        params.set('to', filter.to);
      } else {
        params.delete('to');
      }

      if (filter.preset && filter.preset !== 'custom') {
        params.set('preset', filter.preset);
      } else if (filter.preset === 'custom' && params.has('preset')) {
        params.delete('preset');
      }
    }

    const nextUrl = `${url.pathname}${params.toString() ? `?${params.toString()}` : ''}${url.hash}`;
    window.history.replaceState({}, '', nextUrl);
  } catch (error) {
    // Error handling
  }
};

const describeRange = (filter) => {
  if (!filter) {
    return '';
  }

  const { preset, from, to } = filter;

  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  switch (preset) {
    case 'allTime':
      return 'All Time';
    case 'today':
      return 'Today';
    case 'yesterday':
      return 'Yesterday';
    case 'last7':
      return 'Last 7 Days';
    case 'last30':
      return 'Last 30 Days';
    case 'last90':
      return 'Last 90 Days';
    case 'thisMonth':
      return 'This Month';
    case 'lastMonth':
      return 'Last Month';
    case 'ytd':
      return 'Year to Date';
    case 'qtd':
      return 'Quarter to Date';
    default:
      if (from && to) {
        return `${formatter.format(new Date(`${from}T00:00:00`))} – ${formatter.format(new Date(`${to}T00:00:00`))}`;
      }
      if (from) {
        return `From ${formatter.format(new Date(`${from}T00:00:00`))}`;
      }
      if (to) {
        return `Through ${formatter.format(new Date(`${to}T00:00:00`))}`;
      }
      return 'Custom Range';
  }
};

export const DateFilterProvider = ({ children }) => {
  const initialFilter = useMemo(() => {
    return readFilterFromUrl() || readFilterFromStorage() || getDefaultFilter();
  }, []);

  const [filter, setFilter] = useState(initialFilter);
  const previousFilter = useRef(filter);

  useEffect(() => {
    persistFilter(filter);
    updateUrl(filter);

    if (previousFilter.current !== filter) {
      previousFilter.current = filter;
    }
  }, [filter]);

  const setPreset = useCallback((preset) => {
    if (!VALID_PRESETS.has(preset)) {
      return;
    }

    if (preset === 'allTime') {
      setFilter(DEFAULT_FILTER);
      return;
    }

    if (preset === 'custom') {
      setFilter((current) => createFilter({
        preset: 'custom',
        from: current.from,
        to: current.to
      }));
      return;
    }

    const range = getPresetRange(preset);
    if (!range) {
      return;
    }

    setFilter(createFilter({ preset, ...range }));
  }, []);

  const setCustomRange = useCallback(({ from, to }) => {
    if (from && !isValidDateInput(from)) {
      return;
    }

    if (to && !isValidDateInput(to)) {
      return;
    }

    if (from && to && from > to) {
      return;
    }

    if (!from && !to) {
      setFilter(DEFAULT_FILTER);
      return;
    }

    setFilter(createFilter({ preset: 'custom', from, to }));
  }, []);

  const value = useMemo(() => ({
    filter,
    presets: PRESET_OPTIONS,
    rangeLabel: describeRange(filter),
    setPreset,
    setCustomRange,
  }), [filter, setPreset, setCustomRange]);

  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};

export const filterTradesByExitDate = (trades, filter) => {
  if (!Array.isArray(trades) || trades.length === 0) {
    return [];
  }

  if (!filter || (!filter.fromUtc && !filter.toUtc)) {
    return trades;
  }

  const fromTime = filter.fromUtc ? new Date(filter.fromUtc).getTime() : null;
  const toTime = filter.toUtc ? new Date(filter.toUtc).getTime() : null;

  return trades.filter((trade) => {
    if (!trade || !trade.exit_date) {
      return false;
    }

    const exitDateNormalized = normalizeDate(trade.exit_date);
    if (!exitDateNormalized) {
      return false;
    }

    const exitDate = parseISO(exitDateNormalized);
    if (!isValid(exitDate)) {
      return false;
    }

    const exitTime = exitDate.getTime();

    if (fromTime !== null && exitTime < fromTime) {
      return false;
    }

    if (toTime !== null && exitTime > toTime) {
      return false;
    }

    return true;
  });
};

export const isDefaultDateFilter = (filter) => {
  if (!filter) {
    return true;
  }

  return !filter.fromUtc && !filter.toUtc && filter.preset === 'allTime';
};

