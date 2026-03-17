import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';
import { useStore } from '../../store/useStore';
import {
  MOCK_ACCOUNTS,
  MOCK_HOLDINGS,
  getNetWorthHistory,
  getInvestmentPerformance,
  getPortfolioAllocation,
} from '../../services/mockAccounts';
import { GradientBackground, GlassCard } from '../../components/ui';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import AllocationPieChart from '../../components/charts/AllocationPieChart';
import TrendLineChart from '../../components/charts/TrendLineChart';
import HoldingCard from '../../components/investments/HoldingCard';

const fmtFull = (n) =>
  `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * InvestmentsScreen — portfolio tracker showing value, allocation, and holdings.
 */
export default function InvestmentsScreen({ navigation }) {
  const { accounts, holdings, setAccounts, setHoldings, setNetWorthHistory } = useStore();

  const headerAnim = useEntranceAnimation(0);
  const heroAnim = useEntranceAnimation(100);
  const allocationAnim = useEntranceAnimation(200);
  const holdingsAnim = useEntranceAnimation(300);
  const perfAnim = useEntranceAnimation(400);

  useEffect(() => {
    if (!accounts.length) {
      setAccounts(MOCK_ACCOUNTS);
      setHoldings(MOCK_HOLDINGS);
      setNetWorthHistory(getNetWorthHistory(12));
    }
  }, []);

  const displayAccounts = accounts.length ? accounts : MOCK_ACCOUNTS;
  const displayHoldings = holdings.length ? holdings : MOCK_HOLDINGS;

  // Investment and retirement accounts
  const investAccounts = displayAccounts.filter(
    (a) => a.type === 'investment' || a.type === 'retirement'
  );
  const totalPortfolio = investAccounts.reduce((s, a) => s + a.balance, 0);

  const brokerageAccount = investAccounts.find((a) => a.type === 'investment');
  const retirementAccount = investAccounts.find((a) => a.type === 'retirement');

  // Performance data
  const performance = useMemo(() => getInvestmentPerformance(), []);
  const totalGainLoss = performance.reduce((s, p) => s + p.gainLoss, 0);
  const totalCost = performance.reduce((s, p) => s + p.totalCost, 0);
  const totalGainLossPct = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const isPositive = totalGainLoss >= 0;

  // Allocation data for pie chart
  const allocation = useMemo(() => getPortfolioAllocation(), []);
  const pieData = allocation.map((a) => ({ label: a.type, value: a.value }));

  // Sort holdings by total value descending
  const sortedPerformance = [...performance].sort((a, b) => b.totalValue - a.totalValue);

  // Simulated growth trend: from portfolio * 0.85 up to current
  const growthData = useMemo(() => {
    const months = 12;
    return Array.from({ length: months }, (_, i) => {
      const progress = i / (months - 1);
      const value = Math.round((totalPortfolio * 0.85 + totalPortfolio * 0.15 * progress) * 100) / 100;
      const label = i === 0 ? '12M ago' : i === months - 1 ? 'Now' : i === 5 ? '6M ago' : '';
      return { value, label };
    });
  }, [totalPortfolio]);

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={headerAnim}>
            <Text style={styles.title}>Investments</Text>
            <Text style={styles.subtitle}>Portfolio overview and holdings</Text>
          </Animated.View>

          {/* Portfolio Hero Card */}
          <Animated.View style={heroAnim}>
            <GlassCard style={styles.heroCard}>
              <Text style={styles.heroLabel}>Total Portfolio Value</Text>
              <Text style={styles.heroValue}>{fmtFull(totalPortfolio)}</Text>

              <View style={styles.gainRow}>
                <Ionicons
                  name={isPositive ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={isPositive ? colors.success : colors.error}
                />
                <Text style={[styles.gainAmount, { color: isPositive ? colors.success : colors.error }]}>
                  {isPositive ? '+' : ''}{fmtFull(totalGainLoss)}
                </Text>
                <Text style={[styles.gainPct, { color: isPositive ? colors.success : colors.error }]}>
                  ({isPositive ? '+' : ''}{totalGainLossPct.toFixed(2)}%)
                </Text>
                <Text style={styles.gainLabel}>all time</Text>
              </View>

              {/* Account breakdown */}
              <View style={styles.accountBreakdown}>
                {brokerageAccount && (
                  <View style={styles.breakdownItem}>
                    <Ionicons name="bar-chart-outline" size={14} color={colors.primary} />
                    <Text style={styles.breakdownLabel}>Brokerage</Text>
                    <Text style={styles.breakdownValue}>{fmtFull(brokerageAccount.balance)}</Text>
                  </View>
                )}
                {retirementAccount && (
                  <View style={styles.breakdownItem}>
                    <Ionicons name="umbrella-outline" size={14} color={colors.primaryLight} />
                    <Text style={styles.breakdownLabel}>401(k)</Text>
                    <Text style={styles.breakdownValue}>{fmtFull(retirementAccount.balance)}</Text>
                  </View>
                )}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Allocation Pie Chart */}
          <Animated.View style={allocationAnim}>
            <Text style={styles.sectionTitle}>Allocation</Text>
            <AllocationPieChart data={pieData} showPercentages />
          </Animated.View>

          {/* Holdings List */}
          <Animated.View style={holdingsAnim}>
            <Text style={styles.sectionTitle}>Holdings</Text>
            {sortedPerformance.map((p) => (
              <HoldingCard
                key={p.holding.id}
                holding={p.holding}
                performance={p}
              />
            ))}
          </Animated.View>

          {/* Performance Trend */}
          <Animated.View style={perfAnim}>
            <Text style={styles.sectionTitle}>12-Month Growth</Text>
            <TrendLineChart
              data={growthData}
              color={colors.primary}
              showArea
              yAxisPrefix="$"
              height={180}
              formatLabel={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: spacing.xl,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroLabel: {
    fontSize: 13,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  heroValue: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  gainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  gainAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  gainPct: {
    fontSize: 13,
    fontWeight: '500',
  },
  gainLabel: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  accountBreakdown: {
    flexDirection: 'row',
    gap: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: GLASS_BORDER,
    paddingTop: spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  breakdownLabel: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
