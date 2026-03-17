import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { subMonths } from 'date-fns';

import { useStore } from '../store/useStore';
import { GradientBackground, GlassCard, ProgressBar } from '../components/ui';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { useHaptic } from '../hooks/useHaptic';
import ScoreRing from '../components/charts/ScoreRing';
import TrendLineChart from '../components/charts/TrendLineChart';
import colors from '../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../theme/tokens';

const BREAKDOWN_META = [
  { key: 'spendingHabits', label: 'Spending Habits', icon: 'cart', max: 20, description: 'Month-over-month spending stability' },
  { key: 'savingsRate', label: 'Savings Rate', icon: 'save', max: 20, description: 'Income vs. savings ratio' },
  { key: 'debtRatio', label: 'Debt Ratio', icon: 'trending-down', max: 20, description: 'Debt-to-income ratio' },
  { key: 'goalCompletion', label: 'Goal Completion', icon: 'flag', max: 15, description: 'Completed goals percentage' },
  { key: 'educationProgress', label: 'Education Progress', icon: 'school', max: 15, description: 'Completed financial lessons' },
  { key: 'budgetAdherence', label: 'Budget Adherence', icon: 'wallet', max: 10, description: 'Active budget categories' },
];

function getScoreColor(score, max) {
  const pct = (score / max) * 100;
  if (pct >= 70) return colors.success;
  if (pct >= 40) return colors.primary;
  return colors.error;
}

function getImprovementTips(breakdown) {
  const tips = [];
  const sorted = BREAKDOWN_META
    .map((m) => ({ ...m, score: breakdown[m.key] || 0, pct: ((breakdown[m.key] || 0) / m.max) * 100 }))
    .sort((a, b) => a.pct - b.pct);

  const weakest = sorted.slice(0, 3);

  for (const item of weakest) {
    if (item.key === 'savingsRate' && item.pct < 70) {
      tips.push('Your savings rate is below average. Try the 52-Week Challenge to boost it over time.');
    } else if (item.key === 'budgetAdherence' && item.pct < 70) {
      tips.push('Set budgets for 5+ categories to improve your Budget Adherence score.');
    } else if (item.key === 'goalCompletion' && item.pct < 70) {
      tips.push('Complete more financial goals — even small wins improve your score significantly.');
    } else if (item.key === 'educationProgress' && item.pct < 70) {
      tips.push('Finishing more lessons in the Learn tab will boost your Education Progress score.');
    } else if (item.key === 'debtRatio' && item.pct < 70) {
      tips.push('Reducing high-interest debt improves your Debt Ratio score. Focus on the highest APR first.');
    } else if (item.key === 'spendingHabits' && item.pct < 70) {
      tips.push('More consistent spending patterns will strengthen your Spending Habits score.');
    }
  }

  return tips;
}

/**
 * Financial health score breakdown screen with history chart and improvement tips.
 */
export default function HealthScoreScreen({ navigation }) {
  const { healthScore, healthBreakdown, healthHistory, calculateHealthScore, setHealthHistory } = useStore();
  const { trigger } = useHaptic();

  const headerAnim = useEntranceAnimation(0);
  const historyAnim = useEntranceAnimation(80);
  const breakdownAnim = useEntranceAnimation(160);
  const tipsAnim = useEntranceAnimation(240);

  useEffect(() => {
    calculateHealthScore();
    if (!healthHistory || healthHistory.length === 0) {
      const score = healthScore || 46;
      const history = Array.from({ length: 6 }, (_, i) => ({
        date: subMonths(new Date(), 5 - i).toISOString(),
        score: Math.max(20, score - (5 - i) * 5 + Math.floor(Math.sin(i * 1.3) * 8)),
      }));
      setHealthHistory(history);
    }
  }, []);

  const historyChartData = (healthHistory || []).map((h) => ({
    value: h.score,
    label: new Date(h.date).toLocaleDateString('en-US', { month: 'short' }),
  }));

  const breakdown = healthBreakdown || {};
  const tips = getImprovementTips(breakdown);

  const scoreLabel = healthScore >= 70 ? 'Excellent' : healthScore >= 50 ? 'Good' : healthScore >= 30 ? 'Fair' : 'Needs Work';
  const scoreColor = healthScore >= 70 ? colors.success : healthScore >= 50 ? colors.primary : colors.error;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerAnim]}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
              <Text style={styles.backText}>Dashboard</Text>
            </Pressable>
            <Text style={styles.screenTitle}>Financial Health</Text>
            <Text style={styles.screenSubtitle}>Your composite wellness score</Text>
          </Animated.View>

          {/* Score Ring */}
          <Animated.View style={[styles.scoreCard, headerAnim]}>
            <GlassCard>
              <View style={styles.ringCenter}>
                <ScoreRing
                  score={healthScore}
                  maxScore={100}
                  size={180}
                  strokeWidth={14}
                  label="Financial Health"
                />
                <View style={styles.scoreLabelWrap}>
                  <View style={[styles.scoreLabelBadge, { backgroundColor: `${scoreColor}20`, borderColor: scoreColor }]}>
                    <Text style={[styles.scoreLabelText, { color: scoreColor }]}>{scoreLabel}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.scoreHint}>Score is out of 100 — updated based on your financial activity.</Text>
            </GlassCard>
          </Animated.View>

          {/* Score History */}
          {historyChartData.length > 0 && (
            <Animated.View style={historyAnim}>
              <Text style={styles.sectionLabel}>Score History (6 months)</Text>
              <TrendLineChart
                data={historyChartData}
                height={160}
                color={scoreColor}
                showArea
              />
              <View style={{ marginBottom: spacing.md }} />
            </Animated.View>
          )}

          {/* Breakdown Cards */}
          <Animated.View style={breakdownAnim}>
            <Text style={styles.sectionLabel}>Score Breakdown</Text>
            {BREAKDOWN_META.map((meta) => {
              const score = breakdown[meta.key] || 0;
              const scoreColor = getScoreColor(score, meta.max);
              const progressRatio = meta.max > 0 ? score / meta.max : 0;

              return (
                <GlassCard key={meta.key} style={styles.breakdownCard}>
                  <View style={styles.breakdownRow}>
                    <View style={[styles.breakdownIcon, { backgroundColor: `${scoreColor}18` }]}>
                      <Ionicons name={meta.icon} size={18} color={scoreColor} />
                    </View>
                    <View style={styles.breakdownInfo}>
                      <View style={styles.breakdownLabelRow}>
                        <Text style={styles.breakdownLabel}>{meta.label}</Text>
                        <Text style={[styles.breakdownScore, { color: scoreColor }]}>
                          {score} / {meta.max}
                        </Text>
                      </View>
                      <Text style={styles.breakdownDesc}>{meta.description}</Text>
                      <ProgressBar progress={progressRatio} height={6} style={styles.breakdownBar} />
                    </View>
                  </View>
                </GlassCard>
              );
            })}
          </Animated.View>

          {/* Improvement Tips */}
          {tips.length > 0 && (
            <Animated.View style={tipsAnim}>
              <GlassCard>
                <View style={styles.tipsHeader}>
                  <Ionicons name="bulb-outline" size={18} color={colors.primaryLight} />
                  <Text style={styles.sectionLabel}>How to Improve</Text>
                </View>
                {tips.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <View style={styles.tipBullet} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </GlassCard>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },

  header: { marginBottom: spacing.xl },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.lg },
  backText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  screenTitle: { fontSize: 32, fontWeight: '700', color: colors.text, letterSpacing: 0.3, marginBottom: 4 },
  screenSubtitle: { fontSize: 14, color: colors.textTertiary },

  scoreCard: { marginBottom: spacing.xl },
  ringCenter: { alignItems: 'center', paddingVertical: spacing.md },
  scoreLabelWrap: { marginTop: spacing.md, alignItems: 'center' },
  scoreLabelBadge: { borderWidth: 1, borderRadius: radii.round, paddingHorizontal: 16, paddingVertical: 5 },
  scoreLabelText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  scoreHint: { fontSize: 12, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm },

  sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },

  breakdownCard: { marginBottom: spacing.sm },
  breakdownRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  breakdownIcon: { width: 38, height: 38, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  breakdownInfo: { flex: 1 },
  breakdownLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  breakdownLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  breakdownScore: { fontSize: 13, fontWeight: '700' },
  breakdownDesc: { fontSize: 12, color: colors.textTertiary, marginBottom: 8 },
  breakdownBar: {},

  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: 10 },
  tipBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primaryLight, marginTop: 7, flexShrink: 0 },
  tipText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
});
