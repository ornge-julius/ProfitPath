import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-gifted-charts';
import { useTheme, colors } from '../context/ThemeContext';
import { useDateFilter, filterTradesByExitDate } from '../context/DateFilterContext';
import { useTagFilter, filterTradesByTags } from '../context/TagFilterContext';
import { useAppStateContext } from '../context/AppStateContext';
import { useAuth, useTradeManagement, calculateMetrics, generateAccountBalanceData, generateCumulativeProfitData, generateMonthlyNetPNLData } from '@profitpath/shared';
import DateFilterModal from '../components/DateFilterModal';
import TagFilterModal from '../components/TagFilterModal';

const screenWidth = Dimensions.get('window').width;

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
  const { filter, filterLabel, isLoading: dateFilterLoading } = useDateFilter();
  const { selectedTagIds, filterMode, isLoading: tagFilterLoading } = useTagFilter();
  const { selectedAccountId, startingBalance, selectedAccount } = useAppStateContext();
  
  const { trades, isLoading: tradesLoading, refreshTrades } = useTradeManagement(selectedAccountId);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);

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

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshTrades?.();
    } catch (error) {
      console.error('Refresh error:', error);
    }
    setRefreshing(false);
  };

  // Generate chart data
  const balanceChartData = useMemo(() => {
    if (!filteredTrades.length) return [];
    const data = generateAccountBalanceData(filteredTrades, startingBalance);
    return data.slice(-30).map((d, index) => ({
      value: d.balance,
      label: index % 5 === 0 ? d.date.split('-').slice(1).join('/') : '',
      dataPointText: '',
    }));
  }, [filteredTrades, startingBalance]);

  const winLossPieData = useMemo(() => {
    if (metrics.totalTrades === 0) return [];
    return [
      { value: metrics.winningTrades, color: themeColors.success, text: `${metrics.winRate.toFixed(0)}%` },
      { value: metrics.losingTrades, color: isDark ? '#374151' : '#E5E7EB' },
    ];
  }, [metrics, themeColors, isDark]);

  const monthlyPnlData = useMemo(() => {
    if (!filteredTrades.length) return [];
    const data = generateMonthlyNetPNLData(filteredTrades);
    return data.slice(-6).map(d => ({
      value: Math.abs(d.netPnl),
      label: d.month.slice(0, 3),
      frontColor: d.netPnl >= 0 ? themeColors.success : themeColors.danger,
    }));
  }, [filteredTrades, themeColors]);

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: themeColors.text }]}>Dashboard</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              {selectedAccount?.name || 'No account'} • {filteredTrades.length} trades
            </Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
            onPress={() => setShowDateFilter(true)}
          >
            <Text style={[styles.filterButtonText, { color: themeColors.text }]}>
              📅 {filterLabel || 'All Time'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
            onPress={() => setShowTagFilter(true)}
          >
            <Text style={[styles.filterButtonText, { color: themeColors.text }]}>
              🏷️ {selectedTagIds.length > 0 ? `${selectedTagIds.length} tags` : 'All Tags'}
            </Text>
          </TouchableOpacity>
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

        {/* Account Balance Chart */}
        {balanceChartData.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Text style={[styles.chartTitle, { color: themeColors.text }]}>Account Balance</Text>
            <LineChart
              data={balanceChartData}
              width={screenWidth - 80}
              height={180}
              color={themeColors.primary}
              thickness={2}
              hideDataPoints
              curved
              areaChart
              startFillColor={themeColors.primary + '40'}
              endFillColor={themeColors.primary + '00'}
              backgroundColor="transparent"
              yAxisColor="transparent"
              xAxisColor={themeColors.border}
              yAxisTextStyle={{ color: themeColors.textMuted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: themeColors.textMuted, fontSize: 10 }}
              hideRules
              initialSpacing={10}
              endSpacing={10}
              adjustToWidth
            />
          </View>
        )}

        {/* Win Rate Pie Chart */}
        {winLossPieData.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Text style={[styles.chartTitle, { color: themeColors.text }]}>Win Rate</Text>
            <View style={styles.pieContainer}>
              <PieChart
                data={winLossPieData}
                donut
                innerRadius={50}
                radius={70}
                centerLabelComponent={() => (
                  <View style={styles.pieCenter}>
                    <Text style={[styles.pieCenterValue, { color: themeColors.text }]}>
                      {metrics.winRate.toFixed(0)}%
                    </Text>
                    <Text style={[styles.pieCenterLabel, { color: themeColors.textSecondary }]}>
                      Win Rate
                    </Text>
                  </View>
                )}
              />
              <View style={styles.pieLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: themeColors.success }]} />
                  <Text style={[styles.legendText, { color: themeColors.text }]}>
                    Wins: {metrics.winningTrades}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
                  <Text style={[styles.legendText, { color: themeColors.text }]}>
                    Losses: {metrics.losingTrades}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Monthly P&L Bar Chart */}
        {monthlyPnlData.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Text style={[styles.chartTitle, { color: themeColors.text }]}>Monthly P&L</Text>
            <BarChart
              data={monthlyPnlData}
              width={screenWidth - 100}
              height={150}
              barWidth={32}
              spacing={20}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={1}
              xAxisColor={themeColors.border}
              yAxisThickness={0}
              yAxisTextStyle={{ color: themeColors.textMuted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: themeColors.textMuted, fontSize: 11 }}
              noOfSections={4}
              backgroundColor="transparent"
            />
          </View>
        )}

        {/* Empty state for charts */}
        {filteredTrades.length === 0 && (
          <View style={[styles.chartCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Text style={[styles.emptyChartText, { color: themeColors.textSecondary }]}>
              Add trades to see your charts
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modals */}
      <DateFilterModal visible={showDateFilter} onClose={() => setShowDateFilter(false)} />
      <TagFilterModal visible={showTagFilter} onClose={() => setShowTagFilter(false)} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
  chartCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieCenterValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pieCenterLabel: {
    fontSize: 12,
  },
  pieLegend: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
  },
  emptyChartText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
