import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { openPlaidLink } from '../services/plaid';
import AngelMascot from '../components/AngelMascot';
import { GradientBackground, GlassCard, AnimatedButton } from '../components/ui';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { usePressAnimation } from '../hooks/usePressAnimation';
import colors from '../theme/colors';

/**
 * HomeScreen — main landing tab after authentication.
 * Shows personalized greeting, bank linking prompt, and
 * navigational hint toward the tab bar features.
 */
export default function HomeScreen({ navigation }) {
  const { user, bankLinked, setBankLinked, persist } = useStore();
  const [linking, setLinking] = useState(false);

  // Entrance animations: greeting at 0ms, card at 200ms, button at 400ms
  const greetingStyle = useEntranceAnimation(0);
  const cardStyle = useEntranceAnimation(200);
  const hintStyle = useEntranceAnimation(500);

  // Press animation for settings icon
  const { animatedStyle: settingsAnimStyle, onPressIn, onPressOut } = usePressAnimation(0.88);

  const handleLinkBank = async () => {
    if (bankLinked) return;
    setLinking(true);
    await openPlaidLink(
      () => {
        setBankLinked(true);
        persist();
        setLinking(false);
      },
      () => setLinking(false)
    );
  };

  const linkButtonLabel = bankLinked
    ? 'Bank Account Linked'
    : linking
    ? 'Linking...'
    : 'Link Bank Account';

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Header row: greeting + settings icon */}
          <Animated.View style={[styles.headerRow, greetingStyle]}>
            <View style={styles.greetingBlock}>
              <Text style={styles.welcomeLine}>
                Welcome,{' '}
                <Text style={styles.userName}>{user?.name || 'User'}</Text>!
              </Text>
              <Text style={styles.subLine}>Your angel is here to guide you.</Text>
            </View>

            <Animated.View style={settingsAnimStyle}>
              <Pressable
                onPress={() => navigation.navigate('Settings')}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={styles.settingsBtn}
                hitSlop={8}
              >
                <Ionicons name="settings-outline" size={26} color={colors.textSecondary} />
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* Mascot prompt card */}
          <Animated.View style={cardStyle}>
            <GlassCard style={styles.mascotCard}>
              <View style={styles.mascotRow}>
                <AngelMascot size={64} />
                <Text style={styles.mascotText}>
                  Link your bank account for personalized insights!
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Link bank button */}
          <Animated.View style={cardStyle}>
            <AnimatedButton
              variant={bankLinked ? 'secondary' : 'primary'}
              onPress={handleLinkBank}
              disabled={bankLinked || linking}
              style={styles.linkButton}
            >
              <View style={styles.linkButtonInner}>
                {linking ? (
                  <ActivityIndicator
                    color={colors.background}
                    size="small"
                    style={styles.linkIcon}
                  />
                ) : (
                  <Ionicons
                    name={bankLinked ? 'checkmark-circle' : 'link'}
                    size={22}
                    color={bankLinked ? colors.primary : colors.background}
                    style={styles.linkIcon}
                  />
                )}
                <Text style={[styles.linkButtonText, bankLinked && styles.linkButtonTextLinked]}>
                  {linkButtonLabel}
                </Text>
              </View>
            </AnimatedButton>
          </Animated.View>

          {/* Navigation hint */}
          <Animated.View style={hintStyle}>
            <Text style={styles.hintText}>
              Tap the tabs below to explore Learn, Community, Goals, and Insights.
            </Text>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingBlock: {
    flex: 1,
    marginRight: 12,
  },
  welcomeLine: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userName: {
    color: colors.primary,
  },
  subLine: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Mascot card
  mascotCard: {
    marginBottom: 16,
  },
  mascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },

  // Link bank button
  linkButton: {
    marginBottom: 24,
    width: '100%',
  },
  linkButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkIcon: {
    marginRight: 8,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  linkButtonTextLinked: {
    color: colors.primary,
  },

  // Hint
  hintText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
