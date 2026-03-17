import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { GlassCard } from './ui';
import colors from '../theme/colors';
import { springs } from '../theme/tokens';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const StreakTracker = ({ streak }) => {
  const fireScale = useSharedValue(1);
  const countScale = useSharedValue(0);
  const today = new Date().getDay();

  useEffect(() => {
    fireScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );
    countScale.value = withSpring(1, springs.entrance);
  }, []);

  const fireStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }));

  const countStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  return (
    <GlassCard>
      <View style={styles.row}>
        <View style={styles.streakInfo}>
          <Animated.Text style={[styles.fire, fireStyle]}>🔥</Animated.Text>
          <View>
            <Animated.Text style={[styles.count, countStyle]}>{streak}</Animated.Text>
            <Text style={styles.label}>Day Streak</Text>
          </View>
        </View>
        <View style={styles.days}>
          {DAYS.map((day, i) => (
            <View
              key={i}
              style={[
                styles.dayDot,
                i === today && styles.dayDotActive,
                i < today && i >= today - (streak % 7) && styles.dayDotCompleted,
              ]}
            >
              <Text style={[styles.dayText, i === today && styles.dayTextActive]}>{day}</Text>
            </View>
          ))}
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fire: {
    fontSize: 32,
    marginRight: 12,
  },
  count: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  days: {
    flexDirection: 'row',
    gap: 4,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 248, 230, 0.06)',
  },
  dayDotActive: {
    backgroundColor: colors.primary,
  },
  dayDotCompleted: {
    backgroundColor: 'rgba(212, 168, 67, 0.3)',
  },
  dayText: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  dayTextActive: {
    color: colors.background,
  },
});

export default StreakTracker;
