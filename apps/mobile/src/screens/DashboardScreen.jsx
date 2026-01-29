import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme, colors } from '../context/ThemeContext';
import { useDateFilter, filterTradesByExitDate } from '../context/DateFilterContext';
import { useTagFilter, filterTradesByTags } from '../context/TagFilterContext';
import { useAuth, useTradeManagement, calculateMetrics, generateAccountBalanceData, generateCumulativeProfitData } from '@profitpath/shared';

// Metrics Card Component
const MetricsCard = ({ title, value, subtitle, isPositive, isDark }) => {
  const themeColors = isDark ? colors.dark : colors.light;
  
  return (
    <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
      <Text style={[styles.cardTitle, { color: themeColors.textSecondary }]}>{title}</Text>
      <Text style={[
        styles.cardValue,
        { color: isPositive === undefined ? themeColors.text : isPositive ? themeColors.success : themeColors.danger }
      ]}>
        {value}
      </Text>
      {subtitle && (
        <Text style={[styles.cardSubtitle, { color: themeColors.textMuted }]}>{subtitle}</Text>
      )}
    </View>
  );
};

export default function DashboardScreen() {
  const { isDark, isLoading: themeLoading } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  
  const { user, isLoading: authLoading } = useAuth();
  const { filter, isLoading: dateFilterLoading } = useDateFilter();
  const { selectedTagIds, filterMode, isLoading: tagFilterLoading } = useTagFilter();
  
  // TODO: Get selectedAccountId from app state
  // For now, we'll show a placeholder until accounts are implemented
  const selectedAccountId = null;
  const startingBalance = 0;
  
  const { trades, isLoading: tradesLoading } = useTradeManagement(selectedAccountId);

  // Apply filters
  const filteredTrades = useMemo(() => {
    if (!Array.isArray(trades)) return [];
    const dateFiltered = filterTradesByExitDate(trades, filter);
    return filterTradesByTags(dateFiltered, selectedTagIds, filterMode);
  }, [trades, filter, selectedTagIds, filterMode]);

  // Calculate metrics
  const metrics = useMemo(() => {
    return calculateMetrics(filteredTrades, startingBalance);
  }, [filteredTrades, startingBalance]);

  // Format currency
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

  const isLoading = themeLoading || authLoading || dateFilterLoading || tagFilterLoading;

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
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Welcome to ProfitPath</Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
            Sign in to start tracking your trades
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>Dashboard</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {filteredTrades.length} trades
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricsCard
            title="Current Balance"
            value={formatCurrency(metrics.currentBalance)}
            isPositive={metrics.currentBalance >= startingBalance}
            isDark={isDark}
          />
          <MetricsCard
            title="Net Profit"
            value={formatCurrency(metrics.totalProfit)}
            isPositive={metrics.totalProfit >= 0}
            isDark={isDark}
          />
          <MetricsCard
            title="Win Rate"
            value={`${metrics.winRate.toFixed(1)}%`}
            subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
            isPositive={metrics.winRate >= 50}
            isDark={isDark}
          />
          <MetricsCard
            title="Total Trades"
            value={metrics.totalTrades.toString()}
            isDark={isDark}
          />
          <MetricsCard
            title="Avg Win"
            value={formatCurrency(metrics.avgWin)}
            isPositive={true}
            isDark={isDark}
          />
          <MetricsCard
            title="Avg Loss"
            value={formatCurrency(metrics.avgLoss)}
            isPositive={false}
            isDark={isDark}
          />
        </View>

        {/* Charts placeholder */}
        <View style={[styles.chartPlaceholder, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Text style={[styles.chartPlaceholderText, { color: themeColors.textSecondary }]}>
            📈 Charts coming soon
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  card: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  chartPlaceholder: {
    marginTop: 16,
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    fontSize: 16,
  },
});
