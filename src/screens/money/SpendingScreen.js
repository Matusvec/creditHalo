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
import { format, subMonths } from 'date-fns';
import { GradientBackground, GlassCard } from '../../components/ui';
import SpendingPieChart from '../../components/charts/SpendingPieChart';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { useHaptic } from '../../hooks/useHaptic';
import { useStore } from '../../store/useStore';
import {
  generateTransactions,
  getSpendingByCategory,
  detectAnomalies,
} from '../../services/mockTransactions';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

const MONTH_COUNT = 6;

/** Maps category names to Ionicons identifiers */
const CATEGORY_ICONS = {
  Groceries: 'basket-outline',
  Dining: 'restaurant-outline',
  Gas: 'car-outline',
  Transportation: 'car-sport-outline',
  Shopping: 'bag-outline',
  Entertainment: 'film-outline',
  Healthcare: 'medkit-outline',
  'Personal Care': 'cut-outline',
  Subscriptions: 'refresh-outline',
  Utilities: 'flash-outline',
  Rent: 'home-outline',
  Insurance: 'shield-outline',
};

/**
 * SpendingScreen — detailed monthly spending analytics with pie chart and category list.
 * @param {{ navigation: object }} props
 */
export default function SpendingScreen({ navigation }) {
  const { transactions, transactionsGenerated, setTransactions } = useStore();
  const [monthOffset, setMonthOffset] = useState(0);
  const { trigger } = useHaptic();

  const headerStyle = useEntranceAnimation(0);
  const selectorStyle = useEntranceAnimation(100);
  const chartStyle = useEntranceAnimation(200);
  const listStyle = useEntranceAnimation(300);

  useEffect(() => {
    if (!transactionsGenerated) {
      const txns = generateTransactions(6);
      setTransactions(txns);
    }
  }, []);

  /** Current month's spending by category */
  const categoryData = useMemo(
    () => getSpendingByCategory(transactions, monthOffset),
    [transactions, monthOffset]
  );

  /** Previous month's spending for trend comparison */
  const prevCategoryData = useMemo(
    () => getSpendingByCategory(transactions, monthOffset + 1),
    [transactions, monthOffset]
  );

  const totalSpending = useMemo(
    () => categoryData.reduce((sum, c) => sum + c.amount, 0),
    [categoryData]
  );

  const prevTotalSpending = useMemo(
    () => prevCategoryData.reduce((sum, c) => sum + c.amount, 0),
    [prevCategoryData]
  );

  const momChange = prevTotalSpending > 0
    ? Math.round(((totalSpending - prevTotalSpending) / prevTotalSpending) * 100)
    : 0;

  const anomalies = useMemo(
    () => detectAnomalies(transactions),
    [transactions]
  );

  const pieData = categoryData.map((c) => ({ label: c.category, value: c.amount }));

  const months = Array.from({ length: MONTH_COUNT }, (_, i) => {
    const d = subMonths(new Date(), i);
    return { label: format(d, 'MMM'), offset: i };
  });

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
            <Text style={styles.title}>Spending</Text>
            <Text style={styles.subtitle}>Monthly category breakdown</Text>
          </Animated.View>

          {/* Month selector */}
          <Animated.View style={selectorStyle}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.monthChips}
            >
              {months.map((m) => (
                <Pressable
                  key={m.offset}
                  style={[styles.monthChip, monthOffset === m.offset && styles.monthChipActive]}
                  onPress={() => {
                    trigger('light');
                    setMonthOffset(m.offset);
                  }}
                >
                  <Text
                    style={[
                      styles.monthChipText,
                      monthOffset === m.offset && styles.monthChipTextActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Total spending card */}
          <Animated.View style={chartStyle}>
            <GlassCard style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Spending</Text>
              <Text style={styles.totalAmount}>${totalSpending.toFixed(0)}</Text>
              {momChange !== 0 && (
                <View style={styles.momRow}>
                  <Ionicons
                    name={momChange > 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={momChange > 0 ? colors.error : colors.success}
                  />
                  <Text
                    style={[
                      styles.momText,
                      { color: momChange > 0 ? colors.error : colors.success },
                    ]}
                  >
                    {momChange > 0 ? '+' : ''}{momChange}% vs last month
                  </Text>
                </View>
              )}
            </GlassCard>
          </Animated.View>

          {/* Pie chart */}
          <Animated.View style={chartStyle}>
            <SpendingPieChart data={pieData} size={160} showLabels />
          </Animated.View>

          {/* Anomaly alerts */}
          {anomalies.length > 0 && monthOffset === 0 && (
            <Animated.View style={listStyle}>
              {anomalies.slice(0, 3).map((alert) => (
                <GlassCard key={alert.category} style={styles.alertCard}>
                  <View style={styles.alertRow}>
                    <Ionicons name="warning-outline" size={16} color={colors.primary} />
                    <Text style={styles.alertText}>{alert.message}</Text>
                  </View>
                </GlassCard>
              ))}
            </Animated.View>
          )}

          {/* Category breakdown list */}
          <Animated.View style={listStyle}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            <GlassCard noPadding style={styles.listCard}>
              {categoryData.length === 0 ? (
                <Text style={styles.emptyText}>No spending data for this month</Text>
              ) : (
                categoryData.map((cat, index) => {
                  const prev = prevCategoryData.find((p) => p.category === cat.category);
                  const trend = prev
                    ? Math.round(((cat.amount - prev.amount) / prev.amount) * 100)
                    : null;
                  const icon = CATEGORY_ICONS[cat.category] || 'ellipse-outline';

                  return (
                    <Pressable
                      key={cat.category}
                      style={({ pressed }) => [
                        styles.categoryRow,
                        index < categoryData.length - 1 && styles.categoryRowBorder,
                        pressed && styles.categoryRowPressed,
                      ]}
                      onPress={() => {
                        trigger('light');
                        navigation.navigate('CategoryDetail', {
                          category: cat.category,
                          monthOffset,
                        });
                      }}
                    >
                      <View style={styles.categoryIcon}>
                        <Ionicons name={icon} size={16} color={colors.primary} />
                      </View>
                      <Text style={styles.categoryName}>{cat.category}</Text>
                      <View style={styles.categoryRight}>
                        {trend !== null && (
                          <View style={styles.trendBadge}>
                            <Ionicons
                              name={trend > 0 ? 'arrow-up' : 'arrow-down'}
                              size={10}
                              color={trend > 0 ? colors.error : colors.success}
                            />
                            <Text
                              style={[
                                styles.trendText,
                                { color: trend > 0 ? colors.error : colors.success },
                              ]}
                            >
                              {Math.abs(trend)}%
                            </Text>
                          </View>
                        )}
                        <Text style={styles.categoryAmount}>${cat.amount.toFixed(0)}</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={13}
                          color={colors.textTertiary}
                        />
                      </View>
                    </Pressable>
                  );
                })
              )}
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
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
  monthChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  monthChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    backgroundColor: GLASS_BG,
  },
  monthChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  monthChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  monthChipTextActive: {
    color: colors.background,
    fontWeight: '700',
  },
  totalCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  totalLabel: {
    fontSize: 13,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  momRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  momText: {
    fontSize: 13,
    fontWeight: '500',
  },
  alertCard: {
    borderColor: 'rgba(212, 168, 67, 0.3)',
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
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  listCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    padding: spacing.xl,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 215, 0, 0.1)',
  },
  categoryRowPressed: {
    backgroundColor: 'rgba(255, 248, 230, 0.04)',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.round,
    backgroundColor: 'rgba(212, 168, 67, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
