import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';
import { formatCurrency } from './chartTheme';

/**
 * Horizontal bar chart comparing budgeted vs actual spending per category.
 * @param {{ data: { category: string, budgeted: number, actual: number }[] }} props
 */
const BudgetBarChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No budget data</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.budgeted || 0, d.actual || 0)), 1);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>Category</Text>
        <Text style={styles.headerValue}>Actual / Budget</Text>
      </View>

      {data.map((item, i) => {
        const budgeted = item.budgeted || 0;
        const actual = item.actual || 0;
        const ratio = budgeted > 0 ? actual / budgeted : 0;
        const actualWidth = Math.min((actual / maxVal) * 100, 100);
        const budgetWidth = Math.min((budgeted / maxVal) * 100, 100);

        let barColor = colors.success;
        if (ratio >= 0.95) barColor = colors.error;
        else if (ratio >= 0.8) barColor = colors.primary;

        return (
          <View key={i} style={styles.row}>
            <Text style={styles.categoryLabel} numberOfLines={1}>
              {item.category}
            </Text>

            <View style={styles.barArea}>
              {/* Budget reference line */}
              <View style={[styles.budgetBar, { width: `${budgetWidth}%` }]} />
              {/* Actual fill */}
              <View style={[styles.actualBar, { width: `${actualWidth}%`, backgroundColor: barColor }]} />

              <View style={styles.amountRow}>
                <Text style={[styles.amountText, { color: barColor }]}>
                  {formatCurrency(actual)}
                </Text>
                <Text style={styles.budgetText}>/ {formatCurrency(budgeted)}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS_BG,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerValue: {
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    gap: spacing.xs,
  },
  categoryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  barArea: {
    height: 28,
    position: 'relative',
    justifyContent: 'center',
  },
  budgetBar: {
    position: 'absolute',
    height: 8,
    backgroundColor: 'rgba(255, 248, 230, 0.1)',
    borderRadius: radii.round,
    top: 10,
  },
  actualBar: {
    position: 'absolute',
    height: 8,
    borderRadius: radii.round,
    top: 10,
  },
  amountRow: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  amountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  budgetText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  empty: {
    color: colors.textTertiary,
    fontSize: 14,
    padding: spacing.xl,
    textAlign: 'center',
  },
});

export default BudgetBarChart;
