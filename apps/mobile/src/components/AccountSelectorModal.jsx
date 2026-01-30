import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAppStateContext } from '../context/AppStateContext';

/**
 * Modal for selecting, creating, editing, and deleting accounts.
 */
export default function AccountSelectorModal({ visible, onClose }) {
  const { colors: themeColors } = useTheme();
  const {
    accounts,
    selectedAccountId,
    selectAccount,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAppStateContext();

  const [mode, setMode] = useState('list'); // 'list', 'create', 'edit'
  const [editingAccount, setEditingAccount] = useState(null);
  const [name, setName] = useState('');
  const [startingBalance, setStartingBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setStartingBalance('');
    setEditingAccount(null);
    setMode('list');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectAccount = (accountId) => {
    selectAccount(accountId);
    handleClose();
  };

  const handleCreatePress = () => {
    setMode('create');
    setName('');
    setStartingBalance('');
  };

  const handleEditPress = (account) => {
    setEditingAccount(account);
    setName(account.name);
    setStartingBalance(account.startingBalance.toString());
    setMode('edit');
  };

  const handleDeletePress = (account) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.name}"? This will also delete all trades in this account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount(account.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an account name');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createAccount(name, startingBalance || '0');
        Alert.alert('Success', 'Account created successfully');
      } else if (mode === 'edit' && editingAccount) {
        await updateAccount(editingAccount.id, {
          name: name,
          startingBalance: startingBalance || '0',
        });
        Alert.alert('Success', 'Account updated successfully');
      }
      resetForm();
    } catch (error) {
      Alert.alert('Error', error.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAccountItem = ({ item }) => {
    const isSelected = item.id === selectedAccountId;

    return (
      <TouchableOpacity
        style={[
          styles.accountItem,
          {
            backgroundColor: isSelected ? themeColors.accentGold + '15' : themeColors.bgSurface,
            borderColor: isSelected ? themeColors.accentGold : themeColors.border,
          },
        ]}
        onPress={() => handleSelectAccount(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.accountInfo}>
          <Text style={[styles.accountName, { color: themeColors.textPrimary, fontFamily: themeColors.fontDisplay }]}>{item.name}</Text>
          <Text style={[styles.accountBalance, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>
            Starting Balance: ${item.startingBalance.toLocaleString()}
          </Text>
        </View>
        <View style={styles.accountActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleEditPress(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.actionText, { color: themeColors.accentGold, fontFamily: themeColors.fontMono }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeletePress(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.actionText, { color: themeColors.loss, fontFamily: themeColors.fontMono }]}>Delete</Text>
          </TouchableOpacity>
        </View>
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: themeColors.accentGold }]} />
        )}
      </TouchableOpacity>
    );
  };

  const renderListView = () => (
    <>
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: themeColors.textPrimary, fontFamily: themeColors.fontDisplay }]}>Select Account</Text>
        <TouchableOpacity onPress={handleClose}>
          <Text style={[styles.closeButton, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAccountItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>
              No accounts yet. Create one to get started!
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={[styles.createButton, { backgroundColor: themeColors.accentGold }]} onPress={handleCreatePress} activeOpacity={0.8}>
        <Text style={[styles.createButtonText, { fontFamily: themeColors.fontMono }]}>+ Create New Account</Text>
      </TouchableOpacity>
    </>
  );

  const renderFormView = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.formContainer}
    >
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={resetForm}>
          <Text style={[styles.backButton, { color: themeColors.accentGold, fontFamily: themeColors.fontMono }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: themeColors.textPrimary, fontFamily: themeColors.fontDisplay }]}>
          {mode === 'create' ? 'Create Account' : 'Edit Account'}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>Account Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.bgSurface, borderColor: themeColors.border, color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Main Trading Account"
            placeholderTextColor={themeColors.textMuted}
            autoFocus
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: themeColors.textSecondary, fontFamily: themeColors.fontMono }]}>Starting Balance</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.bgSurface, borderColor: themeColors.border, color: themeColors.textPrimary, fontFamily: themeColors.fontMono }]}
            value={startingBalance}
            onChangeText={setStartingBalance}
            placeholder="0"
            placeholderTextColor={themeColors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: themeColors.accentGold }, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.submitButtonText, { fontFamily: themeColors.fontMono }]}>
              {mode === 'create' ? 'Create Account' : 'Save Changes'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: themeColors.bgPrimary }]}>
        {mode === 'list' ? renderListView() : renderFormView()}
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
  backButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  accountItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  accountInfo: {
    marginBottom: 12,
  },
  accountName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
  },
  accountActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  createButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
