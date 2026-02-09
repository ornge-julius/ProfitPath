import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { useAppStateContext } from '../context/AppStateContext';
import { useAuth, useTradeManagement, getTradeTypeNumber, getResultNumber } from '@profitpath/shared';

const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', themeColors }) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.label, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>{label}</Text>
    <TextInput
      style={[styles.input, { 
        backgroundColor: themeColors.bgSurface, 
        borderColor: themeColors.border,
        color: themeColors.textPrimary,
        fontFamily: themeColors.fontMono,
      }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textMuted}
        keyboardType={keyboardType}
      autoCapitalize={label === 'Symbol' ? 'characters' : 'none'}
    />
  </View>
);

const OptionButton = ({ label, isSelected, onPress, variant = 'default', themeColors }) => {
  const getVariantColors = () => {
    if (!isSelected) return { bg: themeColors.bgSurface, text: themeColors.textPrimary };
    switch (variant) {
      case 'success': return { bg: themeColors.winBg, text: themeColors.win };
      case 'danger': return { bg: themeColors.lossBg, text: themeColors.loss };
      default: return { bg: themeColors.accentGold + '20', text: themeColors.accentGold };
    }
  };
  const variantColors = getVariantColors();
  return (
    <TouchableOpacity
      style={[styles.optionButton, { backgroundColor: variantColors.bg, borderColor: isSelected ? variantColors.text : themeColors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionText, { color: variantColors.text, fontFamily: themeColors.fontMono }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function AddTradeScreen({ navigation }) {
  const { colors: themeColors, isLoading: themeLoading, isDark } = useTheme();
  
  const { user, isLoading: authLoading } = useAuth();
  const { selectedAccountId, selectedAccount } = useAppStateContext();
  
  const { addTrade } = useTradeManagement(selectedAccountId);
  
  // Form state
  const [symbol, setSymbol] = useState('');
  const [positionType, setPositionType] = useState(null); // 1 = CALL, 2 = PUT
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [entryDate, setEntryDate] = useState(new Date());
  const [exitDate, setExitDate] = useState(new Date());
  const [result, setResult] = useState(null); // 1 = WIN, 0 = LOSS
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEntryDatePicker, setShowEntryDatePicker] = useState(false);
  const [showExitDatePicker, setShowExitDatePicker] = useState(false);

  const isLoading = themeLoading || authLoading;

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!symbol.trim()) {
      Alert.alert('Validation Error', 'Symbol is required');
      return;
    }
    if (!positionType) {
      Alert.alert('Validation Error', 'Position type is required');
      return;
    }
    if (!entryPrice || isNaN(parseFloat(entryPrice))) {
      Alert.alert('Validation Error', 'Valid entry price is required');
      return;
    }
    if (!exitPrice || isNaN(parseFloat(exitPrice))) {
      Alert.alert('Validation Error', 'Valid exit price is required');
      return;
    }
    if (!quantity || isNaN(parseInt(quantity, 10))) {
      Alert.alert('Validation Error', 'Valid quantity is required');
      return;
    }
    if (!selectedAccountId) {
      Alert.alert('Error', 'No account selected. Please select an account first.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tradeData = {
        symbol: symbol.toUpperCase().trim(),
        position_type: positionType,
        entry_price: entryPrice,
        exit_price: exitPrice,
        quantity: quantity,
        result: result,
        notes: notes.trim(),
        entry_date: entryDate.toISOString().split('T')[0],
        exit_date: exitDate.toISOString().split('T')[0],
        user_id: user?.id,
      };

      const newTrade = await addTrade(tradeData);
      
      if (newTrade) {
        Alert.alert('Success', 'Trade added successfully', [
          { text: 'OK', onPress: () => {
            // Reset form
            setSymbol('');
            setPositionType(null);
            setEntryPrice('');
            setExitPrice('');
            setQuantity('');
            setEntryDate(new Date());
            setExitDate(new Date());
            setResult(null);
            setNotes('');
            // Navigate to history
            navigation?.navigate?.('History');
          }}
        ]);
      } else {
        Alert.alert('Error', 'Failed to add trade. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add trade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEntryDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowEntryDatePicker(false);
    }
    if (selectedDate) {
      setEntryDate(selectedDate);
    }
  };

  const handleExitDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowExitDatePicker(false);
    }
    if (selectedDate) {
      setExitDate(selectedDate);
    }
  };

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
          <Text style={[styles.emptyTitle, { color: themeColors.textPrimary, fontFamily: themeColors.fontDisplay }]}>Add Trade</Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>
            Sign in to add trades
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bgPrimary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.textPrimary, fontFamily: themeColors.fontDisplay }]}>Add Trade</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>
            {selectedAccount?.name || 'No account selected'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <FormInput
            label="Symbol"
            value={symbol}
            onChangeText={setSymbol}
            placeholder="SPY, AAPL, etc."
            themeColors={themeColors}
          />

          {/* Position Type */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>Position Type</Text>
            <View style={styles.optionRow}>
              <OptionButton
                label="CALL"
                isSelected={positionType === 1}
                onPress={() => setPositionType(1)}
                variant="success"
                themeColors={themeColors}
              />
              <OptionButton
                label="PUT"
                isSelected={positionType === 2}
                onPress={() => setPositionType(2)}
                variant="danger"
                themeColors={themeColors}
              />
            </View>
          </View>

          <FormInput
            label="Entry Price"
            value={entryPrice}
            onChangeText={setEntryPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
            themeColors={themeColors}
          />

          <FormInput
            label="Exit Price"
            value={exitPrice}
            onChangeText={setExitPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
            themeColors={themeColors}
          />

          <FormInput
            label="Quantity (Contracts)"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="1"
            keyboardType="number-pad"
            themeColors={themeColors}
          />

          {/* Entry Date */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>Entry Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: themeColors.bgSurface, borderColor: themeColors.border }]}
              onPress={() => setShowEntryDatePicker(true)}
            >
              <Text style={[styles.dateButtonText, { color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}>
                {formatDate(entryDate)}
              </Text>
            </TouchableOpacity>
            {showEntryDatePicker && (
              <DateTimePicker
                value={entryDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleEntryDateChange}
                maximumDate={new Date()}
                themeVariant={isDark ? 'dark' : 'light'}
              />
            )}
          </View>

          {/* Exit Date */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>Exit Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: themeColors.bgSurface, borderColor: themeColors.border }]}
              onPress={() => setShowExitDatePicker(true)}
            >
              <Text style={[styles.dateButtonText, { color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}>
                {formatDate(exitDate)}
              </Text>
            </TouchableOpacity>
            {showExitDatePicker && (
              <DateTimePicker
                value={exitDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleExitDateChange}
                maximumDate={new Date()}
                themeVariant={isDark ? 'dark' : 'light'}
              />
            )}
          </View>

          {/* Result */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>Result (Optional)</Text>
            <View style={styles.optionRow}>
              <OptionButton
                label="WIN"
                isSelected={result === 1}
                onPress={() => setResult(result === 1 ? null : 1)}
                variant="success"
                themeColors={themeColors}
              />
              <OptionButton
                label="LOSS"
                isSelected={result === 0}
                onPress={() => setResult(result === 0 ? null : 0)}
                variant="danger"
                themeColors={themeColors}
              />
            </View>
          </View>

          <FormInput
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Trade notes..."
            themeColors={themeColors}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: themeColors.accentGold },
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.submitButtonText, { fontFamily: themeColors.fontMono }]}>Add Trade</Text>
            )}
          </TouchableOpacity>
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
  dateButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  dateButtonText: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
