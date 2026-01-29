import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme, colors } from '../context/ThemeContext';
import { useDateFilter, filterTradesByExitDate } from '../context/DateFilterContext';
import { useTagFilter, filterTradesByTags } from '../context/TagFilterContext';
import { useAppStateContext } from '../context/AppStateContext';
import { useAuth, useTradeManagement, formatDate, getResultText, isWin, getTradeTypeText } from '@profitpath/shared';

// Trade Row Component with swipe to delete
const TradeRow = ({ trade, isDark, onPress, onDelete }) => {
  const themeColors = isDark ? colors.dark : colors.light;
  const isWinning = isWin(trade.result) || trade.profit > 0;
  
  const formatCurrency = (value) => {
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return value < 0 ? `-${formatted}` : formatted;
  };

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => onDelete?.(trade.id)}
    >
      <Text style={styles.deleteActionText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.tradeRow, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
        onPress={() => onPress?.(trade)}
        activeOpacity={0.7}
      >
        <View style={styles.tradeLeft}>
          <View style={styles.tradeHeader}>
            <Text style={[styles.symbol, { color: themeColors.text }]}>{trade.symbol}</Text>
            <View style={[
              styles.typeBadge,
              { backgroundColor: trade.position_type === 1 ? '#10B98120' : '#EF444420' }
            ]}>
              <Text style={[
                styles.typeText,
                { color: trade.position_type === 1 ? themeColors.success : themeColors.danger }
              ]}>
                {getTradeTypeText(trade.position_type)}
              </Text>
            </View>
          </View>
          <Text style={[styles.tradeDate, { color: themeColors.textSecondary }]}>
            {formatDate(trade.exit_date)}
          </Text>
        </View>
        
        <View style={styles.tradeRight}>
          <Text style={[
            styles.profit,
            { color: isWinning ? themeColors.success : themeColors.danger }
          ]}>
            {formatCurrency(trade.profit)}
          </Text>
          <Text style={[
            styles.resultBadge,
            { color: isWinning ? themeColors.success : themeColors.danger }
          ]}>
            {getResultText(trade.result)}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default function TradeHistoryScreen({ navigation }) {
  const { isDark, isLoading: themeLoading } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  
  const { user, isLoading: authLoading } = useAuth();
  const { filter, isLoading: dateFilterLoading } = useDateFilter();
  const { selectedTagIds, filterMode, isLoading: tagFilterLoading } = useTagFilter();
  const { selectedAccountId, selectedAccount } = useAppStateContext();
  
  const { trades, isLoading: tradesLoading, deleteTrade, refreshTrades } = useTradeManagement(selectedAccountId);

  const [refreshing, setRefreshing] = useState(false);

  // Apply filters
  const filteredTrades = useMemo(() => {
    if (!Array.isArray(trades)) return [];
    const dateFiltered = filterTradesByExitDate(trades, filter);
    return filterTradesByTags(dateFiltered, selectedTagIds, filterMode);
  }, [trades, filter, selectedTagIds, filterMode]);

  const isLoading = themeLoading || authLoading || dateFilterLoading || tagFilterLoading;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTrades?.();
    } catch (error) {
      console.error('Refresh error:', error);
    }
    setRefreshing(false);
  }, [refreshTrades]);

  const handleTradePress = (trade) => {
    navigation.navigate('TradeDetail', { tradeId: trade.id });
  };

  const handleDeleteTrade = useCallback(async (tradeId) => {
    Alert.alert(
      'Delete Trade',
      'Are you sure you want to delete this trade?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrade(tradeId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete trade');
            }
          },
        },
      ]
    );
  }, [deleteTrade]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Trade History</Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
            Sign in to view your trades
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
          <Text style={[styles.title, { color: themeColors.text }]}>Trade History</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {selectedAccount?.name || 'No account'} • {filteredTrades.length} trades
          </Text>
        </View>

        {/* Trade List */}
        <FlatList
          data={filteredTrades}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TradeRow 
              trade={item} 
              isDark={isDark} 
              onPress={handleTradePress}
              onDelete={handleDeleteTrade}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={[styles.emptyListText, { color: themeColors.textSecondary }]}>
                No trades found
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  tradeLeft: {
    flex: 1,
  },
  tradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tradeDate: {
    fontSize: 13,
    marginTop: 4,
  },
  tradeRight: {
    alignItems: 'flex-end',
  },
  profit: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultBadge: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyList: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
