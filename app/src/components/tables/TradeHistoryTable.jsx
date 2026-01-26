import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TableSortLabel, Box } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { getResultText, isWin, getTradeTypeText, formatDate } from '../../utils/calculations';
import TagBadge from '../ui/TagBadge';

// Column configuration with sortable flags and data types
const COLUMNS = [
  { id: 'symbol', label: 'Symbol', sortable: true, type: 'string' },
  { id: 'option', label: 'Option', sortable: true, type: 'string' },
  { id: 'position_type', label: 'Type', sortable: true, type: 'number' },
  { id: 'entry_price', label: 'Entry Price', sortable: true, type: 'number' },
  { id: 'exit_price', label: 'Exit Price', sortable: true, type: 'number' },
  { id: 'quantity', label: 'Qty', sortable: true, type: 'number' },
  { id: 'entry_date', label: 'Entry Date', sortable: true, type: 'date' },
  { id: 'exit_date', label: 'Exit Date', sortable: true, type: 'date' },
  { id: 'profit', label: 'Profit', sortable: true, type: 'number' },
  { id: 'result', label: 'Result', sortable: true, type: 'number' },
  { id: 'reasoning', label: 'Reason', sortable: false },
  { id: 'source', label: 'Source', sortable: false },
  { id: 'tags', label: 'Tags', sortable: false },
  { id: 'notes', label: 'Notes', sortable: false },
];

// Comparator function for descending sort
function descendingComparator(a, b, orderBy, type) {
  let aValue = a[orderBy];
  let bValue = b[orderBy];

  // Handle null/undefined values - sort them to the end
  const aIsNull = aValue === null || aValue === undefined || aValue === '';
  const bIsNull = bValue === null || bValue === undefined || bValue === '';
  
  if (aIsNull && bIsNull) return 0;
  if (aIsNull) return 1;
  if (bIsNull) return -1;

  // Handle different data types
  if (type === 'string') {
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();
  } else if (type === 'date') {
    aValue = new Date(aValue).getTime();
    bValue = new Date(bValue).getTime();
  } else if (type === 'number') {
    aValue = Number(aValue) || 0;
    bValue = Number(bValue) || 0;
  }

  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  
  return 0;
}

// Get comparator based on order direction
function getComparator(order, orderBy, type) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy, type)
    : (a, b) => -descendingComparator(a, b, orderBy, type);
}

// Stable sort with secondary sort by exit_date descending
function stableSort(array, comparator) {
  const stabilizedArray = array.map((el, index) => [el, index]);
  stabilizedArray.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    // Secondary sort by exit_date descending for stable ordering
    const aDate = a[0].exit_date ? new Date(a[0].exit_date).getTime() : 0;
    const bDate = b[0].exit_date ? new Date(b[0].exit_date).getTime() : 0;
    if (bDate !== aDate) return bDate - aDate;
    // Fallback to original index for truly identical items
    return a[1] - b[1];
  });
  return stabilizedArray.map((el) => el[0]);
}

const TradeHistoryTable = ({ trades, title }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState('exit_date');
  const [order, setOrder] = useState('desc');
  const location = useLocation();
  const tradesPerPage = 20;

  // Sort request handler
  const handleRequestSort = (property) => {
    const column = COLUMNS.find((c) => c.id === property);
    if (!column || !column.sortable) return;

    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setCurrentPage(1); // Reset to first page on sort change
  };

  // Memoized sorted trades
  const sortedTrades = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    const column = COLUMNS.find((c) => c.id === orderBy);
    const type = column?.type || 'string';
    return stableSort([...trades], getComparator(order, orderBy, type));
  }, [trades, order, orderBy]);

  const totalPages = Math.ceil(sortedTrades.length / tradesPerPage);
  
  // Calculate paginated trades from sorted data
  const startIndex = (currentPage - 1) * tradesPerPage;
  const endIndex = startIndex + tradesPerPage;
  const paginatedTrades = sortedTrades.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200">{title}</h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-gray-900 dark:text-gray-200 rounded-md transition-colors flex items-center justify-center"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-gray-900 dark:text-gray-200 rounded-md transition-colors flex items-center justify-center"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)]">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              {COLUMNS.map((column) => {
                const isActive = orderBy === column.id;
                const isSticky = column.id === 'symbol';
                const hasWidth = column.id === 'entry_date' || column.id === 'exit_date' ? 'w-32' : 
                                 column.id === 'reasoning' ? 'w-48' : '';
                
                return (
                  <th
                    key={column.id}
                    className={`text-left py-4 px-6 font-medium text-gray-700 dark:text-gray-300 ${hasWidth} ${
                      isSticky ? 'sticky left-0 z-20 bg-gray-50 dark:bg-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]' : ''
                    }`}
                    aria-sort={isActive ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={isActive}
                        direction={isActive ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id)}
                        sx={{
                          color: 'inherit',
                          '&:hover': {
                            color: 'inherit',
                            opacity: 0.7,
                          },
                          '&.Mui-active': {
                            color: 'inherit',
                          },
                          '& .MuiTableSortLabel-icon': {
                            color: 'inherit !important',
                            opacity: isActive ? 1 : 0.5,
                          },
                        }}
                      >
                        {column.label}
                        {isActive && (
                          <Box component="span" sx={visuallyHidden}>
                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                          </Box>
                        )}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedTrades.map((trade) => {
              const formattedEntryDate = formatDate(trade.entry_date);
              const formattedExitDate = formatDate(trade.exit_date);

              return (
              <tr key={trade.id} className="group border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="py-4 px-6 sticky left-0 z-[5] bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/30 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]">
                  <Link
                    to={`/detail/${trade.id}`}
                    state={{ from: `${location.pathname}${location.search}` }}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {trade.symbol}
                  </Link>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-700 dark:text-gray-300 max-w-32 truncate" title={trade.option}>
                    {trade.option || '-'}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    trade.position_type === 1 ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                  }`}>
                    {getTradeTypeText(trade.position_type)}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">${trade.entry_price.toFixed(2)}</td>
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">${trade.exit_price.toFixed(2)}</td>
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{trade.quantity}</td>
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300 text-sm w-32">{formattedEntryDate}</td>
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300 text-sm w-32">{formattedExitDate}</td>
                <td className="py-4 px-6">
                  <span className={`font-bold ${trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${trade.profit.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {trade.result !== undefined ? (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      isWin(trade.result) ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                    }`}>
                      {getResultText(trade.result)}
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-500 text-sm">-</span>
                  )}
                </td>
                <td className="py-4 px-6 w-48">
                  <div className="text-sm text-gray-700 dark:text-gray-300 max-w-48 truncate" title={trade.reasoning}>
                    {trade.reasoning || '-'}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm text-purple-600 dark:text-purple-300 max-w-32 truncate" title={trade.source}>
                    {trade.source || '-'}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-1.5 max-w-44">
                    {trade.tags && trade.tags.length > 0 ? (
                      trade.tags.map((tag) => (
                        <TagBadge key={tag.id} tag={tag} size="small" />
                      ))
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-700 dark:text-gray-300 max-w-40 truncate" title={trade.notes}>
                    {trade.notes || '-'}
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistoryTable;
