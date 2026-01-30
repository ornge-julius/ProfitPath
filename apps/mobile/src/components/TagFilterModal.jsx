import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTheme, colors } from '../context/ThemeContext';
import { useTagFilter, FILTER_MODES } from '../context/TagFilterContext';

/**
 * Modal for selecting tag filters.
 */
export default function TagFilterModal({ visible, onClose }) {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  const {
    allTags,
    selectedTagIds,
    filterMode,
    toggleTag,
    setFilterMode,
    clearTags,
    selectAllTags,
  } = useTagFilter();

  const handleToggleMode = () => {
    setFilterMode(filterMode === FILTER_MODES.AND ? FILTER_MODES.OR : FILTER_MODES.AND);
  };

  const renderTagItem = ({ item }) => {
    const isSelected = selectedTagIds.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.tagItem,
          {
            backgroundColor: isSelected ? themeColors.primary + '15' : themeColors.surface,
            borderColor: isSelected ? themeColors.primary : themeColors.border,
          },
        ]}
        onPress={() => toggleTag(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, { borderColor: isSelected ? themeColors.primary : themeColors.border }]}>
          {isSelected && (
            <View style={[styles.checkboxInner, { backgroundColor: themeColors.primary }]} />
          )}
        </View>
        <Text style={[styles.tagName, { color: themeColors.text }]}>{item.name}</Text>
        <View style={[styles.tagBadge, { backgroundColor: item.color || themeColors.primary }]} />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: themeColors.text }]}>Filter by Tags</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: themeColors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Mode Toggle */}
        <View style={[styles.modeToggle, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              filterMode === FILTER_MODES.AND && { backgroundColor: themeColors.primary },
            ]}
            onPress={() => setFilterMode(FILTER_MODES.AND)}
          >
            <Text
              style={[
                styles.modeButtonText,
                { color: filterMode === FILTER_MODES.AND ? '#FFFFFF' : themeColors.text },
              ]}
            >
              Match All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              filterMode === FILTER_MODES.OR && { backgroundColor: themeColors.primary },
            ]}
            onPress={() => setFilterMode(FILTER_MODES.OR)}
          >
            <Text
              style={[
                styles.modeButtonText,
                { color: filterMode === FILTER_MODES.OR ? '#FFFFFF' : themeColors.text },
              ]}
            >
              Match Any
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity onPress={selectAllTags}>
            <Text style={[styles.quickActionText, { color: themeColors.primary }]}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearTags}>
            <Text style={[styles.quickActionText, { color: themeColors.primary }]}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Tags List */}
        <FlatList
          data={allTags}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTagItem}
          contentContainerStyle={styles.tagsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                No tags found. Add tags to your trades to filter by them.
              </Text>
            </View>
          }
        />

        {/* Selected Count */}
        {selectedTagIds.length > 0 && (
          <View style={[styles.selectedInfo, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
            <Text style={[styles.selectedText, { color: themeColors.textSecondary }]}>
              {selectedTagIds.length} tag{selectedTagIds.length !== 1 ? 's' : ''} selected ({filterMode.toUpperCase()} mode)
            </Text>
          </View>
        )}

        {/* Apply Button */}
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: themeColors.primary }]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>Apply Filter</Text>
        </TouchableOpacity>
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
  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 1,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  tagName: {
    flex: 1,
    fontSize: 16,
  },
  tagBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  selectedInfo: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  selectedText: {
    fontSize: 14,
    textAlign: 'center',
  },
  applyButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
