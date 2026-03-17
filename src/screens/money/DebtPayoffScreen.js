import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';
import { useStore } from '../../store/useStore';
import { MOCK_ACCOUNTS } from '../../services/mockAccounts';
import {
  calculateSnowball,
  calculateAvalanche,
  compareStrategies,
  calculateExtraPaymentImpact,
} from '../../services/debtPayoffCalculator';
import { GradientBackground, GlassCard, ProgressBar } from '../../components/ui';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { useHaptic } from '../../hooks/useHaptic';
import DebtPayoffChart from '../../components/charts/DebtPayoffChart';

const EXTRA_STEP = 25;
const EXTRA_MAX = 500;

const fmtUSD = (n) =>
  `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtK = (n) =>
  Math.abs(n) >= 1000 ? `$${(Math.abs(n) / 1000).toFixed(1)}k` : `$${Math.abs(n).toFixed(0)}`;

/** Stepper control */
function Stepper({ value, onIncrement, onDecrement, label, min = 0, max = Infinity }) {
  const { trigger } = useHaptic();
  return (
    <View style={styles.stepper}>
      <Pressable
        style={[styles.stepBtn, value <= min && styles.stepBtnDisabled]}
        onPress={() => { if (value > min) { trigger('light'); onDecrement(); } }}
        disabled={value <= min}
      >
        <Ionicons name="remove" size={18} color={value <= min ? colors.textTertiary : colors.primary} />
      </Pressable>
      <View style={styles.stepValue}>
        <Text style={styles.stepValueText}>{label || value}</Text>
      </View>
      <Pressable
        style={[styles.stepBtn, value >= max && styles.stepBtnDisabled]}
        onPress={() => { if (value < max) { trigger('light'); onIncrement(); } }}
        disabled={value >= max}
      >
        <Ionicons name="add" size={18} color={value >= max ? colors.textTertiary : colors.primary} />
      </Pressable>
    </View>
  );
}

/** Build monthly remaining-balance chart data from a payoff schedule */
function buildChartData(schedule, sampleCount = 24) {
  if (!schedule || !schedule.length) return [];

  const step = Math.max(1, Math.floor(schedule.length / sampleCount));
  const result = [];

  for (let i = 0; i < schedule.length; i += step) {
    const month = schedule[i];
    const totalRemaining = month.payments.reduce((s, p) => s + p.remaining, 0);
    const label = i === 0 ? 'Now' : i === Math.floor(schedule.length / 2) ? `${i}mo` : '';
    result.push({ value: Math.round(totalRemaining), label });
  }

  // Always include the final zero point
  if (result[result.length - 1]?.value !== 0) {
    result.push({ value: 0, label: 'Paid' });
  }

  return result;
}

/** Single debt summary card */
function DebtCard({ debt }) {
  return (
    <View style={styles.debtCard}>
      <View style={styles.debtHeader}>
        <View style={[styles.debtDot, { backgroundColor: colors.error }]} />
        <Text style={styles.debtName} numberOfLines={1}>{debt.name}</Text>
        <Text style={styles.debtBalance}>{fmtUSD(debt.balance)}</Text>
      </View>
      <View style={styles.debtMeta}>
        <Text style={styles.debtMetaText}>{debt.rate}% APR</Text>
        <Text style={styles.debtMetaText}>Min: ${debt.minPayment.toFixed(0)}/mo</Text>
      </View>
    </View>
  );
}

/**
 * DebtPayoffScreen — Snowball vs Avalanche comparison with extra payment simulator.
 */
export default function DebtPayoffScreen() {
  const accounts = useStore((s) => s.accounts);
  const { trigger } = useHaptic();

  const [extraPayment, setExtraPayment] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState('avalanche');

  const headerAnim = useEntranceAnimation(0);
  const debtsAnim = useEntranceAnimation(100);
  const comparisonAnim = useEntranceAnimation(200);
  const chartAnim = useEntranceAnimation(300);
  const extraAnim = useEntranceAnimation(400);
  const motivationAnim = useEntranceAnimation(500);

  const displayAccounts = accounts.length ? accounts : MOCK_ACCOUNTS;

  const debts = useMemo(() => {
    return displayAccounts
      .filter((a) => a.type === 'credit' || a.type === 'loan')
      .map((a) => ({
        id: a.id,
        name: a.name,
        balance: Math.abs(a.balance),
        rate: a.rate || 0,
        minPayment: a.minPayment || Math.max(25, Math.abs(a.balance) * 0.02),
      }));
  }, [displayAccounts]);

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);

  const comparison = useMemo(() => compareStrategies(debts, extraPayment), [debts, extraPayment]);

  // Full schedules for chart data
  const snowballResult = useMemo(() => calculateSnowball(debts, extraPayment), [debts, extraPayment]);
  const avalancheResult = useMemo(() => calculateAvalanche(debts, extraPayment), [debts, extraPayment]);

  const snowballChartData = useMemo(() => buildChartData(snowballResult.schedule), [snowballResult]);
  const avalancheChartData = useMemo(() => buildChartData(avalancheResult.schedule), [avalancheResult]);

  const extraImpact = useMemo(
    () => (extraPayment > 0 ? calculateExtraPaymentImpact(debts, extraPayment) : null),
    [debts, extraPayment]
  );

  // Best strategy for debt-free date
  const bestResult = comparison.avalanche.totalInterest <= comparison.snowball.totalInterest
    ? comparison.avalanche
    : comparison.snowball;

  // Milestone: original balances vs current (use originalBalance if available)
  const totalOriginal = displayAccounts
    .filter((a) => a.type === 'credit' || a.type === 'loan')
    .reduce((s, a) => {
      const orig = a.originalBalance ? Math.abs(a.originalBalance) : Math.abs(a.balance);
      return s + orig;
    }, 0);

  const paidOffPct = totalOriginal > 0
    ? Math.round(((totalOriginal - totalDebt) / totalOriginal) * 100)
    : 0;

  const milestones = [25, 50, 75, 100];

  const interestSaved = comparison.interestSaved;
  const avalancheFaster = comparison.snowball.totalMonths - comparison.avalanche.totalMonths;

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={headerAnim}>
            <Text style={styles.title}>Debt Payoff</Text>
            <Text style={styles.subtitle}>Compare strategies and find the fastest path to zero</Text>
          </Animated.View>

          {/* Current Debts */}
          <Animated.View style={debtsAnim}>
            <Text style={styles.sectionTitle}>Current Debts</Text>
            <GlassCard style={styles.totalDebtCard}>
              <Ionicons name="wallet-outline" size={20} color={colors.error} />
              <Text style={styles.totalDebtLabel}>Total Debt</Text>
              <Text style={styles.totalDebtValue}>{fmtUSD(totalDebt)}</Text>
            </GlassCard>
            {debts.map((d) => <DebtCard key={d.id} debt={d} />)}
          </Animated.View>

          {/* Strategy Comparison */}
          <Animated.View style={comparisonAnim}>
            <Text style={styles.sectionTitle}>Strategy Comparison</Text>

            <View style={styles.strategyRow}>
              {/* Snowball */}
              <Pressable
                style={[
                  styles.strategyCard,
                  selectedStrategy === 'snowball' && styles.strategyCardActive,
                ]}
                onPress={() => { trigger('light'); setSelectedStrategy('snowball'); }}
              >
                <View style={styles.strategyHeader}>
                  <Text style={styles.strategyIcon}>⛄</Text>
                  <Text style={styles.strategyName}>Snowball</Text>
                </View>
                <Text style={styles.strategyDesc}>Smallest balance first</Text>
                <View style={styles.strategyStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Interest</Text>
                    <Text style={[styles.statValue, { color: colors.error }]}>
                      {fmtK(comparison.snowball.totalInterest)}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Payoff</Text>
                    <Text style={styles.statValue}>{comparison.snowball.payoffDate}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Months</Text>
                    <Text style={styles.statValue}>{comparison.snowball.totalMonths}</Text>
                  </View>
                </View>
              </Pressable>

              {/* Avalanche */}
              <Pressable
                style={[
                  styles.strategyCard,
                  selectedStrategy === 'avalanche' && styles.strategyCardActive,
                ]}
                onPress={() => { trigger('light'); setSelectedStrategy('avalanche'); }}
              >
                <View style={styles.strategyHeader}>
                  <Text style={styles.strategyIcon}>🏔️</Text>
                  <Text style={styles.strategyName}>Avalanche</Text>
                </View>
                <Text style={styles.strategyDesc}>Highest rate first</Text>
                <View style={styles.strategyStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Interest</Text>
                    <Text style={[styles.statValue, { color: colors.success }]}>
                      {fmtK(comparison.avalanche.totalInterest)}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Payoff</Text>
                    <Text style={styles.statValue}>{comparison.avalanche.payoffDate}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Months</Text>
                    <Text style={styles.statValue}>{comparison.avalanche.totalMonths}</Text>
                  </View>
                </View>
              </Pressable>
            </View>

            {/* Winner callout */}
            {interestSaved > 0 ? (
              <GlassCard style={styles.winnerCard}>
                <Ionicons name="trophy-outline" size={16} color={colors.primary} />
                <Text style={styles.winnerText}>
                  Avalanche saves{' '}
                  <Text style={{ color: colors.success, fontWeight: '700' }}>
                    {fmtUSD(interestSaved)}
                  </Text>{' '}
                  in interest
                  {avalancheFaster > 0
                    ? ` and pays off ${avalancheFaster} month${avalancheFaster !== 1 ? 's' : ''} sooner`
                    : ''}
                  .
                </Text>
              </GlassCard>
            ) : (
              <GlassCard style={styles.winnerCard}>
                <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.winnerText}>
                  Both strategies have similar outcomes with your current debts.
                </Text>
              </GlassCard>
            )}
          </Animated.View>

          {/* Payoff Timeline Chart */}
          <Animated.View style={chartAnim}>
            <Text style={styles.sectionTitle}>Payoff Timeline</Text>
            <DebtPayoffChart
              snowballData={snowballChartData}
              avalancheData={avalancheChartData}
              height={200}
            />
          </Animated.View>

          {/* Extra Payment Simulator */}
          <Animated.View style={extraAnim}>
            <Text style={styles.sectionTitle}>Extra Payment Simulator</Text>
            <GlassCard>
              <Text style={styles.simLabel}>Extra Monthly Payment</Text>
              <Stepper
                value={extraPayment}
                onIncrement={() => setExtraPayment((v) => Math.min(v + EXTRA_STEP, EXTRA_MAX))}
                onDecrement={() => setExtraPayment((v) => Math.max(v - EXTRA_STEP, 0))}
                label={`+$${extraPayment}/mo`}
                min={0}
                max={EXTRA_MAX}
              />

              {extraImpact && extraPayment > 0 && (
                <View style={styles.impactBox}>
                  <View style={styles.impactRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.success} />
                    <Text style={styles.impactText}>
                      Pay off{' '}
                      <Text style={{ color: colors.success, fontWeight: '700' }}>
                        {extraImpact.monthsSaved} month{extraImpact.monthsSaved !== 1 ? 's' : ''} sooner
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.impactRow}>
                    <Ionicons name="cash-outline" size={14} color={colors.success} />
                    <Text style={styles.impactText}>
                      Save{' '}
                      <Text style={{ color: colors.success, fontWeight: '700' }}>
                        {fmtUSD(extraImpact.interestSaved)}
                      </Text>{' '}
                      in interest
                    </Text>
                  </View>
                  <View style={styles.impactRow}>
                    <Ionicons name="flag-outline" size={14} color={colors.primary} />
                    <Text style={styles.impactText}>
                      New payoff date:{' '}
                      <Text style={{ color: colors.primary, fontWeight: '700' }}>
                        {extraImpact.newPayoffDate}
                      </Text>
                    </Text>
                  </View>
                </View>
              )}
            </GlassCard>
          </Animated.View>

          {/* Debt-Free Countdown + Milestones */}
          <Animated.View style={motivationAnim}>
            {/* Debt-free date card */}
            <GlassCard style={styles.debtFreeCard}>
              <View style={styles.debtFreeHeader}>
                <Ionicons name="star-outline" size={22} color={colors.primary} />
                <Text style={styles.debtFreeTitle}>Debt-Free Date</Text>
              </View>
              <Text style={styles.debtFreeDate}>{bestResult.payoffDate}</Text>
              <Text style={styles.debtFreeCaption}>
                {bestResult.totalMonths} months · using{' '}
                {comparison.avalanche.totalInterest <= comparison.snowball.totalInterest
                  ? 'Avalanche'
                  : 'Snowball'}{' '}
                strategy
              </Text>
            </GlassCard>

            {/* Milestones */}
            <Text style={styles.sectionTitle}>Payoff Milestones</Text>
            <GlassCard>
              {milestones.map((pct) => {
                const reached = paidOffPct >= pct;
                return (
                  <View key={pct} style={styles.milestoneRow}>
                    <Ionicons
                      name={reached ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={reached ? colors.success : colors.textTertiary}
                    />
                    <View style={styles.milestoneInfo}>
                      <Text style={[styles.milestonePct, reached && { color: colors.success }]}>
                        {pct}% Paid Off
                      </Text>
                      {pct === 100 && (
                        <Text style={styles.milestoneCaption}>Completely debt-free!</Text>
                      )}
                    </View>
                    {reached && (
                      <View style={styles.reachedBadge}>
                        <Text style={styles.reachedText}>Reached</Text>
                      </View>
                    )}
                  </View>
                );
              })}
              <View style={{ marginTop: spacing.md }}>
                <ProgressBar progress={paidOffPct / 100} height={8} />
                <Text style={styles.progressLabel}>{paidOffPct}% of original debt paid</Text>
              </View>
            </GlassCard>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  totalDebtCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  totalDebtLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  totalDebtValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.error,
  },
  debtCard: {
    backgroundColor: GLASS_BG,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  debtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  debtDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  debtName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  debtBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  debtMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingLeft: 20,
  },
  debtMetaText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  strategyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  strategyCard: {
    flex: 1,
    backgroundColor: GLASS_BG,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: spacing.md,
  },
  strategyCardActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  strategyIcon: {
    fontSize: 16,
  },
  strategyName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  strategyDesc: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  strategyStats: {
    gap: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  winnerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  winnerText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  simLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  stepBtnDisabled: {
    backgroundColor: GLASS_BG,
    borderColor: GLASS_BORDER,
  },
  stepValue: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: GLASS_BG,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  stepValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  impactBox: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    backgroundColor: 'rgba(93, 187, 99, 0.08)',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(93, 187, 99, 0.2)',
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  impactText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  debtFreeCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.sm,
  },
  debtFreeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  debtFreeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  debtFreeDate: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  debtFreeCaption: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
  },
  milestoneInfo: {
    flex: 1,
    gap: 2,
  },
  milestonePct: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  milestoneCaption: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  reachedBadge: {
    backgroundColor: `${colors.success}22`,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  reachedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
