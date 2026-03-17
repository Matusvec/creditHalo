import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { useStore } from '../store/useStore';
import { signInWithGoogle } from '../services/auth';
import AngelMascot from '../components/AngelMascot';
import { GradientBackground, AnimatedText, AnimatedButton } from '../components/ui';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import colors from '../theme/colors';

/**
 * LoadingScreen — entry point shown before auth state resolves.
 * Hydrates persisted store, redirects authenticated users, and
 * presents the Google sign-in flow for new users.
 */
export default function LoadingScreen({ navigation }) {
  const { user, setUser, hydrate, persist } = useStore();

  // Staggered entrance delays
  const mascotStyle = useEntranceAnimation(0);
  const buttonStyle = useEntranceAnimation(600);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      persist();
      navigation.replace('Main');
    }
  }, [user]);

  const handleSignIn = async () => {
    const userData = await signInWithGoogle();
    setUser(userData);
    persist();
    navigation.replace('Main');
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>

          {/* Mascot with radial glow behind it */}
          <Animated.View style={[styles.mascotContainer, mascotStyle]}>
            <View style={styles.radialGlow} />
            <AngelMascot size={140} glow />
          </Animated.View>

          {/* Title in gold */}
          <AnimatedText
            delay={200}
            style={styles.title}
          >
            Credit Halo
          </AnimatedText>

          {/* Subtitle */}
          <AnimatedText
            delay={400}
            style={styles.subtitle}
          >
            Build your financial future
          </AnimatedText>

          {/* Sign-in button */}
          <Animated.View style={[styles.buttonWrapper, buttonStyle]}>
            <AnimatedButton
              title="Sign up with Google"
              variant="primary"
              onPress={handleSignIn}
              style={styles.button}
            />
          </Animated.View>

        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  radialGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(212, 168, 67, 0.12)',
    // Layered outer glow ring
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 60,
    elevation: 0,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 48,
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonWrapper: {
    width: '100%',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
  },
});
