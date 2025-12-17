import React, { useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useFilteredTrades } from '../../hooks/useFilteredTrades';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useTagFilter } from '../../context/TagFilterContext';
import TradeHistoryTable from '../tables/TradeHistoryTable';

const TradeHistoryView = ({ trades, onToggleTradeForm }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { setSelectedTags, setMode, FILTER_MODES } = useTagFilter();
  const filteredTrades = useFilteredTrades(trades);

  const selectedTagIdsFromState = useMemo(() => {
    if (!location.state || typeof location.state !== 'object') {
      return null;
    }

    return Array.isArray(location.state.selectedTagIds)
      ? location.state.selectedTagIds
      : null;
  }, [location.state]);

  useEffect(() => {
    if (selectedTagIdsFromState && selectedTagIdsFromState.length > 0) {
      setSelectedTags(selectedTagIdsFromState);
      setMode(FILTER_MODES.OR);
    }
  }, [selectedTagIdsFromState, setSelectedTags, setMode, FILTER_MODES]);

  const fromTagsPage = useMemo(() => {
    if (!location.state || typeof location.state !== 'object') {
      return false;
    }

    return location.state.from === '/tags';
  }, [location.state]);

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {fromTagsPage && (
            <button
              type="button"
              onClick={() => navigate('/tags')}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800/70 dark:text-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tags
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trade History</h1>
        </div>
        {isAuthenticated && (
          <Fab
            aria-label="add trade"
            onClick={onToggleTradeForm}
            sx={{
              backgroundColor: '#10B981',
              border: isDark ? '1px solid #000000' : 'none',
              color: isDark ? '#000000' : '#FFFFFF',
              '&:hover': {
                backgroundColor: '#059669',
              },
              zIndex: 10,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <AddIcon />
          </Fab>
        )}
        {!isAuthenticated && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign in to add trades
          </p>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <TradeHistoryTable trades={filteredTrades} />
      </div>
    </div>
  );
};

export default TradeHistoryView;

