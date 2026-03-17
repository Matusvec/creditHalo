import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassModal from '../ui/GlassModal';
import AnimatedButton from '../ui/AnimatedButton';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

/** Common spending categories for quick selection */
const QUICK_CATEGORIES = [
  'Groceries', 'Dining', 'Gas', 'Transportation', 'Shopping',
  'Entertainment', 'Healthcare', 'Personal Care', 'Utilities',
];

/**
 * Modal for adding a new budget entry.
 * @param {{ visible: boolean, onClose: () => void, onAdd: (category: string, amount: number) => void, suggestions?: { category: string, suggested: number }[] }} props
 */
const AddBudgetModal = ({ visible, onClose, onAdd, suggestions = [] }) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = category.trim();
    const num = parseFloat(amount);
    if (!trimmed) {
      setError('Please enter a category name.');
      return;
    }
    if (!num || num <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setError('');
    onAdd(trimmed, num);
    setCategory('');
    setAmount('');
    onClose();
  };

  const selectCategory = (cat) => {
    setCategory(cat);
    const suggestion = suggestions.find((s) => s.category === cat);
    if (suggestion && !amount) {
      setAmount(String(suggestion.suggested));
    }
  };

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <Text style={styles.title}>Add Budget</Text>

      {/* Quick category chips */}
      <Text style={styles.sectionLabel}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
        {QUICK_CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => selectCategory(cat)}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <TextInput
        style={styles.input}
        placeholder="Or type category name"
        placeholderTextColor={colors.textTertiary}
        value={category}
        onChangeText={setCategory}
      />

      <Text style={styles.sectionLabel}>Monthly Limit ($)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 400"
        placeholderTextColor={colors.textTertiary}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      {/* Budget suggestions */}
      {suggestions.length > 0 && category && (
        <View style={styles.suggestion}>
          {suggestions
            .filter((s) => s.category.toLowerCase() === category.toLowerCase())
            .slice(0, 1)
            .map((s) => (
              <Pressable
                key={s.category}
                style={styles.suggestionRow}
                onPress={() => setAmount(String(s.suggested))}
              >
                <Ionicons name="bulb-outline" size={14} color={colors.primary} />
                <Text style={styles.suggestionText}>
                  Suggested: ${s.suggested} based on {s.basedOn}
                </Text>
              </Pressable>
            ))}
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <AnimatedButton
          title="Cancel"
          variant="ghost"
          onPress={onClose}
          style={styles.cancelBtn}
        />
        <AnimatedButton
          title="Add Budget"
          variant="primary"
          onPress={handleAdd}
          style={styles.addBtn}
        />
      </View>
    </GlassModal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: 0.3,
  },
  sectionLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  chipsScroll: {
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: GLASS_BG,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255, 248, 230, 0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  suggestion: {
    marginBottom: spacing.sm,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(212, 168, 67, 0.08)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.2)',
  },
  suggestionText: {
    fontSize: 12,
    color: colors.primary,
  },
  error: {
    fontSize: 13,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
  },
  addBtn: {
    flex: 1,
  },
});

export default AddBudgetModal;
