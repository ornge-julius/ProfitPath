import { useReducer, useCallback, useEffect, useMemo } from 'react';
import { tradeReducer, TRADE_ACTIONS, initialTradeState } from '../reducers/tradeReducer';
import { calculateProfit, normalizeDate } from '../utils/calculations';
import { useSupabase } from '../supabase/SupabaseContext';

const mapTradeWithTags = (trade) => {
  const tags = trade?.trade_tags?.map((association) => association.tag).filter(Boolean) || [];
  const { trade_tags, ...rest } = trade || {};

  return {
    ...rest,
    tags
  };
};

/**
 * Trade management hook that uses Supabase via context injection.
 * Works with both web and mobile apps.
 */
export const useTradeManagement = (selectedAccountId) => {
  const supabase = useSupabase();
  const [state, dispatch] = useReducer(tradeReducer, initialTradeState);

  // Filter trades by selected account
  const accountTrades = useMemo(() => {
    return state.trades.filter(trade => trade.account_id === selectedAccountId);
  }, [state.trades, selectedAccountId]);

  const fetchTrades = useCallback(async () => {
    // Don't fetch if no account is selected
    if (!selectedAccountId) {
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          trade_tags (
            tag:tags (*)
          )
        `)
        .eq('account_id', selectedAccountId)
        .order('exit_date', { ascending: false });

      if (error) {
        return;
      }

      const tradesWithTags = (data || []).map((trade) => mapTradeWithTags(trade));

      dispatch({ type: TRADE_ACTIONS.SET_TRADES, payload: tradesWithTags });
    } catch (err) {
      // Error handling
    }
  }, [selectedAccountId, supabase]);

  useEffect(() => {
    if (selectedAccountId) {
      fetchTrades();
    }
  }, [fetchTrades, selectedAccountId]);

  const addTrade = useCallback(async (tradeData) => {
    if (!selectedAccountId) {
      return null;
    }

    const entryPrice = parseFloat(tradeData.entry_price);
    const exitPrice = parseFloat(tradeData.exit_price);
    const quantity = parseInt(tradeData.quantity, 10);
    const positionType = parseInt(tradeData.position_type, 10);

    if ([entryPrice, exitPrice, positionType].some((value) => Number.isNaN(value)) || Number.isNaN(quantity)) {
      return null;
    }

    const profit = calculateProfit(
      entryPrice,
      exitPrice,
      quantity,
      positionType
    );

    const parsedResult =
      tradeData.result === null || tradeData.result === undefined || tradeData.result === ''
        ? null
        : parseInt(tradeData.result, 10);

    const tagIds = Array.isArray(tradeData.tagIds) ? tradeData.tagIds : [];

    const newTrade = {
      symbol: tradeData.symbol,
      position_type: Number.isNaN(positionType) ? null : positionType,
      entry_price: entryPrice,
      exit_price: exitPrice,
      quantity,
      entry_date: normalizeDate(tradeData.entry_date),
      exit_date: normalizeDate(tradeData.exit_date),
      notes: tradeData.notes || '',
      reasoning: tradeData.reasoning || '',
      result: Number.isNaN(parsedResult) ? null : parsedResult,
      option: tradeData.option || '',
      source: tradeData.source || '',
      profit,
      account_id: selectedAccountId
    };

    if (tradeData.user_id) {
      newTrade.user_id = tradeData.user_id;
    }

    try {
      const { data, error } = await supabase
        .from('trades')
        .insert([newTrade])
        .select()
        .single();

      if (error) {
        return null;
      }

      if (data && tagIds.length > 0) {
        const { error: tagInsertError } = await supabase
          .from('trade_tags')
          .insert(
            tagIds.map((tagId) => ({
              trade_id: data.id,
              tag_id: tagId
            }))
          );

        if (tagInsertError) {
          throw tagInsertError;
        }
      }

      // Refetch all trades instead of just dispatching ADD_TRADE
      // This ensures proper sort order and updates all charts and metrics
      // If refetch fails, fall back to adding the trade directly to state
      try {
        await fetchTrades();
      } catch (refetchError) {
        dispatch({ type: TRADE_ACTIONS.ADD_TRADE, payload: mapTradeWithTags({ ...data, trade_tags: [] }) });
      }

      const { data: tradeWithTags } = await supabase
        .from('trades')
        .select(`
          *,
          trade_tags (
            tag:tags (*)
          )
        `)
        .eq('id', data.id)
        .single();

      return tradeWithTags ? mapTradeWithTags(tradeWithTags) : data;
    } catch (err) {
      return null;
    }
  }, [selectedAccountId, fetchTrades, supabase]);

  const updateTrade = useCallback(async (tradeData) => {
    if (!selectedAccountId) {
      return null;
    }

    const entryPrice = parseFloat(tradeData.entry_price);
    const exitPrice = parseFloat(tradeData.exit_price);
    const quantity = parseInt(tradeData.quantity, 10);
    const positionType = parseInt(tradeData.position_type, 10);

    if (!tradeData.id) {
      return null;
    }

    if ([entryPrice, exitPrice, positionType].some((value) => Number.isNaN(value)) || Number.isNaN(quantity)) {
      return null;
    }

    const profit = calculateProfit(
      entryPrice,
      exitPrice,
      quantity,
      positionType
    );

    const parsedResult =
      tradeData.result === null || tradeData.result === undefined || tradeData.result === ''
        ? null
        : parseInt(tradeData.result, 10);

    const tagIds = Array.isArray(tradeData.tagIds) ? tradeData.tagIds : [];

    const updatedTrade = {
      symbol: tradeData.symbol,
      position_type: Number.isNaN(positionType) ? null : positionType,
      entry_price: entryPrice,
      exit_price: exitPrice,
      quantity,
      entry_date: normalizeDate(tradeData.entry_date),
      exit_date: normalizeDate(tradeData.exit_date),
      notes: tradeData.notes || '',
      reasoning: tradeData.reasoning || '',
      result: Number.isNaN(parsedResult) ? null : parsedResult,
      option: tradeData.option || '',
      source: tradeData.source || '',
      profit,
      account_id: tradeData.account_id || selectedAccountId
    };

    if (tradeData.user_id) {
      updatedTrade.user_id = tradeData.user_id;
    }

    try {
      const { data, error } = await supabase
        .from('trades')
        .update(updatedTrade)
        .eq('id', tradeData.id)
        .select()
        .single();

      if (error) {
        return null;
      }

      const { error: deleteError } = await supabase
        .from('trade_tags')
        .delete()
        .eq('trade_id', tradeData.id);

      if (deleteError) {
        throw deleteError;
      }

      if (tagIds.length > 0) {
        const { error: tagInsertError } = await supabase
          .from('trade_tags')
          .insert(
            tagIds.map((tagId) => ({
              trade_id: tradeData.id,
              tag_id: tagId
            }))
          );

        if (tagInsertError) {
          throw tagInsertError;
        }
      }

      // Refetch all trades instead of just dispatching UPDATE_TRADE
      // This ensures proper sort order and updates all charts and metrics
      // If refetch fails, fall back to updating the trade directly in state
      try {
        await fetchTrades();
      } catch (refetchError) {
        dispatch({ type: TRADE_ACTIONS.UPDATE_TRADE, payload: mapTradeWithTags({ ...data, trade_tags: [] }) });
      }

      const { data: tradeWithTags } = await supabase
        .from('trades')
        .select(`
          *,
          trade_tags (
            tag:tags (*)
          )
        `)
        .eq('id', tradeData.id)
        .single();

      return tradeWithTags ? mapTradeWithTags(tradeWithTags) : data;
    } catch (err) {
      return null;
    }
  }, [selectedAccountId, fetchTrades, supabase]);

  const deleteTrade = useCallback(async (tradeId) => {
    if (!selectedAccountId) {
      return;
    }

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId);

      if (error) {
        return;
      }

      // Refetch all trades instead of just dispatching DELETE_TRADE
      // This ensures data consistency and updates all charts and metrics
      // If refetch fails, fall back to removing the trade directly from state
      try {
        await fetchTrades();
      } catch (refetchError) {
        dispatch({ type: TRADE_ACTIONS.DELETE_TRADE, payload: tradeId });
      }
    } catch (err) {
      // Error handling
    }
  }, [selectedAccountId, fetchTrades, supabase]);

  const setEditingTrade = useCallback((trade) => {
    dispatch({ type: TRADE_ACTIONS.SET_EDITING_TRADE, payload: trade });
  }, []);

  const clearEditingTrade = useCallback(() => {
    dispatch({ type: TRADE_ACTIONS.CLEAR_EDITING_TRADE });
  }, []);

  // Function to set trades for a specific account
  const setAccountTrades = useCallback((trades) => {
    dispatch({ type: TRADE_ACTIONS.SET_ACCOUNT_TRADES, payload: trades });
  }, []);

  return {
    trades: accountTrades, // Return filtered trades for current account
    allTrades: state.trades, // Return all trades for cross-account operations
    editingTrade: state.editingTrade,
    addTrade,
    updateTrade,
    deleteTrade,
    setEditingTrade,
    clearEditingTrade,
    setAccountTrades
  };
};
