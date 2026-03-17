import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import colors from '../../theme/colors';
import { radii, shadows, blur, springs, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

/**
 * Premium modal with animated backdrop fade and spring slide-up content
 */
const GlassModal = ({ visible, onClose, children, fullScreen = false }) => {
  const translateY = useSharedValue(300);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, springs.modal);
    } else {
      backdropOpacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(300, { duration: 200 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const CardWrapper = Platform.OS === 'ios' ? BlurView : View;
  const cardWrapperProps = Platform.OS === 'ios'
    ? { intensity: blur.medium, tint: 'dark', style: styles.blurCard }
    : { style: [styles.blurCard, styles.androidCard] };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[fullScreen ? styles.fullContent : styles.content, contentStyle]}>
          <CardWrapper {...cardWrapperProps}>
            <View style={[styles.innerContent, fullScreen && styles.fullInner]}>
              {children}
            </View>
          </CardWrapper>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    marginHorizontal: 24,
    maxHeight: '85%',
  },
  fullContent: {
    flex: 1,
    marginTop: 60,
  },
  blurCard: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    ...shadows.glass,
  },
  androidCard: {
    backgroundColor: 'rgba(46, 42, 36, 0.95)',
  },
  innerContent: {
    backgroundColor: GLASS_BG,
    padding: 24,
  },
  fullInner: {
    flex: 1,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
});

export default GlassModal;
