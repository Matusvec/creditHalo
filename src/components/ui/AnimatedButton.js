import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useHaptic } from '../../hooks/useHaptic';
import colors from '../../theme/colors';
import { radii, shadows, springs } from '../../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Press-animated button with haptic feedback
 * Variants: primary (gold bg), secondary (glass border), ghost (text only)
 */
const AnimatedButton = ({ title, onPress, variant = 'primary', style, textStyle, disabled, children }) => {
  const scale = useSharedValue(1);
  const { trigger } = useHaptic();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springs.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.press);
  };

  const handlePress = () => {
    trigger('light');
    onPress?.();
  };

  const variantStyles = variants[variant] || variants.primary;
  const variantTextStyles = textVariants[variant] || textVariants.primary;

  return (
    <AnimatedPressable
      style={[variantStyles, animatedStyle, disabled && styles.disabled, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      {children || <Text style={[styles.text, variantTextStyles, textStyle]}>{title}</Text>}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

const variants = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.goldGlow,
  },
  secondary: {
    backgroundColor: 'rgba(255, 248, 230, 0.06)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const textVariants = StyleSheet.create({
  primary: {
    color: colors.background,
  },
  secondary: {
    color: colors.primary,
  },
  ghost: {
    color: colors.primary,
  },
});

export default AnimatedButton;
