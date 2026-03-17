import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { GradientBackground, GlassCard } from '../../components/ui';
import TrendLineChart from '../../components/charts/TrendLineChart';
import TransactionRow from '../../components/dashboard/TransactionRow';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { useStore } from '../../store/useStore';
import {
  getTransactionsByMonth,
  getSpendingByCategory,
} from '../../services/mockTransactions';
import { format, subMonths } from 'date-fns';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

/**
 * CategoryDetailModal — shows all transactions and analytics for a single category/month.
 * @param {{ route: { params: { category: string, monthOffset: number } }, navigation: object }} props
 */
export default function CategoryDetailModal({ route, navigation }) {
  const { category, monthOffset = 0 } = route.params || {};
  const { transactions } = useStore();

  const headerStyle = useEntranceAnimation(0);
  const statsStyle = useEntranceAnimation(100);
  const listStyle = useEntranceAnimation(200);
  const trendStyle = useEntranceAnimation(300);

  /** Transactions for the selected category and month */
  const monthlyTxns = useMemo(() => {
    const monthly = getTransactionsByMonth(transactions, monthOffset);
    return monthly
      .filter((t) => t.category === category && t.amount < 0)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, category, monthOffset]);

  const totalSpent = useMemo(
    () => monthlyTxns.reduce((s, t) => s + Math.abs(t.amount), 0),
    [monthlyTxns]
  );

  /** Group by merchant for breakdown */
  const merchantBreakdown = useMemo(() => {
    const map = {};
    for (const t of monthlyTxns) {
      if (!map[t.merchant]) map[t.merchant] = { merchant: t.merchant, total: 0, count: 0 };
      map[t.merchant].total += Math.abs(t.amount);
      map[t.merchant].count += 1;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [monthlyTxns]);

  /** 6-month trend data for this category */
  const trendData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const offset = 5 - i;
      const catData = getSpendingByCategory(transactions, offset);
      const found = catData.find((c) => c.category === category);
      const d = subMonths(new Date(), offset);
      return {
        value: found ? found.amount : 0,
        label: format(d, 'MMM'),
      };
    });
  }, [transactions, category]);

  const monthLabel = format(subMonths(new Date(), monthOffset), 'MMMM yyyy');

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
            <Text style={styles.title}>{category}</Text>
            <Text style={styles.subtitle}>{monthLabel}</Text>
          </Animated.View>

          {/* Total stat */}
          <Animated.View style={statsStyle}>
            <GlassCard style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Spent</Text>
              <Text style={styles.totalAmount}>${totalSpent.toFixed(2)}</Text>
              <Text style={styles.txCount}>{monthlyTxns.length} transactions</Text>
            </GlassCard>
          </Animated.View>

          {/* Merchant breakdown */}
          {merchantBreakdown.length > 0 && (
            <Animated.View style={statsStyle}>
              <Text style={styles.sectionTitle}>By Merchant</Text>
              <GlassCard noPadding style={styles.listCard}>
                {merchantBreakdown.map((m, index) => (
                  <View
                    key={m.merchant}
                    style={[
                      styles.merchantRow,
                      index < merchantBreakdown.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <View style={styles.merchantInfo}>
                      <Text style={styles.merchantName}>{m.merchant}</Text>
                      <Text style={styles.merchantCount}>{m.count} transaction{m.count !== 1 ? 's' : ''}</Text>
                    </View>
                    <Text style={styles.merchantTotal}>${m.total.toFixed(2)}</Text>
                  </View>
                ))}
              </GlassCard>
            </Animated.View>
          )}

          {/* Transaction list */}
          <Animated.View style={listStyle}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <GlassCard noPadding style={styles.listCard}>
              {monthlyTxns.length === 0 ? (
                <Text style={styles.emptyText}>No transactions this month</Text>
              ) : (
                monthlyTxns.map((txn, index) => (
                  <View
                    key={txn.id}
                    style={index < monthlyTxns.length - 1 ? styles.rowBorder : null}
                  >
                    <TransactionRow transaction={txn} />
                  </View>
                ))
              )}
            </GlassCard>
          </Animated.View>

          {/* 6-month trend */}
          <Animated.View style={trendStyle}>
            <Text style={styles.sectionTitle}>6-Month Trend</Text>
            <GlassCard>
              <TrendLineChart
                data={trendData}
                yAxisPrefix="$"
                color={colors.primary}
                showArea
                height={140}
              />
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
    fontSize: 15,
    color: colors.textSecondary,
  },
  totalCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  txCount: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: spacing.xs,
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
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 215, 0, 0.1)',
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  merchantInfo: {
    flex: 1,
    gap: 2,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  merchantCount: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  merchantTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
