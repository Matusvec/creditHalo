import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { springs } from '../../theme/tokens';

/**
 * Entrance-animated text with fade + translateY spring on mount
 */
const AnimatedText = ({ children, style, delay = 0 }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, springs.entrance));
    translateY.value = withDelay(delay, withSpring(0, springs.entrance));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {children}
    </Animated.Text>
  );
};

export default AnimatedText;
