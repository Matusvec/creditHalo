import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '../../store/useStore';
import { SAVINGS_CHALLENGES, get52WeekCumulativeTarget } from '../../data/savingsChallenges';
import { GradientBackground, GlassCard, AnimatedButton } from '../../components/ui';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { useHaptic } from '../../hooks/useHaptic';
import ChallengeCard from '../../components/goals/ChallengeCard';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

/**
 * Browse and manage savings challenges.
 */
export default function SavingsChallengesScreen({ navigation }) {
  const {
    activeChallenges, completedChallenges, startChallenge, addXP, persist,
  } = useStore();
  const { trigger } = useHaptic();

  const headerAnim = useEntranceAnimation(0);
  const activeAnim = useEntranceAnimation(80);
  const availableAnim = useEntranceAnimation(160);
  const completedAnim = useEntranceAnimation(240);

  const activeChallengeIds = new Set((activeChallenges || []).map((c) => c.id));
  const completedChallengeIds = new Set((completedChallenges || []).map((c) => c.id));

  const availableChallenges = SAVINGS_CHALLENGES.filter(
    (c) => !activeChallengeIds.has(c.id) && !completedChallengeIds.has(c.id),
  );

  const handleStartChallenge = (challenge) => {
    trigger('success');
    startChallenge(challenge);
    addXP(20, 'challenge_started');
    persist();
  };

  const getActiveChallengeProgressLabel = (ac) => {
    const def = SAVINGS_CHALLENGES.find((c) => c.id === ac.id);
    if (!def) return '';
    if (def.type === 'progressive') {
      const week = ac.progress || 0;
      const saved = get52WeekCumulativeTarget(week);
      return `Week ${week} of ${def.duration} — $${saved} saved so far`;
    }
    if (def.type === 'tracking') {
      return `${ac.progress || 0} / ${def.duration} weekends completed`;
    }
    const pct = Math.round(((ac.progress || 0) / (ac.target || 1)) * 100);
    return `${pct}% complete`;
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
              <Text style={styles.backText}>Goals</Text>
            </Pressable>
            <Text style={styles.screenTitle}>Savings Challenges</Text>
            <Text style={styles.screenSubtitle}>Build better money habits one challenge at a time</Text>
          </Animated.View>

          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <Animated.View style={activeAnim}>
              <Text style={styles.sectionLabel}>Active Challenges</Text>
              {activeChallenges.map((ac) => {
                const def = SAVINGS_CHALLENGES.find((c) => c.id === ac.id);
                if (!def) return null;
                return (
                  <GlassCard key={ac.id} style={styles.activeChallengeCard}>
                    <View style={styles.activeChallengeHeader}>
                      <View style={[styles.acIconWrap, { backgroundColor: `${def.color}22` }]}>
                        <Ionicons name={def.icon} size={20} color={def.color} />
                      </View>
                      <View style={styles.acInfo}>
                        <Text style={styles.acName}>{def.name}</Text>
                        <Text style={styles.acProgress}>{getActiveChallengeProgressLabel(ac)}</Text>
                      </View>
                      <View style={[styles.acBadge, { backgroundColor: `${def.color}22` }]}>
                        <View style={[styles.acDot, { backgroundColor: def.color }]} />
                        <Text style={[styles.acBadgeText, { color: def.color }]}>Active</Text>
                      </View>
                    </View>
                    {def.totalSavings && (
                      <Text style={styles.acTarget}>Target: ${def.totalSavings.toLocaleString()} total savings</Text>
                    )}
                  </GlassCard>
                );
              })}
            </Animated.View>
          )}

          {/* Available Challenges */}
          {availableChallenges.length > 0 && (
            <Animated.View style={availableAnim}>
              <Text style={styles.sectionLabel}>Available Challenges</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.challengeScroll}
              >
                {availableChallenges.map((c) => (
                  <ChallengeCard
                    key={c.id}
                    challenge={c}
                    onStart={() => handleStartChallenge(c)}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* All challenges grid (full view below horizontal scroll) */}
          <Animated.View style={availableAnim}>
            <Text style={styles.sectionLabel}>All Challenges</Text>
            {SAVINGS_CHALLENGES.map((c) => {
              const ac = activeChallenges.find((a) => a.id === c.id);
              const isCompleted = completedChallengeIds.has(c.id);
              const isActive = activeChallengeIds.has(c.id);

              return (
                <GlassCard key={c.id} style={styles.challengeListCard}>
                  <View style={styles.listCardRow}>
                    <View style={[styles.listIconWrap, { backgroundColor: `${c.color}22` }]}>
                      <Ionicons name={c.icon} size={22} color={c.color} />
                    </View>
                    <View style={styles.listInfo}>
                      <View style={styles.listTitleRow}>
                        <Text style={styles.listName}>{c.name}</Text>
                        {isCompleted && (
                          <View style={styles.completedBadge}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                            <Text style={styles.completedBadgeText}>Done</Text>
                          </View>
                        )}
                        {isActive && (
                          <View style={[styles.activePillBadge, { backgroundColor: `${c.color}22` }]}>
                            <Text style={[styles.activePillText, { color: c.color }]}>Active</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.listDesc} numberOfLines={2}>{c.description}</Text>
                      <View style={styles.listMeta}>
                        <Text style={styles.listMetaText}>
                          {c.duration} {c.type === 'tracking' ? 'weekends' : c.duration === 52 ? 'weeks' : 'days'}
                        </Text>
                        {c.totalSavings && (
                          <>
                            <Text style={styles.listMetaDot}> · </Text>
                            <Text style={[styles.listMetaText, { color: colors.success }]}>${c.totalSavings.toLocaleString()} goal</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                  {!isActive && !isCompleted && (
                    <AnimatedButton
                      title="Start Challenge"
                      onPress={() => handleStartChallenge(c)}
                      variant="secondary"
                      style={styles.startBtn}
                    />
                  )}
                </GlassCard>
              );
            })}
          </Animated.View>

          {/* Completed Challenges History */}
          {completedChallenges.length > 0 && (
            <Animated.View style={completedAnim}>
              <Text style={styles.sectionLabel}>Completed Challenges</Text>
              {completedChallenges.map((cc, i) => {
                const def = SAVINGS_CHALLENGES.find((c) => c.id === cc.id);
                if (!def) return null;
                return (
                  <GlassCard key={`${cc.id}-${i}`}>
                    <View style={styles.completedRow}>
                      <Ionicons name="trophy" size={20} color={colors.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.ccName}>{def.name}</Text>
                        {cc.completedDate && (
                          <Text style={styles.ccDate}>
                            Completed {new Date(cc.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Text>
                        )}
                        {def.totalSavings && (
                          <Text style={styles.ccSavings}>Saved ${def.totalSavings.toLocaleString()}</Text>
                        )}
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

  sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },

  activeChallengeCard: { marginBottom: spacing.sm },
  activeChallengeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 6 },
  acIconWrap: { width: 36, height: 36, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  acInfo: { flex: 1 },
  acName: { fontSize: 14, fontWeight: '600', color: colors.text },
  acProgress: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  acBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.round },
  acDot: { width: 5, height: 5, borderRadius: 3 },
  acBadgeText: { fontSize: 10, fontWeight: '600' },
  acTarget: { fontSize: 12, color: colors.textTertiary },

  challengeScroll: { paddingBottom: spacing.sm, paddingRight: spacing.lg },

  challengeListCard: { marginBottom: spacing.sm },
  listCardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  listIconWrap: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  listInfo: { flex: 1 },
  listTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4, flexWrap: 'wrap' },
  listName: { fontSize: 15, fontWeight: '700', color: colors.text },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  completedBadgeText: { fontSize: 11, color: colors.success, fontWeight: '600' },
  activePillBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.round },
  activePillText: { fontSize: 10, fontWeight: '600' },
  listDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  listMeta: { flexDirection: 'row', alignItems: 'center' },
  listMetaText: { fontSize: 12, color: colors.textTertiary },
  listMetaDot: { fontSize: 12, color: colors.textTertiary },
  startBtn: { marginTop: spacing.xs },

  completedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ccName: { fontSize: 14, fontWeight: '600', color: colors.text },
  ccDate: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  ccSavings: { fontSize: 13, color: colors.success, fontWeight: '600', marginTop: 2 },
});
