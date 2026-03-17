import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, Alert, Platform, StyleSheet,
  TouchableOpacity, SafeAreaView, Pressable,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

let ConfettiCannon;
try { ConfettiCannon = require('react-native-confetti-cannon').default; } catch { ConfettiCannon = null; }

import { useStore } from '../store/useStore';
import { GOAL_EXAMPLES } from '../data/mockGoals';
import { GradientBackground, AnimatedButton, GlassCard, GlassModal } from '../components/ui';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { useHaptic } from '../hooks/useHaptic';
import SmartGoalCard from '../components/goals/SmartGoalCard';
import ChallengeCard from '../components/goals/ChallengeCard';
import colors from '../theme/colors';
import { radii, shadows, spacing, GLASS_BG, GLASS_BORDER } from '../theme/tokens';
import { SAVINGS_CHALLENGES } from '../data/savingsChallenges';

const FAB = ({ onPress }) => {
  const translateY = useSharedValue(0);
  const { trigger } = useHaptic();
  useEffect(() => {
    translateY.value = withRepeat(withSequence(withTiming(-5, { duration: 1800 }), withTiming(5, { duration: 1800 })), -1, true);
  }, []);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const Wrapper = Platform.OS === 'ios' ? BlurView : View;
  const wrapperProps = Platform.OS === 'ios'
    ? { intensity: 40, tint: 'dark', style: styles.fabBlur }
    : { style: [styles.fabBlur, styles.fabAndroid] };
  return (
    <Animated.View style={[styles.fabContainer, floatStyle]}>
      <TouchableOpacity onPress={() => { trigger('medium'); onPress(); }} activeOpacity={0.85}>
        <Wrapper {...wrapperProps}>
          <Ionicons name="chatbubble-ellipses" size={22} color={colors.primary} />
          <Text style={styles.fabLabel}>Ask AI</Text>
        </Wrapper>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Goals screen with AI-powered goal coaching, challenges, and progress tracking.
 */
export default function GoalsScreen({ navigation }) {
  const {
    goals, addGoal, completeGoal, completedGoalCount,
    addXP, persist, activeChallenges,
  } = useStore();

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const confettiRef = useRef(null);
  const { trigger } = useHaptic();

  const headerEntrance = useEntranceAnimation(0);
  const ctaEntrance = useEntranceAnimation(80);
  const goalsEntrance = useEntranceAnimation(140);
  const challengesEntrance = useEntranceAnimation(200);
  const completedEntrance = useEntranceAnimation(260);

  const handleAddGoal = () => {
    const text = newGoalText.trim();
    if (!text || text.length > 100) return;
    const targetAmount = newGoalAmount ? parseFloat(newGoalAmount) : undefined;
    const deadline = newGoalDeadline.trim() || undefined;
    addGoal(text, { targetAmount, deadline });
    addXP(20, 'goal_set');
    persist();
    setNewGoalText('');
    setNewGoalAmount('');
    setNewGoalDeadline('');
    setGoalModalVisible(false);
    trigger('success');
  };

  const handleCompleteGoal = (id) => {
    try { confettiRef.current?.start?.(); } catch { Alert.alert('Goal completed!', 'Great job on your progress!'); }
    trigger('success');
    setTimeout(() => {
      completeGoal(id);
      addXP(100, 'goal_complete');
      persist();
    }, 1500);
  };

  const visibleGoals = (goals || []).filter((g) => g && g.text != null);

  // Map active challenge IDs to their data for display
  const activeChallengeDetails = (activeChallenges || []).map((ac) => {
    const def = SAVINGS_CHALLENGES.find((c) => c.id === ac.id);
    return def ? { challenge: def, activeData: ac } : null;
  }).filter(Boolean).slice(0, 3);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={headerEntrance}>
            <Text style={styles.screenTitle}>Your Goals</Text>
            <Text style={styles.screenSubtitle}>AI-powered goal coaching</Text>
          </Animated.View>

          {/* CTAs */}
          <Animated.View style={[styles.ctaRow, ctaEntrance]}>
            <View style={{ flex: 1 }}>
              <AnimatedButton title="+ Set a New Goal" onPress={() => setGoalModalVisible(true)} variant="primary" />
            </View>
            <View style={{ flex: 1 }}>
              <AnimatedButton
                title="Challenges"
                onPress={() => { trigger('light'); navigation.navigate('SavingsChallenges'); }}
                variant="secondary"
              />
            </View>
          </Animated.View>

          {/* Active Goals */}
          <Animated.View style={goalsEntrance}>
            <Text style={styles.sectionLabel}>Active Goals</Text>
            {visibleGoals.length === 0 ? (
              <GlassCard>
                <Text style={styles.emptyText}>No goals yet. Set your first goal above and start your journey!</Text>
              </GlassCard>
            ) : (
              visibleGoals.map((goal) => (
                <SmartGoalCard
                  key={goal.id}
                  goal={goal}
                  onComplete={handleCompleteGoal}
                  onPress={() => { trigger('light'); navigation.navigate('GoalDetail', { goalId: goal.id }); }}
                />
              ))
            )}
          </Animated.View>

          {/* Savings Challenges */}
          <Animated.View style={challengesEntrance}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Savings Challenges</Text>
              <Pressable onPress={() => { trigger('light'); navigation.navigate('SavingsChallenges'); }}>
                <Text style={styles.sectionLink}>Start a challenge →</Text>
              </Pressable>
            </View>
            {activeChallengeDetails.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.challengeScroll}
              >
                {activeChallengeDetails.map(({ challenge, activeData }) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    activeData={activeData}
                    onPress={() => { trigger('light'); navigation.navigate('SavingsChallenges'); }}
                  />
                ))}
              </ScrollView>
            ) : (
              <GlassCard>
                <View style={styles.challengeEmptyRow}>
                  <Ionicons name="trophy-outline" size={24} color={colors.primary} />
                  <Text style={styles.challengeEmptyText}>No active challenges yet. Start one to boost your savings!</Text>
                </View>
              </GlassCard>
            )}
          </Animated.View>

          {/* Completed Goals */}
          {completedGoalCount > 0 && (
            <Animated.View style={completedEntrance}>
              <GlassCard style={styles.completedCard}>
                <View style={styles.completedRow}>
                  <Text style={styles.completedEmoji}>🎉</Text>
                  <View>
                    <Text style={styles.completedCount}>{completedGoalCount} goal{completedGoalCount !== 1 ? 's' : ''} achieved</Text>
                    <Text style={styles.completedSub}>Amazing progress — keep going!</Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}
        </ScrollView>

        <FAB onPress={() => { navigation.navigate('Chatbot'); }} />
        {ConfettiCannon && (
          <ConfettiCannon
            ref={(r) => (confettiRef.current = r)}
            count={120}
            origin={{ x: -10, y: 0 }}
            autoStart={false}
            colors={[colors.primary, colors.primaryLight, '#F5F0E8']}
          />
        )}
      </SafeAreaView>

      {/* Goal creation modal */}
      <GlassModal visible={goalModalVisible} onClose={() => setGoalModalVisible(false)}>
        <Text style={styles.modalTitle}>Set New Goal</Text>
        <Text style={styles.modalSubtitle}>Choose an example or write your own</Text>
        <View style={styles.chipsRow}>
          {GOAL_EXAMPLES.slice(0, 4).map((ex, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.chip, newGoalText === ex && styles.chipActive]}
              onPress={() => setNewGoalText(ex)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, newGoalText === ex && styles.chipTextActive]}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.modalInput}
          placeholder="Write your own goal (max 100 chars)"
          placeholderTextColor={colors.textTertiary}
          value={newGoalText}
          onChangeText={setNewGoalText}
          maxLength={100}
          multiline
        />
        <Text style={styles.charCount}>{newGoalText.length}/100</Text>

        <TextInput
          style={[styles.modalInput, styles.modalInputSm]}
          placeholder="Target amount (optional, e.g. 5000)"
          placeholderTextColor={colors.textTertiary}
          value={newGoalAmount}
          onChangeText={setNewGoalAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.modalInput, styles.modalInputSm]}
          placeholder="Deadline (optional, e.g. 2025-12-31)"
          placeholderTextColor={colors.textTertiary}
          value={newGoalDeadline}
          onChangeText={setNewGoalDeadline}
        />

        <View style={styles.modalActions}>
          <AnimatedButton title="Add Goal" onPress={handleAddGoal} variant="primary" disabled={!newGoalText.trim()} style={styles.modalBtn} />
          <AnimatedButton title="Cancel" onPress={() => setGoalModalVisible(false)} variant="secondary" style={styles.modalBtn} />
        </View>
      </GlassModal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  screenTitle: { fontSize: 32, fontWeight: '700', color: colors.text, letterSpacing: 0.3, marginBottom: 4 },
  screenSubtitle: { fontSize: 14, color: colors.textTertiary, marginBottom: spacing.xl, letterSpacing: 0.1 },
  ctaRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionLink: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  emptyText: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  challengeScroll: { paddingBottom: spacing.sm },
  challengeEmptyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  challengeEmptyText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  completedCard: { marginBottom: spacing.md },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  completedEmoji: { fontSize: 28 },
  completedCount: { fontSize: 16, fontWeight: '700', color: colors.text },
  completedSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  fabContainer: { position: 'absolute', bottom: 28, right: 20, zIndex: 50, ...shadows.goldGlow },
  fabBlur: { width: 72, height: 64, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  fabAndroid: { backgroundColor: '#1E1B16' },
  fabLabel: { fontSize: 10, color: colors.primary, fontWeight: '600', marginTop: 4, textAlign: 'center', letterSpacing: 0.2 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: colors.textTertiary, marginBottom: 16 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { backgroundColor: GLASS_BG, borderWidth: 1, borderColor: GLASS_BORDER, borderRadius: radii.round, paddingVertical: 6, paddingHorizontal: 12 },
  chipActive: { backgroundColor: 'rgba(212,168,67,0.2)', borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.primaryLight, fontWeight: '600' },
  modalInput: { backgroundColor: 'rgba(255,248,230,0.06)', borderWidth: 1, borderColor: GLASS_BORDER, borderRadius: radii.md, padding: spacing.md, fontSize: 15, color: colors.text, minHeight: 64, textAlignVertical: 'top', marginBottom: 6 },
  modalInputSm: { minHeight: 44 },
  charCount: { fontSize: 12, color: colors.textTertiary, textAlign: 'right', marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: spacing.sm },
  modalBtn: { flex: 1 },
});
