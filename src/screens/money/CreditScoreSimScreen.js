import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../theme/colors';
import { spacing, radii, shadows, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';
import { useStore } from '../../store/useStore';
import { MOCK_ACCOUNTS } from '../../services/mockAccounts';
import {
  calculateBaseScore,
  getScoreFactors,
  simulatePayoff,
  simulateNewCard,
  simulateOnTimePayments,
  getPersonalizedTips,
} from '../../services/creditScoreSimulator';
import { GradientBackground, GlassCard, ProgressBar } from '../../components/ui';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { useHaptic } from '../../hooks/useHaptic';
import ScoreRing from '../../components/charts/ScoreRing';
import TrendLineChart from '../../components/charts/TrendLineChart';

/** Status badge component */
function StatusBadge({ status }) {
  const config = {
    good: { color: colors.success, label: 'Good' },
    fair: { color: colors.primary, label: 'Fair' },
    poor: { color: colors.error, label: 'Poor' },
  }[status] || { color: colors.textTertiary, label: 'N/A' };

  return (
    <View style={[styles.badge, { backgroundColor: `${config.color}22` }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

/** +/- stepper control */
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

/** Score delta display badge */
function ScoreDelta({ delta }) {
  if (delta === 0) return null;
  const isPos = delta > 0;
  return (
    <View style={[styles.deltaBadge, { backgroundColor: isPos ? `${colors.success}22` : `${colors.error}22` }]}>
      <Ionicons name={isPos ? 'arrow-up' : 'arrow-down'} size={12} color={isPos ? colors.success : colors.error} />
      <Text style={[styles.deltaText, { color: isPos ? colors.success : colors.error }]}>
        {isPos ? '+' : ''}{delta} pts
      </Text>
    </View>
  );
}

/**
 * CreditScoreSimScreen — interactive credit score simulator with what-if tools.
 */
export default function CreditScoreSimScreen() {
  const accounts = useStore((s) => s.accounts);
  const { trigger } = useHaptic();

  const displayAccounts = accounts.length ? accounts : MOCK_ACCOUNTS;

  const baseScore = useMemo(() => calculateBaseScore(displayAccounts), [displayAccounts]);
  const factors = useMemo(() => getScoreFactors(displayAccounts), [displayAccounts]);
  const tips = useMemo(() => getPersonalizedTips(displayAccounts), [displayAccounts]);

  const creditAccounts = displayAccounts.filter((a) => a.type === 'credit');
  const totalBalance = creditAccounts.reduce((s, a) => s + Math.abs(a.balance), 0);
  const totalLimit = creditAccounts.reduce((s, a) => s + (a.limit || 0), 0);

  // Simulator 1: Pay off debt
  const [payoffAmount, setPayoffAmount] = useState(0);
  const PAYOFF_STEP = 100;
  const payoffResult = useMemo(
    () => simulatePayoff(baseScore, payoffAmount, totalBalance, totalLimit),
    [baseScore, payoffAmount, totalBalance, totalLimit]
  );

  // Simulator 2: New credit card
  const [newCardLimit, setNewCardLimit] = useState(2000);
  const CARD_STEP = 1000;
  const newCardResult = useMemo(
    () => simulateNewCard(baseScore, newCardLimit, totalBalance, totalLimit),
    [baseScore, newCardLimit, totalBalance, totalLimit]
  );

  // Simulator 3: On-time payments
  const [paymentMonths, setPaymentMonths] = useState(6);
  const paymentResult = useMemo(
    () => simulateOnTimePayments(baseScore, paymentMonths),
    [baseScore, paymentMonths]
  );
  const paymentChartData = paymentResult.monthByMonth.map((m) => ({
    value: m.score,
    label: m.month?.slice(0, 3) || '',
  }));

  const headerAnim = useEntranceAnimation(0);
  const scoreAnim = useEntranceAnimation(100);
  const factorsAnim = useEntranceAnimation(200);
  const simAnim = useEntranceAnimation(300);
  const tipsAnim = useEntranceAnimation(400);

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={headerAnim}>
            <Text style={styles.title}>Score Simulator</Text>
            <Text style={styles.subtitle}>See how financial decisions affect your score</Text>
          </Animated.View>

          {/* Score Ring */}
          <Animated.View style={[scoreAnim, styles.scoreContainer]}>
            <GlassCard style={styles.scoreCard}>
              <Text style={styles.cardLabel}>Your Credit Score</Text>
              <ScoreRing score={baseScore} maxScore={850} size={160} strokeWidth={12} animated />
              <View style={styles.scoreRange}>
                <Text style={styles.scoreRangeText}>300</Text>
                <Text style={styles.scoreRangeLabel}>VantageScore 3.0</Text>
                <Text style={styles.scoreRangeText}>850</Text>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Score Factors */}
          <Animated.View style={factorsAnim}>
            <Text style={styles.sectionTitle}>Score Factors</Text>
            {factors.map((f) => (
              <GlassCard key={f.factor} style={styles.factorCard}>
                <View style={styles.factorHeader}>
                  <Text style={styles.factorName}>{f.factor}</Text>
                  <StatusBadge status={f.status} />
                </View>
                <ProgressBar
                  progress={f.score / f.maxScore}
                  height={6}
                  style={{ marginVertical: spacing.sm }}
                />
                <View style={styles.factorFooter}>
                  <Text style={styles.factorScore}>
                    {f.score}/{f.maxScore} pts
                  </Text>
                  <Text style={styles.factorDesc} numberOfLines={2}>{f.description}</Text>
                </View>
              </GlassCard>
            ))}
          </Animated.View>

          {/* Simulators */}
          <Animated.View style={simAnim}>
            <Text style={styles.sectionTitle}>What-If Simulators</Text>

            {/* Simulator 1: Pay off debt */}
            <GlassCard style={styles.simCard}>
              <View style={styles.simHeader}>
                <Ionicons name="card-outline" size={18} color={colors.primary} />
                <Text style={styles.simTitle}>Pay Off Debt</Text>
                <ScoreDelta delta={payoffResult.scoreDelta} />
              </View>
              <Text style={styles.simDescription}>
                How paying down credit card debt changes your utilization and score.
              </Text>

              <View style={styles.simControl}>
                <Text style={styles.simControlLabel}>Payoff Amount</Text>
                <Stepper
                  value={payoffAmount}
                  onIncrement={() => setPayoffAmount((v) => Math.min(v + PAYOFF_STEP, totalBalance))}
                  onDecrement={() => setPayoffAmount((v) => Math.max(v - PAYOFF_STEP, 0))}
                  label={`$${payoffAmount.toLocaleString()}`}
                  min={0}
                  max={totalBalance}
                />
              </View>

              <View style={styles.simCompare}>
                <View style={styles.simCompareItem}>
                  <Text style={styles.simCompareLabel}>Current Util.</Text>
                  <Text style={styles.simCompareValue}>{payoffResult.oldUtilization}%</Text>
                </View>
                <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
                <View style={styles.simCompareItem}>
                  <Text style={styles.simCompareLabel}>New Util.</Text>
                  <Text style={[styles.simCompareValue, { color: colors.success }]}>
                    {payoffResult.newUtilization}%
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
                <View style={styles.simCompareItem}>
                  <Text style={styles.simCompareLabel}>New Score</Text>
                  <Text style={[styles.simCompareValue, { color: colors.primary }]}>
                    {payoffResult.newScore}
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* Simulator 2: New Credit Card */}
            <GlassCard style={styles.simCard}>
              <View style={styles.simHeader}>
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.simTitle}>Open New Card</Text>
                <ScoreDelta delta={newCardResult.scoreDelta} />
              </View>
              <Text style={styles.simDescription}>
                Adding a new card reduces utilization but triggers a hard inquiry (-8 pts).
              </Text>

              <View style={styles.simControl}>
                <Text style={styles.simControlLabel}>New Credit Limit</Text>
                <Stepper
                  value={newCardLimit}
                  onIncrement={() => setNewCardLimit((v) => Math.min(v + CARD_STEP, 20000))}
                  onDecrement={() => setNewCardLimit((v) => Math.max(v - CARD_STEP, 1000))}
                  label={`$${newCardLimit.toLocaleString()}`}
                  min={1000}
                  max={20000}
                />
              </View>

              <View style={styles.simCompare}>
                <View style={styles.simCompareItem}>
                  <Text style={styles.simCompareLabel}>Current Score</Text>
                  <Text style={styles.simCompareValue}>{baseScore}</Text>
                </View>
                <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
                <View style={styles.simCompareItem}>
                  <Text style={styles.simCompareLabel}>New Util.</Text>
                  <Text style={[styles.simCompareValue, { color: colors.success }]}>
                    {newCardResult.newUtilization}%
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
                <View style={styles.simCompareItem}>
                  <Text style={styles.simCompareLabel}>Est. Score</Text>
                  <Text style={[styles.simCompareValue, { color: colors.primary }]}>
                    {newCardResult.newScore}
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* Simulator 3: On-time payments */}
            <GlassCard style={styles.simCard}>
              <View style={styles.simHeader}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.simTitle}>On-Time Payments</Text>
                <ScoreDelta delta={paymentResult.scoreDelta} />
              </View>
              <Text style={styles.simDescription}>
                Consistently paying on time is the biggest score factor (35% weight).
              </Text>

              <View style={styles.simControl}>
                <Text style={styles.simControlLabel}>Months of On-Time Payments</Text>
                <Stepper
                  value={paymentMonths}
                  onIncrement={() => setPaymentMonths((v) => Math.min(v + 1, 24))}
                  onDecrement={() => setPaymentMonths((v) => Math.max(v - 1, 1))}
                  label={`${paymentMonths} mo`}
                  min={1}
                  max={24}
                />
              </View>

              <View style={styles.simCompare}>
                <View style={styles.simCompareItem}>
                  <Text style={styles.simCompareLabel}>Now</Text>
                  <Text style={styles.simCompareValue}>{baseScore}</Text>
                </View>
                <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
                <View style={styles.simCompareItem}>
                  <Text style={styles.simCompareLabel}>After {paymentMonths}mo</Text>
                  <Text style={[styles.simCompareValue, { color: colors.success }]}>
                    {paymentResult.newScore}
                  </Text>
                </View>
              </View>

              {paymentChartData.length > 0 && (
                <View style={{ marginTop: spacing.md }}>
                  <TrendLineChart
                    data={paymentChartData}
                    color={colors.success}
                    height={130}
                    curved
                    yAxisPrefix=""
                    formatLabel={(v) => Math.round(Number(v)).toString()}
                  />
                </View>
              )}
            </GlassCard>
          </Animated.View>

          {/* Personalized Tips */}
          <Animated.View style={tipsAnim}>
            <Text style={styles.sectionTitle}>Personalized Tips</Text>
            {tips.map((tip, i) => (
              <GlassCard key={i} style={styles.tipCard}>
                <View style={styles.tipRow}>
                  <View style={styles.tipIconWrap}>
                    <Ionicons name="bulb-outline" size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              </GlassCard>
            ))}
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
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
    width: '100%',
  },
  cardLabel: {
    fontSize: 13,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
  },
  scoreRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  scoreRangeText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  scoreRangeLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  factorCard: {
    marginBottom: spacing.sm,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  factorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  factorFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  factorScore: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    flexShrink: 0,
  },
  factorDesc: {
    fontSize: 12,
    color: colors.textTertiary,
    flex: 1,
    lineHeight: 16,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.round,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  simCard: {
    marginBottom: spacing.md,
  },
  simHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  simTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  simDescription: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  simControl: {
    marginBottom: spacing.md,
  },
  simControlLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepBtn: {
    width: 36,
    height: 36,
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
  simCompare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 248, 230, 0.04)',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  simCompareItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  simCompareLabel: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  simCompareValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.round,
  },
  deltaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tipCard: {
    marginBottom: spacing.sm,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  tipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
