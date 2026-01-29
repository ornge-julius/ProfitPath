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
import { useTheme, colors } from '../context/ThemeContext';
import { useAppStateContext } from '../context/AppStateContext';
import {
  useTradeManagement,
  formatDate,
  getResultText,
  getTradeTypeText,
  isWin,
  calculateReturnPercentage,
} from '@profitpath/shared';

// Detail Row Component
const DetailRow = ({ label, value, valueColor, isDark }) => {
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.detailRow, { borderBottomColor: themeColors.border }]}>
      <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: valueColor || themeColors.text }]}>{value}</Text>
    </View>
  );
};

export default function TradeDetailScreen({ route, navigation }) {
  const { tradeId } = route.params;
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
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
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isWinning = isWin(trade.result) || trade.profit > 0;
  const profitColor = isWinning ? themeColors.success : themeColors.danger;
  const returnPct = calculateReturnPercentage(trade.entry_price, trade.exit_price, trade.quantity);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Trade Header */}
        <View style={[styles.header, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.symbol, { color: themeColors.text }]}>{trade.symbol}</Text>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: trade.position_type === 1 ? '#10B98120' : '#EF444420' },
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: trade.position_type === 1 ? themeColors.success : themeColors.danger },
                ]}
              >
                {getTradeTypeText(trade.position_type)}
              </Text>
            </View>
          </View>
          <Text style={[styles.profit, { color: profitColor }]}>{formatCurrency(trade.profit)}</Text>
          <Text style={[styles.resultText, { color: profitColor }]}>
            {getResultText(trade.result)} • {returnPct.toFixed(1)}% return
          </Text>
        </View>

        {/* Trade Details */}
        <View style={[styles.section, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Trade Details</Text>
          <DetailRow label="Entry Price" value={formatCurrency(trade.entry_price)} isDark={isDark} />
          <DetailRow label="Exit Price" value={formatCurrency(trade.exit_price)} isDark={isDark} />
          <DetailRow label="Quantity" value={`${trade.quantity} contract${trade.quantity !== 1 ? 's' : ''}`} isDark={isDark} />
          <DetailRow label="Entry Date" value={formatDate(trade.entry_date)} isDark={isDark} />
          <DetailRow label="Exit Date" value={formatDate(trade.exit_date)} isDark={isDark} />
        </View>

        {/* Notes Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Notes</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={[styles.editButton, { color: themeColors.primary }]}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          {isEditing ? (
            <View>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Add notes about this trade..."
                placeholderTextColor={themeColors.textMuted}
                multiline
                numberOfLines={4}
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: themeColors.border }]}
                  onPress={() => {
                    setIsEditing(false);
                    setEditNotes(trade.notes || '');
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: themeColors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                  onPress={handleSaveNotes}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={[styles.notesText, { color: trade.notes ? themeColors.text : themeColors.textMuted }]}>
              {trade.notes || 'No notes for this trade'}
            </Text>
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteButton, { borderColor: themeColors.danger }]}
          onPress={handleDelete}
          disabled={isDeleting}
          activeOpacity={0.7}
        >
          {isDeleting ? (
            <ActivityIndicator color={themeColors.danger} />
          ) : (
            <Text style={[styles.deleteButtonText, { color: themeColors.danger }]}>Delete Trade</Text>
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
