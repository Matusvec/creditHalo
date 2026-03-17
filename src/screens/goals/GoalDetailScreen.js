import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable, TextInput, Alert,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '../../store/useStore';
import { getIncomeVsExpenses } from '../../services/mockTransactions';
import { analyzeGoalFeasibility, generateGoalMilestones } from '../../services/goalAnalysis';
import { GradientBackground, GlassCard, AnimatedButton, GlassModal, ProgressBar } from '../../components/ui';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { useHaptic } from '../../hooks/useHaptic';
import ScoreRing from '../../components/charts/ScoreRing';
import TrendLineChart from '../../components/charts/TrendLineChart';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

const FEASIBILITY_COLORS = {
  'Very Achievable': colors.success,
  'Achievable': '#4FC3F7',
  'Challenging': colors.primary,
  'Long-term': colors.textTertiary,
};

/**
 * Deep-dive screen for a single goal with AI coaching and milestone tracking.
 */
export default function GoalDetailScreen({ route, navigation }) {
  const { goalId } = route.params;
  const { goals, transactions, setGoalAIAnalysis, addGoalMilestone, markMilestoneReached, persist } = useStore();
  const { trigger } = useHaptic();

  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDeadline, setAdjustDeadline] = useState('');

  const goal = (goals || []).find((g) => g.id === goalId);

  const headerAnim = useEntranceAnimation(0);
  const analysisAnim = useEntranceAnimation(80);
  const stepsAnim = useEntranceAnimation(160);
  const milestonesAnim = useEntranceAnimation(240);
  const tipsAnim = useEntranceAnimation(300);

  // Generate AI analysis on mount if not present
  useEffect(() => {
    if (!goal) return;
    if (goal.aiAnalysis) return;

    try {
      let monthlyIncome = 4900;
      let monthlyExpenses = 3800;
      let savingsRate = 22;
      let totalDebt = 21029;

      if (transactions.length > 0) {
        const summary = getIncomeVsExpenses(transactions, 1);
        if (summary.length > 0) {
          monthlyIncome = summary[0].income || 4900;
          monthlyExpenses = summary[0].expenses || 3800;
          savingsRate = summary[0].savingsRate || 22;
        }
      }

      const financialData = {
        monthlyIncome,
        monthlyExpenses,
        savingsRate,
        totalDebt,
        monthlyDebtPayments: 700,
      };

      const analysis = analyzeGoalFeasibility(goal, financialData);
      setGoalAIAnalysis(goalId, analysis);
      persist();
    } catch (e) {
      console.warn('Goal analysis error:', e);
    }
  }, [goalId]);

  // Auto-generate milestones if goal has a target and no milestones
  useEffect(() => {
    if (!goal) return;
    if (!goal.targetAmount) return;
    if (goal.milestones && goal.milestones.length > 0) return;

    const milestones = generateGoalMilestones(goal);
    milestones.forEach((m) => addGoalMilestone(goalId, m));
    persist();
  }, [goalId]);

  if (!goal) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Goal not found.</Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const analysis = goal.aiAnalysis;
  const feasibilityColor = analysis ? (FEASIBILITY_COLORS[analysis.feasibility] || colors.primary) : colors.primary;
  const hasTarget = goal.targetAmount != null && goal.targetAmount > 0;
  const progressRatio = hasTarget ? Math.min(1, (goal.currentAmount || 0) / goal.targetAmount) : 0;

  // Build mock progress chart data (last 6 months)
  const progressChartData = hasTarget
    ? Array.from({ length: 6 }, (_, i) => ({
        value: Math.round(goal.targetAmount * progressRatio * (i + 1) / 6),
        label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
      }))
    : [];

  const handleAskAI = () => {
    trigger('medium');
    navigation.navigate('Chatbot', { context: `Help me with my goal: "${goal.text}"` });
  };

  const tips = analysis?.tips || [];
  const steps = analysis?.steps || [];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back button + header */}
          <Animated.View style={[styles.header, headerAnim]}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
              <Text style={styles.backText}>Goals</Text>
            </Pressable>

            <View style={styles.goalHeaderCard}>
              {hasTarget && (
                <View style={styles.ringRow}>
                  <ScoreRing
                    score={Math.round(progressRatio * 100)}
                    maxScore={100}
                    size={100}
                    label="Progress"
                    color={feasibilityColor}
                  />
                  <View style={styles.goalMeta}>
                    <Text style={styles.goalTitle}>{goal.text}</Text>
                    <Text style={styles.amountText}>
                      ${(goal.currentAmount || 0).toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                    </Text>
                    {goal.deadline && (
                      <Text style={styles.deadlineText}>
                        Due: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    )}
                  </View>
                </View>
              )}
              {!hasTarget && (
                <View>
                  <Text style={styles.goalTitle}>{goal.text}</Text>
                  <Text style={styles.goalSubtitle}>Track your progress toward this goal</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* AI Analysis Card */}
          <Animated.View style={analysisAnim}>
            <GlassCard>
              <View style={styles.cardHeader}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
                <Text style={styles.cardTitle}>AI Analysis</Text>
                {analysis && (
                  <View style={[styles.feasibilityBadge, { backgroundColor: `${feasibilityColor}18`, borderColor: feasibilityColor }]}>
                    <Text style={[styles.feasibilityText, { color: feasibilityColor }]}>{analysis.feasibility}</Text>
                  </View>
                )}
              </View>
              {analysis ? (
                <>
                  <Text style={styles.analysisReasoning}>{analysis.reasoning}</Text>
                  {analysis.timeframe && (
                    <View style={styles.timeframeRow}>
                      <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                      <Text style={styles.timeframeText}>Estimated: {analysis.timeframe}</Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.analysisReasoning}>Analyzing your goal feasibility based on your financial profile...</Text>
              )}
            </GlassCard>
          </Animated.View>

          {/* Action Steps */}
          {steps.length > 0 && (
            <Animated.View style={stepsAnim}>
              <GlassCard>
                <Text style={styles.cardTitle}>Action Steps</Text>
                {steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={[styles.stepNumber, { backgroundColor: `${colors.primary}22` }]}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </GlassCard>
            </Animated.View>
          )}

          {/* Progress Chart */}
          {hasTarget && progressChartData.length > 0 && (
            <Animated.View style={stepsAnim}>
              <Text style={styles.sectionLabel}>Progress Over Time</Text>
              <TrendLineChart
                data={progressChartData}
                height={160}
                color={feasibilityColor}
                showArea
                yAxisPrefix="$"
              />
              <View style={{ marginBottom: spacing.md }} />
            </Animated.View>
          )}

          {/* Milestone Tracker */}
          {(goal.milestones || []).length > 0 && (
            <Animated.View style={milestonesAnim}>
              <GlassCard>
                <Text style={styles.cardTitle}>Milestones</Text>
                {goal.milestones.map((m, i) => (
                  <View key={i} style={styles.milestoneRow}>
                    <View style={[styles.milestoneIcon, m.reached && styles.milestoneIconReached]}>
                      <Ionicons
                        name={m.reached ? 'checkmark' : 'ellipse'}
                        size={14}
                        color={m.reached ? colors.success : colors.primary}
                      />
                    </View>
                    {i < goal.milestones.length - 1 && (
                      <View style={[styles.milestoneLine, m.reached && styles.milestoneLineReached]} />
                    )}
                    <Text style={[styles.milestoneLabel, m.reached && styles.milestoneLabelReached]}>
                      {m.label}
                    </Text>
                  </View>
                ))}
              </GlassCard>
            </Animated.View>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <Animated.View style={tipsAnim}>
              <GlassCard>
                <View style={styles.cardHeader}>
                  <Ionicons name="bulb-outline" size={16} color={colors.primaryLight} />
                  <Text style={styles.cardTitle}>Tips to Succeed</Text>
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

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            <AnimatedButton title="Ask AI for Advice" onPress={handleAskAI} variant="primary" />
            <AnimatedButton
              title="Adjust Goal"
              onPress={() => { trigger('light'); setAdjustModalVisible(true); }}
              variant="secondary"
              style={styles.adjustBtn}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Adjust Goal Modal */}
      <GlassModal visible={adjustModalVisible} onClose={() => setAdjustModalVisible(false)}>
        <Text style={styles.modalTitle}>Adjust Goal</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="New target amount (optional)"
          placeholderTextColor={colors.textTertiary}
          value={adjustAmount}
          onChangeText={setAdjustAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.modalInput}
          placeholder="New deadline (YYYY-MM-DD)"
          placeholderTextColor={colors.textTertiary}
          value={adjustDeadline}
          onChangeText={setAdjustDeadline}
        />
        <View style={styles.modalActions}>
          <AnimatedButton title="Save" onPress={() => { trigger('success'); setAdjustModalVisible(false); }} variant="primary" style={{ flex: 1 }} />
          <AnimatedButton title="Cancel" onPress={() => setAdjustModalVisible(false)} variant="secondary" style={{ flex: 1 }} />
        </View>
      </GlassModal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  errorText: { fontSize: 16, color: colors.error, textAlign: 'center', marginTop: 40 },

  header: { marginBottom: spacing.lg },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.lg },
  backText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  goalHeaderCard: {
    backgroundColor: GLASS_BG,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: spacing.lg,
  },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  goalMeta: { flex: 1 },
  goalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, lineHeight: 26, marginBottom: 6 },
  goalSubtitle: { fontSize: 13, color: colors.textTertiary },
  amountText: { fontSize: 15, color: colors.textSecondary, marginBottom: 4 },
  deadlineText: { fontSize: 13, color: colors.textTertiary },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1 },
  feasibilityBadge: { borderWidth: 1, borderRadius: radii.round, paddingHorizontal: 10, paddingVertical: 3 },
  feasibilityText: { fontSize: 11, fontWeight: '600' },
  analysisReasoning: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  timeframeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  timeframeText: { fontSize: 13, color: colors.textTertiary },

  sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: 10 },
  stepNumber: { width: 24, height: 24, borderRadius: radii.round, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumberText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  stepText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },

  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: 8, position: 'relative' },
  milestoneIcon: { width: 28, height: 28, borderRadius: radii.round, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.primary}15`, flexShrink: 0 },
  milestoneIconReached: { borderColor: colors.success, backgroundColor: `${colors.success}22` },
  milestoneLine: { position: 'absolute', left: 13, top: 28, width: 2, height: 12, backgroundColor: GLASS_BORDER },
  milestoneLineReached: { backgroundColor: colors.success },
  milestoneLabel: { flex: 1, fontSize: 14, color: colors.textSecondary },
  milestoneLabelReached: { color: colors.text, fontWeight: '500' },

  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: 10 },
  tipBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primaryLight, marginTop: 7, flexShrink: 0 },
  tipText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },

  ctaSection: { marginTop: spacing.sm, gap: spacing.sm },
  adjustBtn: { marginTop: 0 },

  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  modalInput: { backgroundColor: 'rgba(255,248,230,0.06)', borderWidth: 1, borderColor: GLASS_BORDER, borderRadius: radii.md, padding: spacing.md, fontSize: 15, color: colors.text, marginBottom: 10 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: spacing.sm },
});
