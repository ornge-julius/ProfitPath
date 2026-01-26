import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { getResultText, isWin, getTradeTypeText, formatDate } from '../../utils/calculations';
import TagBadge from '../ui/TagBadge';

const TradeHistoryTable = ({ trades, title }) => {
  const location = useLocation();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        enableColumnOrdering: false, // Prevent reordering of pinned column
        size: 100,
        Cell: ({ row }) => (
          <Link
            to={`/detail/${row.original.id}`}
            state={{ from: `${location.pathname}${location.search}` }}
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {row.original.symbol}
          </Link>
        ),
      },
      {
        accessorKey: 'option',
        header: 'Option',
        size: 120,
        Cell: ({ cell }) => (
          <div 
            className="text-sm text-gray-700 dark:text-gray-300 max-w-32 truncate" 
            title={cell.getValue() || ''}
          >
            {cell.getValue() || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'position_type',
        header: 'Type',
        size: 80,
        Cell: ({ cell }) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              cell.getValue() === 1
                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
            }`}
          >
            {getTradeTypeText(cell.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'entry_price',
        header: 'Entry Price',
        size: 110,
        Cell: ({ cell }) => (
          <span className="text-gray-700 dark:text-gray-300">
            ${cell.getValue()?.toFixed(2) || '0.00'}
          </span>
        ),
      },
      {
        accessorKey: 'exit_price',
        header: 'Exit Price',
        size: 110,
        Cell: ({ cell }) => (
          <span className="text-gray-700 dark:text-gray-300">
            ${cell.getValue()?.toFixed(2) || '0.00'}
          </span>
        ),
      },
      {
        accessorKey: 'quantity',
        header: 'Qty',
        size: 70,
        Cell: ({ cell }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {cell.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'entry_date',
        header: 'Entry Date',
        size: 120,
        sortingFn: 'datetime',
        Cell: ({ cell }) => (
          <span className="text-gray-700 dark:text-gray-300 text-sm">
            {formatDate(cell.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'exit_date',
        header: 'Exit Date',
        size: 120,
        sortingFn: 'datetime',
        Cell: ({ cell }) => (
          <span className="text-gray-700 dark:text-gray-300 text-sm">
            {formatDate(cell.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'profit',
        header: 'Profit',
        size: 100,
        Cell: ({ cell }) => (
          <span className={`font-bold ${cell.getValue() >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${cell.getValue()?.toLocaleString() || '0'}
          </span>
        ),
      },
      {
        accessorKey: 'result',
        header: 'Result',
        size: 90,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          if (value === undefined || value === null) {
            return <span className="text-gray-500 dark:text-gray-500 text-sm">-</span>;
          }
          return (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                isWin(value)
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
              }`}
            >
              {getResultText(value)}
            </span>
          );
        },
      },
      {
        accessorKey: 'reasoning',
        header: 'Reason',
        size: 150,
        enableSorting: false,
        Cell: ({ cell }) => (
          <div
            className="text-sm text-gray-700 dark:text-gray-300 max-w-48 truncate"
            title={cell.getValue() || ''}
          >
            {cell.getValue() || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        size: 120,
        enableSorting: false,
        Cell: ({ cell }) => (
          <div
            className="text-sm text-purple-600 dark:text-purple-300 max-w-32 truncate"
            title={cell.getValue() || ''}
          >
            {cell.getValue() || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'tags',
        header: 'Tags',
        size: 180,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5 max-w-44">
            {row.original.tags && row.original.tags.length > 0 ? (
              row.original.tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} size="small" />
              ))
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        size: 150,
        enableSorting: false,
        Cell: ({ cell }) => (
          <div
            className="text-sm text-gray-700 dark:text-gray-300 max-w-40 truncate"
            title={cell.getValue() || ''}
          >
            {cell.getValue() || '-'}
          </div>
        ),
      },
    ],
    [location.pathname, location.search]
  );

  const table = useMaterialReactTable({
    columns,
    data: trades || [],
    
    // Feature flags
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableSorting: true,
    enablePagination: true,
    enableColumnResizing: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enableHiding: false,
    
    // Initial state
    initialState: {
      sorting: [{ id: 'exit_date', desc: true }],
      columnPinning: { left: ['symbol'] },
      pagination: { pageSize: 20, pageIndex: 0 },
      density: 'comfortable',
    },
    
    // Pagination options
    paginationDisplayMode: 'pages',
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 50],
      showFirstButton: false,
      showLastButton: false,
    },
    
    // Container styling
    muiTableContainerProps: {
      sx: { maxHeight: 'calc(100vh - 250px)' },
    },
    
    // Paper (outer wrapper) styling
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: '0.75rem',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      },
      className: 'bg-white dark:bg-gray-800/50 backdrop-blur border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl',
    },
    
    // Table head styling
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 500,
        backgroundColor: 'var(--mrt-header-bg, #f9fafb)',
        '.dark &': {
          backgroundColor: 'var(--mrt-header-bg-dark, rgb(55, 65, 81))',
        },
      },
    },
    
    // Table body row styling
    muiTableBodyRowProps: {
      sx: {
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          '.dark &': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        },
      },
    },
    
    // Top toolbar customization (render custom title)
    renderTopToolbarCustomActions: () => (
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 px-2 py-1">
        {title}
      </h3>
    ),
    
    // Localization for empty state
    localization: {
      noRecordsToDisplay: 'No trades to display',
    },
  });

  return <MaterialReactTable table={table} />;
};

export default TradeHistoryTable;
