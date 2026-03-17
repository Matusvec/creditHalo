import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { GlassCard, AnimatedButton } from './ui';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import colors from '../theme/colors';

const GoalCard = ({ goal, onComplete, delay = 0 }) => {
  if (!goal || goal.text == null) return null;
  const entranceStyle = useEntranceAnimation(delay);

  return (
    <Animated.View style={entranceStyle}>
      <GlassCard>
        <Text style={styles.goalText}>{goal.text}</Text>
        <AnimatedButton
          title="I completed this goal"
          onPress={() => onComplete(goal.id)}
          style={{ marginTop: 12 }}
        />
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  goalText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});

export default GoalCard;
