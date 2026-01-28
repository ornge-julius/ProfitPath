import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getResultText, isWin, getTradeTypeText, formatDate } from '../../utils/calculations';
import TagBadge from '../ui/TagBadge';

// Column configuration with sortable flags and data types
const COLUMNS = [
  { id: 'symbol', label: 'Symbol', sortable: true, type: 'string' },
  { id: 'option', label: 'Option', sortable: true, type: 'string' },
  { id: 'position_type', label: 'Type', sortable: true, type: 'number' },
  { id: 'entry_price', label: 'Entry', sortable: true, type: 'number' },
  { id: 'exit_price', label: 'Exit', sortable: true, type: 'number' },
  { id: 'quantity', label: 'Qty', sortable: true, type: 'number' },
  { id: 'entry_date', label: 'Entry Date', sortable: true, type: 'date' },
  { id: 'exit_date', label: 'Exit Date', sortable: true, type: 'date' },
  { id: 'profit', label: 'P&L', sortable: true, type: 'number' },
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

  const aIsNull = aValue === null || aValue === undefined || aValue === '';
  const bIsNull = bValue === null || bValue === undefined || bValue === '';
  
  if (aIsNull && bIsNull) return 0;
  if (aIsNull) return 1;
  if (bIsNull) return -1;

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

function getComparator(order, orderBy, type) {
  return (a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];
    const aIsNull = aValue === null || aValue === undefined || aValue === '';
    const bIsNull = bValue === null || bValue === undefined || bValue === '';
    
    if (aIsNull && bIsNull) return 0;
    if (aIsNull) return 1;
    if (bIsNull) return -1;
    
    const result = descendingComparator(a, b, orderBy, type);
    return order === 'desc' ? result : -result;
  };
}

function stableSort(array, comparator) {
  const stabilizedArray = array.map((el, index) => [el, index]);
  stabilizedArray.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    const aDate = a[0].exit_date ? new Date(a[0].exit_date).getTime() : 0;
    const bDate = b[0].exit_date ? new Date(b[0].exit_date).getTime() : 0;
    if (bDate !== aDate) return bDate - aDate;
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

  const handleRequestSort = (property) => {
    const column = COLUMNS.find((c) => c.id === property);
    if (!column || !column.sortable) return;

    if (orderBy === property) {
      const isAsc = order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
    } else {
      if (column.type === 'number' || column.type === 'date') {
        setOrder('desc');
      } else {
        setOrder('asc');
      }
    }
    setOrderBy(property);
    setCurrentPage(1);
  };

  const sortedTrades = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    const column = COLUMNS.find((c) => c.id === orderBy);
    const type = column?.type || 'string';
    return stableSort([...trades], getComparator(order, orderBy, type));
  }, [trades, order, orderBy]);

  const totalPages = Math.ceil(sortedTrades.length / tradesPerPage);
  
  const startIndex = (currentPage - 1) * tradesPerPage;
  const endIndex = startIndex + tradesPerPage;
  const paginatedTrades = sortedTrades.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const SortIcon = ({ columnId }) => {
    const isActive = orderBy === columnId;
    if (!isActive) return <ArrowUpDown className="w-3 h-3 text-text-muted" />;
    return order === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-gold" />
      : <ArrowDown className="w-3 h-3 text-gold" />;
  };

  return (
    <div className="card-luxe overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="font-display text-xl text-text-primary">{title || 'Trade History'}</h3>
          <p className="font-mono text-xs text-text-muted mt-0.5">
            {sortedTrades.length} trade{sortedTrades.length !== 1 ? 's' : ''}
          </p>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-border hover:border-border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4 text-text-secondary" />
            </button>
            <span className="font-mono text-xs text-text-muted px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-border hover:border-border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4 text-text-secondary" />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)]">
        <table className="w-full">
          <thead className="bg-bg-surface sticky top-0 z-10">
            <tr>
              {COLUMNS.map((column) => {
                const isActive = orderBy === column.id;
                const isSticky = column.id === 'symbol';
                
                return (
                  <th
                    key={column.id}
                    className={`text-left py-3 px-4 font-mono text-xs font-medium tracking-wider uppercase text-text-muted whitespace-nowrap ${
                      isSticky ? 'sticky left-0 z-20 bg-bg-surface' : ''
                    }`}
                    aria-sort={isActive ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleRequestSort(column.id)}
                        className={`inline-flex items-center gap-1.5 hover:text-text-primary transition-colors ${
                          isActive ? 'text-gold' : ''
                        }`}
                      >
                        {column.label}
                        <SortIcon columnId={column.id} />
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedTrades.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="py-12 text-center">
                  <p className="font-mono text-sm text-text-muted">No trades found</p>
                </td>
              </tr>
            ) : (
              paginatedTrades.map((trade) => {
                const formattedEntryDate = formatDate(trade.entry_date);
                const formattedExitDate = formatDate(trade.exit_date);

                return (
                  <tr 
                    key={trade.id} 
                    className="group border-t border-border-subtle hover:bg-bg-surface/50 transition-colors"
                  >
                    {/* Symbol - Sticky */}
                    <td className="py-3 px-4 sticky left-0 z-[5] bg-bg-card group-hover:bg-bg-surface/50 transition-colors">
                      <Link
                        to={`/detail/${trade.id}`}
                        state={{ from: `${location.pathname}${location.search}` }}
                        className="font-mono text-sm font-medium text-gold hover:text-gold-light transition-colors"
                      >
                        {trade.symbol}
                      </Link>
                    </td>

                    {/* Option */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-text-secondary max-w-28 truncate block" title={trade.option}>
                        {trade.option || '—'}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        trade.position_type === 1 ? 'badge-win' : 'badge-loss'
                      }`}>
                        {getTradeTypeText(trade.position_type)}
                      </span>
                    </td>

                    {/* Entry Price */}
                    <td className="py-3 px-4 font-mono text-sm text-text-secondary">
                      ${trade.entry_price.toFixed(2)}
                    </td>

                    {/* Exit Price */}
                    <td className="py-3 px-4 font-mono text-sm text-text-secondary">
                      ${trade.exit_price.toFixed(2)}
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4 font-mono text-sm text-text-secondary">
                      {trade.quantity}
                    </td>

                    {/* Entry Date */}
                    <td className="py-3 px-4 font-mono text-xs text-text-muted">
                      {formattedEntryDate}
                    </td>

                    {/* Exit Date */}
                    <td className="py-3 px-4 font-mono text-xs text-text-muted">
                      {formattedExitDate}
                    </td>

                    {/* Profit */}
                    <td className="py-3 px-4">
                      <span className={`font-mono text-sm font-medium ${
                        trade.profit >= 0 ? 'text-gold' : 'text-loss'
                      }`}>
                        {trade.profit >= 0 ? '+' : ''}${trade.profit.toLocaleString()}
                      </span>
                    </td>

                    {/* Result */}
                    <td className="py-3 px-4">
                      {trade.result !== undefined ? (
                        <span className={`badge ${
                          isWin(trade.result) ? 'badge-win' : 'badge-loss'
                        }`}>
                          {getResultText(trade.result)}
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>

                    {/* Reasoning */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-text-secondary max-w-40 truncate block" title={trade.reasoning}>
                        {trade.reasoning || '—'}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-text-muted max-w-24 truncate block" title={trade.source}>
                        {trade.source || '—'}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-36">
                        {trade.tags && trade.tags.length > 0 ? (
                          trade.tags.map((tag) => (
                            <TagBadge key={tag.id} tag={tag} size="small" />
                          ))
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-text-muted max-w-32 truncate block" title={trade.notes}>
                        {trade.notes || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistoryTable;
