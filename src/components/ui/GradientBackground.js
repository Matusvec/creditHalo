import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme/colors';

/**
 * Full-screen dark warm gradient background
 */
const GradientBackground = ({ children, style }) => (
  <LinearGradient
    colors={colors.gradientDark}
    style={[styles.gradient, style]}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default GradientBackground;
