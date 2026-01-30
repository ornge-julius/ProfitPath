import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TradeDetailView from '../ui/TradeDetailView';

const TradeDetailPage = ({
  trades,
  editingTrade,
  onEdit,
  onSubmit,
  onCancelEdit,
  onDelete,
  isAuthenticated
}) => {
  const { tradeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const trade = useMemo(() => {
    if (!tradeId) {
      return null;
    }

    return trades.find((item) => String(item.id) === String(tradeId)) || null;
  }, [trades, tradeId]);

  const fromPath = useMemo(() => {
    if (location.state && typeof location.state === 'object') {
      return location.state.from || null;
    }

    return null;
  }, [location.state]);

  const handleBack = () => {
    if (typeof onCancelEdit === 'function') {
      onCancelEdit();
    }

    if (fromPath) {
      navigate(fromPath);
      return;
    }

    navigate('/', { replace: true });
  };

  if (!trade) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="font-display text-display-md text-text-primary mb-4">Trade Not Found</h1>
        <p className="font-mono text-sm text-text-muted mb-8 max-w-md">
          The requested trade could not be found. It may have been deleted or belongs to a different account.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="btn-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <TradeDetailView
      trade={trade}
      onBack={handleBack}
      onEdit={onEdit}
      isEditing={Boolean(editingTrade && String(editingTrade.id) === String(trade.id))}
      onSubmit={onSubmit}
      onCancelEdit={onCancelEdit}
      onDelete={onDelete}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default TradeDetailPage;
