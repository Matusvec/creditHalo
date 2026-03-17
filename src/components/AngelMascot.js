import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import colors from '../theme/colors';

const AngelMascot = ({ size = 80, style, glow = false }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1500 }),
        withTiming(6, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={[{ width: size, height: size + 12, alignItems: 'center', justifyContent: 'center' }, style]}>
      {glow && <View style={[styles.glow, { width: size * 0.8, height: size * 0.8, borderRadius: size * 0.4 }]} />}
      <Animated.View style={floatStyle}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Halo */}
          <Circle cx="50" cy="18" r="12" fill="none" stroke={colors.primary} strokeWidth="3" />
          {/* Head */}
          <Circle cx="50" cy="35" r="15" fill="#3A3530" stroke={colors.primaryMuted} strokeWidth="2" />
          {/* Eyes */}
          <Circle cx="44" cy="32" r="3" fill={colors.primaryLight} />
          <Circle cx="56" cy="32" r="3" fill={colors.primaryLight} />
          {/* Smile */}
          <Path
            d="M 42 42 Q 50 48 58 42"
            fill="none"
            stroke={colors.primaryLight}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Body */}
          <Path
            d="M 35 52 Q 50 75 65 52 L 60 90 Q 50 85 40 90 Z"
            fill="#3A3530"
            stroke={colors.primaryMuted}
            strokeWidth="2"
          />
          {/* Left wing */}
          <Path
            d="M 35 52 Q 5 45 15 70 Q 25 60 35 52"
            fill="rgba(212, 168, 67, 0.2)"
            stroke={colors.primaryMuted}
            strokeWidth="2"
          />
          {/* Right wing */}
          <Path
            d="M 65 52 Q 95 45 85 70 Q 75 60 65 52"
            fill="rgba(212, 168, 67, 0.2)"
            stroke={colors.primaryMuted}
            strokeWidth="2"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(212, 168, 67, 0.15)',
  },
});

export default AngelMascot;
