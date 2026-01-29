import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, colors } from '../context/ThemeContext';
import { useDateFilter, DATE_FILTER_OPTIONS } from '../context/DateFilterContext';

/**
 * Modal for selecting date filter range.
 */
export default function DateFilterModal({ visible, onClose }) {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  const { filter, setFilter, setCustomRange } = useDateFilter();

  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [pickingDate, setPickingDate] = useState('start'); // 'start' or 'end'

  const filterOptions = [
    { key: DATE_FILTER_OPTIONS.ALL_TIME, label: 'All Time' },
    { key: DATE_FILTER_OPTIONS.LAST_7_DAYS, label: 'Last 7 Days' },
    { key: DATE_FILTER_OPTIONS.LAST_30_DAYS, label: 'Last 30 Days' },
    { key: DATE_FILTER_OPTIONS.THIS_MONTH, label: 'This Month' },
    { key: DATE_FILTER_OPTIONS.LAST_MONTH, label: 'Last Month' },
    { key: DATE_FILTER_OPTIONS.YEAR_TO_DATE, label: 'Year to Date' },
    { key: DATE_FILTER_OPTIONS.CUSTOM, label: 'Custom Range' },
  ];

  const handleSelectOption = (option) => {
    if (option.key === DATE_FILTER_OPTIONS.CUSTOM) {
      setShowCustomPicker(true);
    } else {
      setFilter(option.key);
      onClose();
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        return;
      }
    }
    
    if (selectedDate) {
      if (pickingDate === 'start') {
        setCustomStartDate(selectedDate);
      } else {
        setCustomEndDate(selectedDate);
      }
    }
  };

  const handleApplyCustomRange = () => {
    setCustomRange(customStartDate, customEndDate);
    setShowCustomPicker(false);
    onClose();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderOptionsList = () => (
    <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
      {filterOptions.map((option) => {
        const isSelected = filter === option.key || 
          (option.key === DATE_FILTER_OPTIONS.CUSTOM && filter === DATE_FILTER_OPTIONS.CUSTOM);

        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.optionItem,
              {
                backgroundColor: isSelected ? themeColors.primary + '15' : themeColors.surface,
                borderColor: isSelected ? themeColors.primary : themeColors.border,
              },
            ]}
            onPress={() => handleSelectOption(option)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, { color: themeColors.text }]}>{option.label}</Text>
            {isSelected && (
              <Text style={[styles.checkmark, { color: themeColors.primary }]}>✓</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderCustomPicker = () => (
    <View style={styles.customPickerContainer}>
      <Text style={[styles.customTitle, { color: themeColors.text }]}>Select Date Range</Text>

      <View style={styles.datePickerRow}>
        <View style={styles.datePickerColumn}>
          <Text style={[styles.dateLabel, { color: themeColors.textSecondary }]}>Start Date</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
            onPress={() => setPickingDate('start')}
          >
            <Text style={[styles.dateButtonText, { color: themeColors.text }]}>
              {formatDate(customStartDate)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.datePickerColumn}>
          <Text style={[styles.dateLabel, { color: themeColors.textSecondary }]}>End Date</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
            onPress={() => setPickingDate('end')}
          >
            <Text style={[styles.dateButtonText, { color: themeColors.text }]}>
              {formatDate(customEndDate)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.pickerWrapper, { backgroundColor: themeColors.surface }]}>
        <DateTimePicker
          value={pickingDate === 'start' ? customStartDate : customEndDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          textColor={themeColors.text}
          themeVariant={isDark ? 'dark' : 'light'}
        />
      </View>

      <View style={styles.customActions}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: themeColors.border }]}
          onPress={() => setShowCustomPicker(false)}
        >
          <Text style={[styles.cancelButtonText, { color: themeColors.text }]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: themeColors.primary }]}
          onPress={handleApplyCustomRange}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: themeColors.text }]}>
            {showCustomPicker ? 'Custom Range' : 'Date Filter'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: themeColors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {showCustomPicker ? renderCustomPicker() : renderOptionsList()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    padding: 4,
  },
  optionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customPickerContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  customTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  datePickerColumn: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dateButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  pickerWrapper: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  customActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
