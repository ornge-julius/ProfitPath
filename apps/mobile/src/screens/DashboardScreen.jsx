import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-gifted-charts';
import { useTheme, colors } from '../context/ThemeContext';
import { useDateFilter, filterTradesByExitDate } from '../context/DateFilterContext';
import { useTagFilter, filterTradesByTags } from '../context/TagFilterContext';
import { useAppStateContext } from '../context/AppStateContext';
import { useAuth, useTradeManagement, calculateMetrics, generateAccountBalanceData, generateMonthlyNetPNLData } from '@profitpath/shared';
import DateFilterModal from '../components/DateFilterModal';
import TagFilterModal from '../components/TagFilterModal';
import AccountSelectorModal from '../components/AccountSelectorModal';
import Header from '../components/Header';
import { LuxeCard, LuxeStatValue, LuxeStatLabel } from '../components/ui';
import { SPACING } from '../theme/tokens';

const screenWidth = Dimensions.get('window').width;

function MetricsCard({ label, value, valueColor, colors }) {
  return (
    <LuxeCard style={styles.card}>
      <LuxeStatLabel>{label}</LuxeStatLabel>
      <LuxeStatValue style={valueColor ? { color: valueColor } : undefined}>{value}</LuxeStatValue>
    </LuxeCard>
  );
}

export default function DashboardScreen() {
  const { isDark, isLoading: themeLoading, toggleTheme, colors: themeColors } = useTheme();
  
  const { user, isLoading: authLoading } = useAuth();
  const { filter, filterLabel, isLoading: dateFilterLoading } = useDateFilter();
  const { selectedTagIds, filterMode, isLoading: tagFilterLoading } = useTagFilter();
  const { selectedAccountId, startingBalance, selectedAccount } = useAppStateContext();
  
  const { trades, isLoading: tradesLoading, refreshTrades } = useTradeManagement(selectedAccountId);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

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
      { value: metrics.winningTrades, color: themeColors.win, text: `${metrics.winRate.toFixed(0)}%` },
      { value: metrics.losingTrades, color: themeColors.loss },
    ];
  }, [metrics, themeColors]);

  const monthlyPnlData = useMemo(() => {
    if (!filteredTrades.length) return [];
    const data = generateMonthlyNetPNLData(filteredTrades);
    return data.slice(-6).map(d => ({
      value: Math.abs(d.netPNL),
      label: d.monthLabel,
      frontColor: d.netPNL >= 0 ? themeColors.win : themeColors.loss,
    }));
  }, [filteredTrades, themeColors]);

  const isLoading = themeLoading || authLoading || dateFilterLoading || tagFilterLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: themeColors.textPrimary, fontFamily: themeColors.fontDisplay }]}>Welcome to ProfitPath</Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>
            Sign in to start tracking your trades
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bgPrimary }]}>
      <Header
        onDateFilter={() => setShowDateFilter(true)}
        onTagFilter={() => setShowTagFilter(true)}
        onThemeToggle={toggleTheme}
        onAccountPress={() => setShowAccountModal(true)}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.accentGold}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.textPrimary, fontFamily: themeColors.fontDisplay }]}>
            Dashboard
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textMuted, fontFamily: themeColors.fontMono }]}>
            {selectedAccount?.name || 'No account'} • {filteredTrades.length} trades
          </Text>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: themeColors.bgSurface, borderColor: themeColors.border }]}
            onPress={() => setShowDateFilter(true)}
          >
            <Text style={[styles.filterButtonText, { color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}>
              {filterLabel || 'All Time'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: themeColors.bgSurface, borderColor: themeColors.border }]}
            onPress={() => setShowTagFilter(true)}
          >
            <Text style={[styles.filterButtonText, { color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}>
              {selectedTagIds.length > 0 ? `${selectedTagIds.length} tags` : 'All Tags'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsGrid}>
          <MetricsCard label="Current Balance" value={formatCurrency(metrics.currentBalance)} valueColor={metrics.currentBalance >= startingBalance ? themeColors.win : themeColors.loss} colors={themeColors} />
          <MetricsCard label="Net Profit" value={formatCurrency(metrics.totalProfit)} valueColor={metrics.totalProfit >= 0 ? themeColors.win : themeColors.loss} colors={themeColors} />
          <MetricsCard label="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} valueColor={metrics.winRate >= 50 ? themeColors.win : themeColors.loss} colors={themeColors} />
          <MetricsCard label="Total Trades" value={metrics.totalTrades.toString()} colors={themeColors} />
          <MetricsCard label="Avg Win" value={formatCurrency(metrics.avgWin)} valueColor={themeColors.win} colors={themeColors} />
          <MetricsCard label="Avg Loss" value={formatCurrency(metrics.avgLoss)} valueColor={themeColors.loss} colors={themeColors} />
        </View>

        {balanceChartData.length > 0 && (
          <LuxeCard style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}>Account Balance</Text>
            <LineChart
              data={balanceChartData}
              width={screenWidth - 80}
              height={180}
              color={themeColors.accentGold}
              thickness={2}
              hideDataPoints
              curved
              areaChart
              startFillColor={themeColors.accentGold + '40'}
              endFillColor={themeColors.accentGold + '00'}
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
          </LuxeCard>
        )}

        {winLossPieData.length > 0 && (
          <LuxeCard style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}>Win Rate</Text>
            <View style={styles.pieContainer}>
              <PieChart
                data={winLossPieData}
                donut
                innerRadius={50}
                radius={70}
                centerLabelComponent={() => (
                  <View style={styles.pieCenter}>
                    <Text style={[styles.pieCenterValue, { color: themeColors.textPrimary, fontFamily: themeColors.fontDisplay }]}>
                      {metrics.winRate.toFixed(0)}%
                    </Text>
                    <Text style={[styles.pieCenterLabel, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>
                      Win Rate
                    </Text>
                  </View>
                )}
              />
              <View style={styles.pieLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: themeColors.win }]} />
                  <Text style={[styles.legendText, { color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}>
                    Wins: {metrics.winningTrades}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: themeColors.loss }]} />
                  <Text style={[styles.legendText, { color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}>
                    Losses: {metrics.losingTrades}
                  </Text>
                </View>
              </View>
            </View>
          </LuxeCard>
        )}

        {monthlyPnlData.length > 0 && (
          <LuxeCard style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}>Monthly P&L</Text>
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
          </LuxeCard>
        )}

        {filteredTrades.length === 0 && (
          <LuxeCard style={styles.chartCard}>
            <Text style={[styles.emptyChartText, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>
              Add trades to see your charts
            </Text>
          </LuxeCard>
        )}
      </ScrollView>

      <DateFilterModal visible={showDateFilter} onClose={() => setShowDateFilter(false)} />
      <TagFilterModal visible={showTagFilter} onClose={() => setShowTagFilter(false)} />
      <AccountSelectorModal visible={showAccountModal} onClose={() => setShowAccountModal(false)} />
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
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    paddingHorizontal: SPACING.md,
  },
  card: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  chartCard: {
    marginTop: SPACING.md,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
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
