import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../context/ThemeContext';
import { useDateFilter, filterTradesByExitDate } from '../context/DateFilterContext';
import { useTagFilter, filterTradesByTags } from '../context/TagFilterContext';
import { useAppStateContext } from '../context/AppStateContext';
import {
  useTradeManagement,
  calculateMetrics,
  calculateTradeBatches,
  generateWinLossChartData,
  generateBatchComparisonData,
} from '@profitpath/shared';
import Header from '../components/Header';
import { LuxeCard, LuxeStatValue, LuxeStatLabel } from '../components/ui';
import { SPACING } from '../theme/tokens';

const screenWidth = Dimensions.get('window').width;

export default function ComparisonScreen({ navigation }) {
  const { colors, toggleTheme } = useTheme();
  const { filter } = useDateFilter();
  const { selectedTagIds, filterMode } = useTagFilter();
  const { selectedAccountId } = useAppStateContext();
  const { trades } = useTradeManagement(selectedAccountId);

  const filteredTrades = useMemo(() => {
    if (!Array.isArray(trades)) return [];
    const dateFiltered = filterTradesByExitDate(trades, filter);
    return filterTradesByTags(dateFiltered, selectedTagIds, filterMode);
  }, [trades, filter, selectedTagIds, filterMode]);

  const { currentBatch, previousBatch } = useMemo(
    () => calculateTradeBatches(filteredTrades),
    [filteredTrades]
  );

  const currentMetrics = useMemo(() => calculateMetrics(currentBatch, 0), [currentBatch]);
  const previousMetrics = useMemo(() => calculateMetrics(previousBatch, 0), [previousBatch]);

  const currentWinLossData = useMemo(
    () => generateWinLossChartData(currentBatch),
    [currentBatch]
  );
  const previousWinLossData = useMemo(
    () => generateWinLossChartData(previousBatch),
    [previousBatch]
  );

  const comparisonLineData = useMemo(
    () => generateBatchComparisonData(currentBatch, previousBatch),
    [currentBatch, previousBatch]
  );

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

  if (!filteredTrades || filteredTrades.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <Header
        showFilters={false}
        onThemeToggle={toggleTheme}
        onAccountPress={() => navigation.getParent()?.navigate('Settings')}
      />
        <View style={styles.centered}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: colors.fontDisplay }]}>
            Trade Batch Comparison
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            No trades available for comparison
          </Text>
          <LuxeCard style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Please add trades to view batch comparison
            </Text>
          </LuxeCard>
        </View>
      </SafeAreaView>
    );
  }

  const winColor = colors.win;
  const lossColor = colors.loss;
  const pieDataCurrent = currentWinLossData.map((d, i) => ({
    value: d.value,
    color: i === 0 ? winColor : lossColor,
    text: `${d.value.toFixed(0)}%`,
  })).filter(d => d.value > 0);
  const pieDataPrevious = previousWinLossData.map((d, i) => ({
    value: d.value,
    color: i === 0 ? winColor : lossColor,
    text: `${d.value.toFixed(0)}%`,
  })).filter(d => d.value > 0);

  const lineData = comparisonLineData.map((d, i) => ({
    value: d.currentCumulative,
    label: i % 2 === 0 ? `${i + 1}` : '',
    dataPointText: '',
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Header
        showFilters={false}
        onThemeToggle={toggleTheme}
        onAccountPress={() => navigation.getParent()?.navigate('Settings')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: colors.fontDisplay }]}>
            Trade Batch Comparison
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: colors.fontMono }]}>
            {filteredTrades.length <= 10
              ? `Baseline: ${currentBatch.length} trades (add 11+ for comparison)`
              : `Current ${currentBatch.length} vs previous ${previousBatch.length} trades`}
          </Text>
        </View>

        <View style={styles.twoCol}>
          <LuxeCard style={styles.batchCard}>
            <LuxeStatLabel>Previous Batch</LuxeStatLabel>
            <LuxeStatValue>{previousMetrics.winRate.toFixed(1)}%</LuxeStatValue>
            {pieDataPrevious.length > 0 && (
              <View style={styles.pieWrap}>
                <PieChart
                  data={pieDataPrevious}
                  donut
                  innerRadius={28}
                  radius={40}
                  centerLabelComponent={() => (
                    <Text style={[styles.pieCenter, { color: colors.textPrimary }]}>
                      {previousMetrics.winRate.toFixed(0)}%
                    </Text>
                  )}
                />
              </View>
            )}
          </LuxeCard>
          <LuxeCard style={styles.batchCard}>
            <LuxeStatLabel>Current Batch</LuxeStatLabel>
            <LuxeStatValue>{currentMetrics.winRate.toFixed(1)}%</LuxeStatValue>
            {pieDataCurrent.length > 0 && (
              <View style={styles.pieWrap}>
                <PieChart
                  data={pieDataCurrent}
                  donut
                  innerRadius={28}
                  radius={40}
                  centerLabelComponent={() => (
                    <Text style={[styles.pieCenter, { color: colors.textPrimary }]}>
                      {currentMetrics.winRate.toFixed(0)}%
                    </Text>
                  )}
                />
              </View>
            )}
          </LuxeCard>
        </View>

        <View style={styles.twoCol}>
          <LuxeCard style={styles.metricCard}>
            <LuxeStatLabel>Previous Avg W/L</LuxeStatLabel>
            <Text style={[styles.avgWin, { color: winColor }]}>{formatCurrency(previousMetrics.avgWin)}</Text>
            <Text style={[styles.avgLoss, { color: lossColor }]}>{formatCurrency(previousMetrics.avgLoss)}</Text>
          </LuxeCard>
          <LuxeCard style={styles.metricCard}>
            <LuxeStatLabel>Current Avg W/L</LuxeStatLabel>
            <Text style={[styles.avgWin, { color: winColor }]}>{formatCurrency(currentMetrics.avgWin)}</Text>
            <Text style={[styles.avgLoss, { color: lossColor }]}>{formatCurrency(currentMetrics.avgLoss)}</Text>
          </LuxeCard>
        </View>

        {lineData.length > 0 && (
          <LuxeCard style={styles.chartCard}>
            <LuxeStatLabel>Cumulative P&L Comparison</LuxeStatLabel>
            <LineChart
              data={lineData}
              width={screenWidth - SPACING.md * 4}
              height={160}
              color={colors.accentGold}
              thickness={2}
              hideDataPoints
              curved
              xAxisColor={colors.border}
              yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
              noOfSections={4}
              backgroundColor="transparent"
            />
          </LuxeCard>
        )}

        <View style={styles.twoCol}>
          <LuxeCard style={styles.metricCard}>
            <LuxeStatLabel>Previous Batch</LuxeStatLabel>
            <Text style={[styles.metricText, { color: colors.textPrimary }]}>
              {previousMetrics.totalTrades} trades · {formatCurrency(previousMetrics.totalProfit)}
            </Text>
          </LuxeCard>
          <LuxeCard style={styles.metricCard}>
            <LuxeStatLabel>Current Batch</LuxeStatLabel>
            <Text style={[styles.metricText, { color: colors.textPrimary }]}>
              {currentMetrics.totalTrades} trades · {formatCurrency(currentMetrics.totalProfit)}
            </Text>
          </LuxeCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  pageHeader: { marginTop: SPACING.md, marginBottom: SPACING.lg },
  title: { fontSize: 24, fontWeight: '500' },
  subtitle: { fontSize: 13, marginTop: 4 },
  centered: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.xl },
  emptyCard: { padding: SPACING.lg, marginTop: SPACING.md },
  emptyText: { fontSize: 14 },
  twoCol: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  batchCard: { flex: 1, padding: SPACING.md },
  pieWrap: { alignItems: 'center', marginTop: SPACING.sm },
  pieCenter: { fontSize: 14, fontWeight: '600' },
  metricCard: { flex: 1, padding: SPACING.md },
  avgWin: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  avgLoss: { fontSize: 16, fontWeight: '600' },
  chartCard: { padding: SPACING.md, marginBottom: SPACING.md },
  metricText: { fontSize: 14, marginTop: 4 },
});
