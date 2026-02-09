import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAppStateContext } from '../context/AppStateContext';
import {
  useTradeManagement,
  formatDate,
  getResultText,
  getTradeTypeText,
  isWin,
  calculateReturnPercentage,
} from '@profitpath/shared';

const DetailRow = ({ label, value, valueColor, themeColors }) => (
  <View style={[styles.detailRow, { borderBottomColor: themeColors.border }]}>
    <Text style={[styles.detailLabel, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: valueColor || themeColors.textPrimary, fontFamily: themeColors.fontMono }]}>{value}</Text>
  </View>
);

export default function TradeDetailScreen({ route, navigation }) {
  const { tradeId } = route.params;
  const { colors: themeColors } = useTheme();
  const { selectedAccountId } = useAppStateContext();
  const { trades, updateTrade, deleteTrade, isLoading } = useTradeManagement(selectedAccountId);

  const [trade, setTrade] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  // Find the trade from the trades list
  useEffect(() => {
    const foundTrade = trades?.find((t) => t.id === tradeId);
    if (foundTrade) {
      setTrade(foundTrade);
      setEditNotes(foundTrade.notes || '');
    }
  }, [trades, tradeId]);

  const formatCurrency = (value) => {
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return value < 0 ? `-${formatted}` : formatted;
  };

  const handleDelete = () => {
    Alert.alert('Delete Trade', 'Are you sure you want to delete this trade? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deleteTrade(tradeId);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete trade. Please try again.');
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const handleSaveNotes = async () => {
    try {
      await updateTrade(tradeId, { notes: editNotes.trim() });
      setIsEditing(false);
      Alert.alert('Success', 'Notes updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update notes. Please try again.');
    }
  };

  if (isLoading || !trade) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bgPrimary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.accentGold} />
        </View>
      </SafeAreaView>
    );
  }

  const isWinning = isWin(trade.result) || trade.profit > 0;
  const profitColor = isWinning ? themeColors.win : themeColors.loss;
  const returnPct = calculateReturnPercentage(trade.entry_price, trade.exit_price, trade.quantity);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bgPrimary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: themeColors.bgSurface, borderColor: themeColors.border }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.symbol, { color: themeColors.textPrimary, fontFamily: themeColors.fontDisplay }]}>{trade.symbol}</Text>
            <View style={[styles.typeBadge, { backgroundColor: trade.position_type === 1 ? themeColors.winBg : themeColors.lossBg }]}>
              <Text style={[styles.typeText, { color: trade.position_type === 1 ? themeColors.win : themeColors.loss, fontFamily: themeColors.fontMono }]}>
                {getTradeTypeText(trade.position_type)}
              </Text>
            </View>
          </View>
          <Text style={[styles.profit, { color: profitColor, fontFamily: themeColors.fontDisplay }]}>{formatCurrency(trade.profit)}</Text>
          <Text style={[styles.resultText, { color: profitColor, fontFamily: themeColors.fontMono }]}>
            {getResultText(trade.result)} • {returnPct.toFixed(1)}% return
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: themeColors.bgSurface, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>Trade Details</Text>
          <DetailRow label="Entry Price" value={formatCurrency(trade.entry_price)} themeColors={themeColors} />
          <DetailRow label="Exit Price" value={formatCurrency(trade.exit_price)} themeColors={themeColors} />
          <DetailRow label="Quantity" value={`${trade.quantity} contract${trade.quantity !== 1 ? 's' : ''}`} themeColors={themeColors} />
          <DetailRow label="Entry Date" value={formatDate(trade.entry_date)} themeColors={themeColors} />
          <DetailRow label="Exit Date" value={formatDate(trade.exit_date)} themeColors={themeColors} />
        </View>

        <View style={[styles.section, { backgroundColor: themeColors.bgSurface, borderColor: themeColors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>Notes</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={[styles.editButton, { color: themeColors.accentGold, fontFamily: themeColors.fontMono }]}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          {isEditing ? (
            <View>
              <TextInput
                style={[styles.notesInput, { backgroundColor: themeColors.bgPrimary, borderColor: themeColors.border, color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Add notes about this trade..."
                placeholderTextColor={themeColors.textMuted}
                multiline
                numberOfLines={4}
              />
              <View style={styles.editActions}>
                <TouchableOpacity style={[styles.cancelButton, { borderColor: themeColors.border }]} onPress={() => { setIsEditing(false); setEditNotes(trade.notes || ''); }}>
                  <Text style={[styles.cancelButtonText, { color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeColors.accentGold }]} onPress={handleSaveNotes}>
                  <Text style={[styles.saveButtonText, { fontFamily: themeColors.fontMono }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={[styles.notesText, { color: trade.notes ? themeColors.textPrimary : themeColors.textMuted, fontFamily: themeColors.fontMono }]}>
              {trade.notes || 'No notes for this trade'}
            </Text>
          )}
        </View>

        <TouchableOpacity style={[styles.deleteButton, { borderColor: themeColors.loss }]} onPress={handleDelete} disabled={isDeleting} activeOpacity={0.7}>
          {isDeleting ? (
            <ActivityIndicator color={themeColors.loss} />
          ) : (
            <Text style={[styles.deleteButtonText, { color: themeColors.loss, fontFamily: themeColors.fontMono }]}>Delete Trade</Text>
          )}
        </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  profit: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  editButton: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 15,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
