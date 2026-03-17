import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { springs } from '../theme/tokens';

/**
 * Staggered fade + translateY spring entrance animation
 */
export const useEntranceAnimation = (delay = 0) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, springs.entrance));
    translateY.value = withDelay(delay, withSpring(0, springs.entrance));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
};
