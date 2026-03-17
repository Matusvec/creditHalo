import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, ProgressBar } from '../ui';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

const FEASIBILITY_COLORS = {
  'Very Achievable': colors.success,
  'Achievable': '#4FC3F7',
  'Challenging': colors.primary,
  'Long-term': colors.textTertiary,
};

const CATEGORY_ICONS = {
  emergency: 'shield',
  home: 'home',
  travel: 'airplane',
  debt: 'trending-down',
  education: 'school',
  retirement: 'time',
  investment: 'trending-up',
  car: 'car',
  default: 'flag',
};

/**
 * Expanded goal card with progress bar, AI feasibility badge, and action row.
 * @param {{ goal: object, onComplete: (id: string) => void, onPress?: () => void, delay?: number }} props
 */
const SmartGoalCard = ({ goal, onComplete, onPress }) => {
  const hasTarget = goal.targetAmount != null && goal.targetAmount > 0;
  const current = goal.currentAmount || 0;
  const progressRatio = hasTarget ? Math.min(1, current / goal.targetAmount) : 0;
  const progressPct = Math.round(progressRatio * 100);
  const feasibility = goal.aiAnalysis?.feasibility;
  const feasibilityColor = feasibility ? FEASIBILITY_COLORS[feasibility] : null;
  const iconName = CATEGORY_ICONS[goal.category] || CATEGORY_ICONS.default;

  return (
    <GlassCard style={styles.card}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.pressable, pressed && { opacity: 0.85 }]}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <Ionicons name={iconName} size={18} color={colors.primary} />
          </View>
          <Text style={styles.goalText} numberOfLines={2}>{goal.text}</Text>
          {feasibility && (
            <View style={[styles.badge, { borderColor: feasibilityColor, backgroundColor: `${feasibilityColor}18` }]}>
              <Text style={[styles.badgeText, { color: feasibilityColor }]} numberOfLines={1}>{feasibility}</Text>
            </View>
          )}
        </View>

        {/* Target amount + progress */}
        {hasTarget && (
          <View style={styles.progressSection}>
            <View style={styles.amountRow}>
              <Text style={styles.currentAmount}>${current.toLocaleString()}</Text>
              <Text style={styles.separator}> / </Text>
              <Text style={styles.targetAmount}>${goal.targetAmount.toLocaleString()}</Text>
              <Text style={styles.progressPct}> · {progressPct}%</Text>
            </View>
            <ProgressBar progress={progressRatio} height={8} style={styles.bar} />
          </View>
        )}

        {/* Deadline */}
        {goal.deadline && (
          <View style={styles.deadlineRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.deadlineText}>
              {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        )}

        {/* AI reasoning snippet */}
        {goal.aiAnalysis?.timeframe && (
          <Text style={styles.timeframe}>Estimated: {goal.aiAnalysis.timeframe}</Text>
        )}
      </Pressable>

      {/* Action row */}
      <View style={styles.actionRow}>
        {onPress && (
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.detailBtn, pressed && { opacity: 0.7 }]}
            onPress={onPress}
          >
            <Text style={styles.detailBtnText}>View Details</Text>
            <Ionicons name="chevron-forward" size={13} color={colors.primary} />
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.completeBtn, pressed && { opacity: 0.7 }]}
          onPress={() => onComplete(goal.id)}
        >
          <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
          <Text style={styles.completeBtnText}>Complete</Text>
        </Pressable>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  pressable: { paddingBottom: spacing.sm },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  goalText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    flexShrink: 0,
    maxWidth: 110,
  },
  badgeText: { fontSize: 10, fontWeight: '600' },
  progressSection: { marginBottom: spacing.sm },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  currentAmount: { fontSize: 16, fontWeight: '700', color: colors.text },
  separator: { fontSize: 14, color: colors.textTertiary },
  targetAmount: { fontSize: 14, color: colors.textSecondary },
  progressPct: { fontSize: 12, color: colors.textTertiary },
  bar: { marginTop: 2 },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  deadlineText: { fontSize: 12, color: colors.textTertiary },
  timeframe: { fontSize: 12, color: colors.primaryMuted, fontStyle: 'italic' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: GLASS_BORDER,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  detailBtn: { backgroundColor: `${colors.primary}15` },
  detailBtnText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  completeBtn: { backgroundColor: `${colors.success}15` },
  completeBtnText: { fontSize: 12, fontWeight: '600', color: colors.success },
});

export default SmartGoalCard;
