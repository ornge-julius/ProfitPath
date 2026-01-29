import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme, colors } from '../context/ThemeContext';
import { useAuth, useTradeManagement, getTradeTypeNumber, getResultNumber } from '@profitpath/shared';

// Form Input Component
const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', isDark }) => {
  const themeColors = isDark ? colors.dark : colors.light;
  
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, { 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border,
          color: themeColors.text 
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
};

// Option Button Component
const OptionButton = ({ label, isSelected, onPress, variant = 'default', isDark }) => {
  const themeColors = isDark ? colors.dark : colors.light;
  
  const getVariantColors = () => {
    if (!isSelected) return { bg: themeColors.surface, text: themeColors.text };
    
    switch (variant) {
      case 'success':
        return { bg: '#10B98120', text: themeColors.success };
      case 'danger':
        return { bg: '#EF444420', text: themeColors.danger };
      default:
        return { bg: themeColors.primary + '20', text: themeColors.primary };
    }
  };
  
  const variantColors = getVariantColors();
  
  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        { 
          backgroundColor: variantColors.bg,
          borderColor: isSelected ? variantColors.text : themeColors.border 
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionText, { color: variantColors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function AddTradeScreen({ navigation }) {
  const { isDark, isLoading: themeLoading } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  
  const { user, isLoading: authLoading } = useAuth();
  
  // TODO: Get selectedAccountId from app state
  const selectedAccountId = null;
  
  const { addTrade } = useTradeManagement(selectedAccountId);
  
  // Form state
  const [symbol, setSymbol] = useState('');
  const [positionType, setPositionType] = useState(null); // 1 = CALL, 2 = PUT
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [result, setResult] = useState(null); // 1 = WIN, 0 = LOSS
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = themeLoading || authLoading;

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
        entry_date: new Date().toISOString().split('T')[0],
        exit_date: new Date().toISOString().split('T')[0],
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
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Add Trade</Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
            Sign in to add trades
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>Add Trade</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <FormInput
            label="Symbol"
            value={symbol}
            onChangeText={setSymbol}
            placeholder="SPY, AAPL, etc."
            isDark={isDark}
          />

          {/* Position Type */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Position Type</Text>
            <View style={styles.optionRow}>
              <OptionButton
                label="CALL"
                isSelected={positionType === 1}
                onPress={() => setPositionType(1)}
                variant="success"
                isDark={isDark}
              />
              <OptionButton
                label="PUT"
                isSelected={positionType === 2}
                onPress={() => setPositionType(2)}
                variant="danger"
                isDark={isDark}
              />
            </View>
          </View>

          <FormInput
            label="Entry Price"
            value={entryPrice}
            onChangeText={setEntryPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
            isDark={isDark}
          />

          <FormInput
            label="Exit Price"
            value={exitPrice}
            onChangeText={setExitPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
            isDark={isDark}
          />

          <FormInput
            label="Quantity (Contracts)"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="1"
            keyboardType="number-pad"
            isDark={isDark}
          />

          {/* Result */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Result (Optional)</Text>
            <View style={styles.optionRow}>
              <OptionButton
                label="WIN"
                isSelected={result === 1}
                onPress={() => setResult(result === 1 ? null : 1)}
                variant="success"
                isDark={isDark}
              />
              <OptionButton
                label="LOSS"
                isSelected={result === 0}
                onPress={() => setResult(result === 0 ? null : 0)}
                variant="danger"
                isDark={isDark}
              />
            </View>
          </View>

          <FormInput
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Trade notes..."
            isDark={isDark}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: themeColors.primary },
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Add Trade</Text>
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
