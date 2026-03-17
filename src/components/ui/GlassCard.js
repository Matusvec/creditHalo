import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import colors from '../../theme/colors';
import { radii, shadows, blur, GLASS_BG, GLASS_BORDER, GLASS_HIGHLIGHT } from '../../theme/tokens';

/**
 * Frosted glass card with blur effect and gold border highlight
 */
const GlassCard = ({ children, style, intensity = blur.light, noPadding = false }) => {
  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.wrapper, shadows.glass, style]}>
        <BlurView intensity={intensity} tint="dark" style={styles.blur}>
          <View style={[styles.overlay, noPadding && { padding: 0 }]}>
            <View style={styles.highlight} />
            {children}
          </View>
        </BlurView>
      </View>
    );
  }

  // Android fallback - solid semi-transparent
  return (
    <View style={[styles.wrapper, styles.androidFallback, shadows.glass, style]}>
      <View style={[styles.overlay, noPadding && { padding: 0 }]}>
        <View style={styles.highlight} />
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    marginBottom: 12,
  },
  blur: {
    overflow: 'hidden',
  },
  overlay: {
    backgroundColor: GLASS_BG,
    padding: 16,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: GLASS_HIGHLIGHT,
  },
  androidFallback: {
    backgroundColor: 'rgba(46, 42, 36, 0.92)',
  },
});

export default GlassCard;
