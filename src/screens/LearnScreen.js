import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { LEARNING_MODULES } from '../data/mockModules';
import StreakTracker from '../components/StreakTracker';
import { GradientBackground, GlassCard, ProgressBar } from '../components/ui';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { useHaptic } from '../hooks/useHaptic';
import colors from '../theme/colors';
import { typography, spacing, springs } from '../theme/tokens';

/**
 * Pressable module card with animated arrow on press.
 */
function ModuleCard({ mod, modCompleted, total, onPress, delay }) {
  const entranceStyle = useEntranceAnimation(delay);
  const arrowOffset = useSharedValue(0);
  const { trigger } = useHaptic();
  const isComplete = modCompleted === total;

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowOffset.value }],
  }));

  const handlePressIn = () => {
    arrowOffset.value = withSpring(4, springs.press);
  };

  const handlePressOut = () => {
    arrowOffset.value = withSpring(0, springs.press);
  };

  const handlePress = () => {
    trigger('light');
    onPress();
  };

  return (
    <Animated.View style={entranceStyle}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <GlassCard>
          <View style={styles.moduleRow}>
            <View style={styles.moduleLeft}>
              <Text style={styles.moduleIcon}>{mod.icon}</Text>
              <View style={styles.moduleTextGroup}>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleSub}>{modCompleted}/{total} lessons</Text>
              </View>
            </View>
            <Animated.View style={arrowStyle}>
              {isComplete ? (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={22} color={colors.primaryMuted} />
              )}
            </Animated.View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Learning hub with streak tracking, overall progress, and module list.
 */
export default function LearnScreen({ navigation }) {
  const { completedLessons, streak } = useStore();

  const totalLessons = LEARNING_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  const completed = completedLessons.length;
  const progress = totalLessons > 0 ? completed / totalLessons : 0;

  const wingsAnim = useEntranceAnimation(0);
  const modulesHeaderAnim = useEntranceAnimation(160);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <StreakTracker streak={streak} />

          {/* Earn Your Wings */}
          <Animated.View style={wingsAnim}>
            <GlassCard>
              <Text style={styles.sectionLabel}>YOUR PROGRESS</Text>
              <Text style={styles.sectionTitle}>Earn Your Wings</Text>
              <View style={styles.progressRow}>
                <ProgressBar progress={progress} style={styles.progressBar} />
                <Text style={styles.progressCount}>{completed}/{totalLessons}</Text>
              </View>
              <View style={styles.featherRow}>
                <Text style={styles.angel}>👼</Text>
                {[...Array(Math.min(completed, 5))].map((_, i) => (
                  <Text key={i} style={styles.feather}>🪶</Text>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Section header */}
          <Animated.View style={modulesHeaderAnim}>
            <Text style={styles.modulesHeader}>Learning Modules</Text>
          </Animated.View>

          {/* Module cards with staggered entrance */}
          {LEARNING_MODULES.map((mod, index) => {
            const modCompleted = mod.lessons.filter((l) =>
              completedLessons.includes(l.id)
            ).length;
            const total = mod.lessons.length;
            return (
              <ModuleCard
                key={mod.id}
                mod={mod}
                modCompleted={modCompleted}
                total={total}
                onPress={() => navigation.navigate('LessonDetail', { moduleId: mod.id })}
                delay={200 + index * 50}
              />
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.primaryMuted,
    marginBottom: 4,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    marginRight: 12,
  },
  progressCount: {
    ...typography.callout,
    color: colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  featherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  angel: {
    fontSize: 18,
    marginRight: 6,
  },
  feather: {
    fontSize: 16,
    marginRight: 2,
  },
  modulesHeader: {
    ...typography.title,
    color: colors.text,
    marginBottom: 12,
    marginTop: 4,
  },
  moduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moduleIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  moduleTextGroup: {
    flex: 1,
  },
  moduleTitle: {
    ...typography.headline,
    color: colors.text,
    fontSize: 17,
    marginBottom: 2,
  },
  moduleSub: {
    ...typography.callout,
    color: colors.textSecondary,
  },
});
