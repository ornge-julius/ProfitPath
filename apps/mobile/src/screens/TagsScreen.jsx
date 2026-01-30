import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTagFilter, FILTER_MODES } from '../context/TagFilterContext';
import { useAuth } from '@profitpath/shared';
import Header from '../components/Header';
import { LuxeCard, LuxeButtonPrimary, LuxeInput, LuxeButtonSecondary } from '../components/ui';
import { SPACING } from '../theme/tokens';

// Tag card item
function TagCard({ tag, onEdit, onDelete, onViewTrades, canEdit, colors }) {
  const tagColor = tag.color || colors.accentGold;

  return (
    <LuxeCard style={styles.tagCard}>
      <View style={styles.tagCardHeader}>
        <View style={styles.tagCardLeft}>
          <View style={[styles.tagDot, { backgroundColor: tagColor }]} />
          <TouchableOpacity onPress={onViewTrades ? () => onViewTrades(tag) : undefined}>
            <Text
              style={[
                styles.tagName,
                { color: colors.textPrimary, fontFamily: colors.fontDisplay },
              ]}
            >
              {tag.name}
            </Text>
          </TouchableOpacity>
        </View>
        {canEdit && (onEdit || onDelete) && (
          <View style={styles.tagActions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.tagActionBtn}>
                <Ionicons name="pencil-outline" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.tagActionBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.loss} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <View style={styles.tagCardFooter}>
        <Text style={[styles.usageText, { color: colors.textMuted, fontFamily: colors.fontMono }]}>
          {tag.usage_count ?? 0} trade{(tag.usage_count ?? 0) !== 1 ? 's' : ''}
        </Text>
        {onViewTrades && (
          <TouchableOpacity onPress={() => onViewTrades(tag)}>
            <Text style={[styles.viewTradesText, { color: colors.accentGold, fontFamily: colors.fontMono }]}>
              View →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </LuxeCard>
  );
}

export default function TagsScreen({ navigation }) {
  const { colors, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const {
    allTags,
    isLoading,
    createTag,
    updateTag,
    deleteTag,
    refetchTags,
    setSelectedTagIds,
    setFilterMode,
  } = useTagFilter();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [createName, setCreateName] = useState('');
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeletePress = (tag) => {
    const msg = `Are you sure you want to delete "${tag.name}"? ${(tag.usage_count || 0) > 0 ? `This tag is used by ${tag.usage_count} trade(s). Deleting it will remove the tag from all associated trades.` : ''}`;
    Alert.alert('Delete Tag', msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTag(tag.id) },
    ]);
  };

  const handleCreateTag = async () => {
    if (!createName.trim()) return;
    setIsSubmitting(true);
    try {
      await createTag({ name: createName.trim() });
      setCreateName('');
      setShowCreateForm(false);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !editName.trim()) return;
    setIsSubmitting(true);
    try {
      await updateTag(editingTag.id, { name: editName.trim() });
      setEditingTag(null);
      setEditName('');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTrades = (tag) => {
    setSelectedTagIds([tag.id]);
    setFilterMode(FILTER_MODES.OR);
    navigation.navigate('History');
  };

  const sortedTags = [...(allTags || [])].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));

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
          <View>
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: colors.fontDisplay }]}>
              Tags
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: colors.fontMono }]}>
              Organize and categorize your trades
            </Text>
          </View>
          {isAuthenticated && (
            <LuxeButtonPrimary title="New Tag" onPress={() => setShowCreateForm(true)} />
          )}
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.accentGold} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading tags...</Text>
          </View>
        ) : !isAuthenticated ? (
          <LuxeCard style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Sign in to manage tags
            </Text>
          </LuxeCard>
        ) : showCreateForm ? (
          <LuxeCard style={styles.formCard}>
            <Text style={[styles.formTitle, { color: colors.textPrimary, fontFamily: colors.fontMono }]}>New Tag</Text>
            <LuxeInput
              label="Name"
              value={createName}
              onChangeText={setCreateName}
              placeholder="Tag name"
            />
            <View style={styles.formActions}>
              <LuxeButtonSecondary title="Cancel" onPress={() => { setShowCreateForm(false); setCreateName(''); }} style={styles.formBtn} />
              <LuxeButtonPrimary title="Create" onPress={handleCreateTag} loading={isSubmitting} disabled={!createName.trim()} style={styles.formBtn} />
            </View>
          </LuxeCard>
        ) : editingTag ? (
          <LuxeCard style={styles.formCard}>
            <Text style={[styles.formTitle, { color: colors.textPrimary, fontFamily: colors.fontMono }]}>Edit Tag</Text>
            <LuxeInput label="Name" value={editName} onChangeText={setEditName} placeholder="Tag name" />
            <View style={styles.formActions}>
              <LuxeButtonSecondary title="Cancel" onPress={() => { setEditingTag(null); setEditName(''); }} style={styles.formBtn} />
              <LuxeButtonPrimary title="Save" onPress={handleUpdateTag} loading={isSubmitting} disabled={!editName.trim()} style={styles.formBtn} />
            </View>
          </LuxeCard>
        ) : sortedTags.length === 0 ? (
          <LuxeCard style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No tags yet. Create your first tag to get started!
            </Text>
          </LuxeCard>
        ) : (
          <View style={styles.tagList}>
            {sortedTags.map((tag) => (
              <TagCard
                key={tag.id}
                tag={tag}
                colors={colors}
                canEdit={isAuthenticated}
                onEdit={() => {
                  setEditingTag(tag);
                  setEditName(tag.name);
                }}
                onDelete={() => handleDeletePress(tag)}
                onViewTrades={handleViewTrades}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: { fontSize: 24, fontWeight: '500' },
  subtitle: { fontSize: 13, marginTop: 4 },
  centered: { paddingVertical: 48, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyCard: { padding: SPACING.lg, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  formCard: { padding: SPACING.lg, marginBottom: SPACING.lg },
  formTitle: { fontSize: 14, marginBottom: SPACING.md },
  formActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  formBtn: { flex: 1 },
  tagList: { gap: SPACING.md },
  tagCard: { padding: SPACING.md, marginBottom: SPACING.md },
  tagCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  tagCardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  tagDot: { width: 12, height: 12, borderRadius: 6 },
  tagName: { fontSize: 18 },
  tagActions: { flexDirection: 'row', gap: 4 },
  tagActionBtn: { padding: 4 },
  tagCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  usageText: { fontSize: 11 },
  viewTradesText: { fontSize: 11 },
});
