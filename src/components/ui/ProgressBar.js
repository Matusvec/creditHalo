import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme/colors';
import { radii, springs } from '../../theme/tokens';

/**
 * Animated progress bar with gold gradient fill
 */
const ProgressBar = ({ progress = 0, height = 12, style }) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(Math.min(Math.max(progress, 0), 1) * 100, springs.entrance);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={[styles.track, { height }, style]}>
      <Animated.View style={[styles.fill, { height }, animatedStyle]}>
        <LinearGradient
          colors={[colors.primaryMuted, colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: 'rgba(255, 248, 230, 0.08)',
    borderRadius: radii.round,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radii.round,
    overflow: 'hidden',
  },
});

export default ProgressBar;
