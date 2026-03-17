import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import colors from '../../theme/colors';
import { spacing } from '../../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * SVG-based animated circular gauge for displaying a score.
 * Color-coded: red <40, gold 40-69, green 70+
 * @param {{ score: number, maxScore?: number, size?: number, strokeWidth?: number, color?: string, label?: string, animated?: boolean }} props
 */
const ScoreRing = ({
  score = 0,
  maxScore = 100,
  size = 140,
  strokeWidth = 10,
  color,
  label,
  animated = true,
}) => {
  const clampedScore = Math.min(Math.max(score, 0), maxScore);
  const ratio = maxScore > 0 ? clampedScore / maxScore : 0;

  const ringColor = color || (() => {
    const pct = (clampedScore / maxScore) * 100;
    if (pct >= 70) return colors.success;
    if (pct >= 40) return colors.primary;
    return colors.error;
  })();

  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progress.value = withTiming(ratio, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = ratio;
    }
  }, [ratio, animated]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255, 248, 230, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Fill arc */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={[styles.scoreText, { color: ringColor }]}>
          {Math.round(clampedScore)}
        </Text>
        {label ? (
          <Text style={styles.labelText}>{label}</Text>
        ) : (
          <Text style={styles.labelText}>/ {maxScore}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  labelText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
});

export default ScoreRing;
