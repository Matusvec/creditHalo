import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { springs } from '../theme/tokens';

/**
 * Scale-down spring animation on press
 */
export const usePressAnimation = (targetScale = 0.97) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(targetScale, springs.press);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, springs.press);
  };

  return { animatedStyle, onPressIn, onPressOut };
};
