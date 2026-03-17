import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '../store/useStore';
import { BADGES } from '../data/badges';
import { SAVINGS_CHALLENGES } from '../data/savingsChallenges';
import { GradientBackground, GlassCard, ProgressBar } from '../components/ui';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { useHaptic } from '../hooks/useHaptic';
import colors from '../theme/colors';
import { spacing, radii, shadows, GLASS_BG, GLASS_BORDER } from '../theme/tokens';

const XP_PER_LEVEL = 500;

/**
 * Achievements screen — XP, level, badges, and challenges overview.
 */
export default function AchievementsScreen({ navigation }) {
  const {
    xp, level, badges: earnedBadgeIds, activeChallenges, completedChallenges,
  } = useStore();
  const { trigger } = useHaptic();

  const headerAnim = useEntranceAnimation(0);
  const badgesAnim = useEntranceAnimation(80);
  const lockedAnim = useEntranceAnimation(160);
  const challengesAnim = useEntranceAnimation(240);

  const xpIntoCurrentLevel = xp % XP_PER_LEVEL;
  const xpProgress = xpIntoCurrentLevel / XP_PER_LEVEL;

  const earnedBadges = BADGES.filter((b) => (earnedBadgeIds || []).includes(b.id));
  const lockedBadges = BADGES.filter((b) => !(earnedBadgeIds || []).includes(b.id));

  const getUnlockHint = (badge) => {
    const { type, count } = badge.requirement;
    switch (type) {
      case 'lessons': return `Complete ${count} lessons`;
      case 'streak': return `Maintain a ${count}-day streak`;
      case 'goals_set': return `Set ${count} financial goals`;
      case 'goals_complete': return `Complete ${count} goals`;
      case 'budgets': return `Set budgets in ${count} categories`;
      case 'posts': return `Make ${count} community posts`;
      case 'health_score': return `Reach a health score of ${count}+`;
      case 'challenges_complete': return `Complete ${count} savings challenge`;
      case 'investments_viewed': return 'View your investment portfolio';
      default: return `Reach ${count}`;
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={headerAnim}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
              <Text style={styles.backText}>Dashboard</Text>
            </Pressable>
            <Text style={styles.screenTitle}>Achievements</Text>
            <Text style={styles.screenSubtitle}>Your financial journey milestones</Text>
          </Animated.View>

          {/* Level & XP Card */}
          <Animated.View style={headerAnim}>
            <GlassCard style={styles.levelCard}>
              <View style={styles.levelRow}>
                <View style={styles.levelBadge}>
                  <Ionicons name="star" size={20} color={colors.background} />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelLabel}>Level {level}</Text>
                  <Text style={styles.xpText}>{xp.toLocaleString()} total XP</Text>
                </View>
                <View style={styles.levelProgress}>
                  <Text style={styles.xpProgressText}>
                    {xpIntoCurrentLevel.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()} XP
                  </Text>
                  <Text style={styles.xpNextText}>to Level {level + 1}</Text>
                </View>
              </View>
              <ProgressBar progress={xpProgress} height={10} style={styles.xpBar} />
            </GlassCard>
          </Animated.View>

          {/* Earned Badges */}
          <Animated.View style={badgesAnim}>
            <Text style={styles.sectionLabel}>
              Earned Badges{' '}
              <Text style={styles.sectionCount}>({earnedBadges.length})</Text>
            </Text>
            {earnedBadges.length === 0 ? (
              <GlassCard>
                <Text style={styles.emptyText}>Complete goals and lessons to earn your first badge!</Text>
              </GlassCard>
            ) : (
              <View style={styles.badgeGrid}>
                {earnedBadges.map((badge) => (
                  <View key={badge.id} style={[styles.badgeItem, { ...shadows.goldGlow }]}>
                    <View style={[styles.badgeCircle, { backgroundColor: badge.color }]}>
                      <Ionicons name={badge.icon} size={24} color="#fff" />
                    </View>
                    <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
                    <Text style={styles.badgeDesc} numberOfLines={2}>{badge.description}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Locked Badges */}
          {lockedBadges.length > 0 && (
            <Animated.View style={lockedAnim}>
              <Text style={styles.sectionLabel}>
                Locked Badges{' '}
                <Text style={styles.sectionCount}>({lockedBadges.length})</Text>
              </Text>
              <View style={styles.badgeGrid}>
                {lockedBadges.map((badge) => (
                  <View key={badge.id} style={[styles.badgeItem, styles.badgeItemLocked]}>
                    <View style={[styles.badgeCircle, styles.badgeCircleLocked]}>
                      <Ionicons name={badge.icon} size={24} color={colors.textTertiary} />
                      <View style={styles.lockOverlay}>
                        <Ionicons name="lock-closed" size={12} color={colors.textTertiary} />
                      </View>
                    </View>
                    <Text style={[styles.badgeName, styles.badgeNameLocked]} numberOfLines={1}>{badge.name}</Text>
                    <Text style={[styles.badgeDesc, styles.badgeDescLocked]} numberOfLines={2}>
                      {getUnlockHint(badge)}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Active Challenges Summary */}
          {activeChallenges.length > 0 && (
            <Animated.View style={challengesAnim}>
              <Text style={styles.sectionLabel}>Active Challenges</Text>
              {activeChallenges.map((ac) => {
                const def = SAVINGS_CHALLENGES.find((c) => c.id === ac.id);
                if (!def) return null;
                const progress = Math.min(1, (ac.progress || 0) / (ac.target || 1));
                return (
                  <GlassCard key={ac.id}>
                    <View style={styles.challengeRow}>
                      <View style={[styles.challengeIcon, { backgroundColor: `${def.color}22` }]}>
                        <Ionicons name={def.icon} size={18} color={def.color} />
                      </View>
                      <View style={styles.challengeInfo}>
                        <Text style={styles.challengeName}>{def.name}</Text>
                        <Text style={styles.challengeProgress}>
                          {Math.round(progress * 100)}% complete
                        </Text>
                        <ProgressBar progress={progress} height={6} style={styles.challengeBar} />
                      </View>
                    </View>
                  </GlassCard>
                );
              })}
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

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.lg },
  backText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  screenTitle: { fontSize: 32, fontWeight: '700', color: colors.text, letterSpacing: 0.3, marginBottom: 4 },
  screenSubtitle: { fontSize: 14, color: colors.textTertiary, marginBottom: spacing.xl },

  levelCard: { marginBottom: spacing.xl },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  levelInfo: { flex: 1 },
  levelLabel: { fontSize: 20, fontWeight: '700', color: colors.text },
  xpText: { fontSize: 13, color: colors.textTertiary, marginTop: 2 },
  levelProgress: { alignItems: 'flex-end' },
  xpProgressText: { fontSize: 13, fontWeight: '600', color: colors.primaryLight },
  xpNextText: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  xpBar: { marginTop: spacing.xs },

  sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  sectionCount: { color: colors.textTertiary, fontWeight: '400' },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  badgeItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: GLASS_BG,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: spacing.sm,
    paddingVertical: spacing.md,
  },
  badgeItemLocked: { opacity: 0.45 },
  badgeCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  badgeCircleLocked: { backgroundColor: colors.surface },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  badgeName: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: 2 },
  badgeNameLocked: { color: colors.textTertiary },
  badgeDesc: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  badgeDescLocked: { color: colors.textTertiary },

  challengeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  challengeIcon: { width: 36, height: 36, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  challengeInfo: { flex: 1 },
  challengeName: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 },
  challengeProgress: { fontSize: 12, color: colors.textTertiary, marginBottom: 6 },
  challengeBar: {},
});
