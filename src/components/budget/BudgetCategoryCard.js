import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import ProgressBar from '../ui/ProgressBar';
import colors from '../../theme/colors';
import { spacing, radii } from '../../theme/tokens';

/**
 * Displays one budget category with a progress bar and spend/budget amounts.
 * @param {{ item: { category: string, budgeted: number, actual: number, remaining: number, percentUsed: number }, onDelete?: () => void }} props
 */
const BudgetCategoryCard = ({ item, onDelete }) => {
  const { category, budgeted, actual, remaining, percentUsed } = item;

  let statusColor = colors.success;
  let statusIcon = 'checkmark-circle-outline';
  if (percentUsed >= 100) {
    statusColor = colors.error;
    statusIcon = 'alert-circle-outline';
  } else if (percentUsed >= 80) {
    statusColor = colors.primary;
    statusIcon = 'warning-outline';
  }

  const progress = Math.min(percentUsed / 100, 1);

  return (
    <GlassCard noPadding>
      <View style={styles.row}>
        {/* Gold/status left accent bar */}
        <View style={[styles.accent, { backgroundColor: statusColor }]} />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleBlock}>
              <Ionicons name={statusIcon} size={14} color={statusColor} style={styles.statusIcon} />
              <Text style={styles.categoryText}>{category}</Text>
            </View>
            <View style={styles.rightBlock}>
              <Text style={[styles.pct, { color: statusColor }]}>{percentUsed}%</Text>
              {onDelete && (
                <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={14} color={colors.textTertiary} />
                </Pressable>
              )}
            </View>
          </View>

          <ProgressBar progress={progress} height={6} style={styles.bar} />

          <View style={styles.amountsRow}>
            <Text style={styles.actualText}>
              Spent: <Text style={styles.amountBold}>${actual.toFixed(0)}</Text>
            </Text>
            <Text style={styles.budgetedText}>
              Budget: <Text style={styles.amountBold}>${budgeted.toFixed(0)}</Text>
            </Text>
            <Text style={[styles.remainingText, { color: remaining < 0 ? colors.error : colors.textTertiary }]}>
              {remaining < 0
                ? `$${Math.abs(remaining).toFixed(0)} over`
                : `$${remaining.toFixed(0)} left`}
            </Text>
          </View>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accent: {
    width: 4,
    marginRight: spacing.md,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusIcon: {
    marginTop: 1,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  rightBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pct: {
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 2,
  },
  bar: {
    marginVertical: 2,
  },
  amountsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actualText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  budgetedText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  remainingText: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  amountBold: {
    fontWeight: '600',
    color: colors.text,
  },
});

export default BudgetCategoryCard;
