import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { GradientBackground, GlassCard, AnimatedButton, ProgressBar } from '../../components/ui';
import BudgetCategoryCard from '../../components/budget/BudgetCategoryCard';
import AddBudgetModal from '../../components/budget/AddBudgetModal';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { useHaptic } from '../../hooks/useHaptic';
import { useStore } from '../../store/useStore';
import { generateTransactions, getSpendingByCategory } from '../../services/mockTransactions';
import { getBudgetVsActual, getBudgetAlerts, suggestBudgets } from '../../services/budgetAnalysis';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

/**
 * BudgetScreen — monthly budget tracking with per-category progress.
 * @param {{ navigation: object }} props
 */
export default function BudgetScreen({ navigation }) {
  const {
    budgets,
    setBudget,
    removeBudget,
    transactions,
    transactionsGenerated,
    setTransactions,
    persist,
  } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const { trigger } = useHaptic();

  const headerStyle = useEntranceAnimation(0);
  const summaryStyle = useEntranceAnimation(150);
  const listStyle = useEntranceAnimation(250);

  useEffect(() => {
    if (!transactionsGenerated) {
      const txns = generateTransactions(6);
      setTransactions(txns);
    }
  }, []);

  /** Convert budgets object to array expected by service functions */
  const budgetArray = useMemo(
    () =>
      Object.entries(budgets).map(([category, data]) => ({
        category,
        amount: data.limit ?? data.amount ?? data,
      })),
    [budgets]
  );

  /** Budget vs actual for current month */
  const budgetComparison = useMemo(
    () => getBudgetVsActual(budgetArray, transactions, 0),
    [budgetArray, transactions]
  );

  /** Sorted by percent used, overspent first */
  const sortedBudgets = useMemo(
    () => [...budgetComparison].sort((a, b) => b.percentUsed - a.percentUsed),
    [budgetComparison]
  );

  const alerts = useMemo(
    () => getBudgetAlerts(budgetArray, transactions, 0),
    [budgetArray, transactions]
  );

  const suggestions = useMemo(
    () => suggestBudgets(transactions),
    [transactions]
  );

  /** Current month spending for detecting unbudgeted categories */
  const currentSpending = useMemo(
    () => getSpendingByCategory(transactions, 0),
    [transactions]
  );

  const unbudgetedCategories = useMemo(() => {
    const budgetedCats = new Set(budgetArray.map((b) => b.category));
    return currentSpending.filter((s) => !budgetedCats.has(s.category));
  }, [currentSpending, budgetArray]);

  const totalBudgeted = budgetComparison.reduce((s, b) => s + b.budgeted, 0);
  const totalActual = budgetComparison.reduce((s, b) => s + b.actual, 0);
  const overallProgress = totalBudgeted > 0 ? Math.min(totalActual / totalBudgeted, 1) : 0;

  const handleAddBudget = (category, amount) => {
    trigger('light');
    setBudget(category, amount);
    persist();
  };

  const handleRemoveBudget = (category) => {
    trigger('medium');
    removeBudget(category);
    persist();
  };

  const currentMonthLabel = format(new Date(), 'MMMM yyyy');

  /** Suggested category from 3-month averages for the smart card */
  const topSuggestion = suggestions.find(
    (s) => !budgets[s.category]
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={headerStyle}>
            <Text style={styles.title}>Budgets</Text>
            <Text style={styles.subtitle}>{currentMonthLabel}</Text>
          </Animated.View>

          {/* Overall summary card */}
          <Animated.View style={summaryStyle}>
            <GlassCard style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View>
                  <Text style={styles.summaryLabel}>Total Spending</Text>
                  <Text style={styles.summaryAmount}>${totalActual.toFixed(0)}</Text>
                </View>
                <View style={styles.summaryRight}>
                  <Text style={styles.summaryBudgetLabel}>Budgeted</Text>
                  <Text style={styles.summaryBudget}>${totalBudgeted.toFixed(0)}</Text>
                </View>
              </View>
              <ProgressBar progress={overallProgress} height={8} style={styles.overallBar} />
              <Text style={styles.overallPct}>
                {Math.round(overallProgress * 100)}% of total budget used
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Budget alerts */}
          {alerts.length > 0 && (
            <Animated.View style={listStyle}>
              {alerts.map((alert) => {
                const alertColor =
                  alert.severity === 'over'
                    ? colors.error
                    : alert.severity === 'danger'
                    ? colors.primary
                    : colors.primary;
                return (
                  <GlassCard
                    key={alert.category}
                    style={[styles.alertCard, { borderColor: `${alertColor}40` }]}
                  >
                    <View style={styles.alertRow}>
                      <Ionicons
                        name={
                          alert.severity === 'over'
                            ? 'alert-circle-outline'
                            : 'warning-outline'
                        }
                        size={16}
                        color={alertColor}
                      />
                      <Text style={[styles.alertText, { color: alertColor }]}>
                        {alert.message}
                      </Text>
                    </View>
                  </GlassCard>
                );
              })}
            </Animated.View>
          )}

          {/* Per-category budget cards */}
          <Animated.View style={listStyle}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {sortedBudgets.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="wallet-outline" size={32} color={colors.textTertiary} style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No budgets set</Text>
                <Text style={styles.emptySubtitle}>Add a budget to start tracking your spending.</Text>
              </GlassCard>
            ) : (
              sortedBudgets.map((item) => (
                <BudgetCategoryCard
                  key={item.category}
                  item={item}
                  onDelete={() => handleRemoveBudget(item.category)}
                />
              ))
            )}
          </Animated.View>

          {/* Unbudgeted spending */}
          {unbudgetedCategories.length > 0 && (
            <Animated.View style={listStyle}>
              <Text style={styles.sectionTitle}>Unbudgeted Spending</Text>
              <GlassCard noPadding style={styles.listCard}>
                {unbudgetedCategories.map((cat, index) => (
                  <View
                    key={cat.category}
                    style={[
                      styles.unbudgetedRow,
                      index < unbudgetedCategories.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <View style={styles.unbudgetedInfo}>
                      <Text style={styles.unbudgetedName}>{cat.category}</Text>
                      <Text style={styles.unbudgetedAmount}>${cat.amount.toFixed(0)}</Text>
                    </View>
                    <Pressable
                      style={styles.setBudgetBtn}
                      onPress={() => {
                        trigger('light');
                        setModalVisible(true);
                      }}
                    >
                      <Text style={styles.setBudgetText}>Set Budget</Text>
                    </Pressable>
                  </View>
                ))}
              </GlassCard>
            </Animated.View>
          )}

          {/* Smart suggestion card */}
          {topSuggestion && (
            <Animated.View style={listStyle}>
              <GlassCard style={styles.suggestionCard}>
                <View style={styles.suggestionRow}>
                  <Ionicons name="bulb-outline" size={18} color={colors.primary} />
                  <Text style={styles.suggestionText}>
                    Based on your 3-month average, try{' '}
                    <Text style={styles.suggestionHighlight}>
                      ${topSuggestion.suggested}
                    </Text>{' '}
                    for {topSuggestion.category}
                  </Text>
                  <Pressable
                    style={styles.applySuggestion}
                    onPress={() => handleAddBudget(topSuggestion.category, topSuggestion.suggested)}
                  >
                    <Text style={styles.applySuggestionText}>Apply</Text>
                  </Pressable>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Add budget button */}
          <Animated.View style={listStyle}>
            <AnimatedButton
              title="Add Budget Category"
              variant="secondary"
              onPress={() => {
                trigger('light');
                setModalVisible(true);
              }}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      <AddBudgetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddBudget}
        suggestions={suggestions}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
    gap: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  summaryCard: {
    gap: spacing.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryBudgetLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  summaryBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  overallBar: {
    marginVertical: spacing.xs,
  },
  overallPct: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  alertCard: {
    marginBottom: spacing.xs,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  listCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 215, 0, 0.1)',
  },
  unbudgetedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  unbudgetedInfo: {
    flex: 1,
    gap: 2,
  },
  unbudgetedName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  unbudgetedAmount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  setBudgetBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(212, 168, 67, 0.08)',
  },
  setBudgetText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  suggestionCard: {
    borderColor: 'rgba(212, 168, 67, 0.3)',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  suggestionHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  applySuggestion: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
  },
  applySuggestionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
  },
});
