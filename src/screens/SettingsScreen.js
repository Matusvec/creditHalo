import React from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { signOut } from '../services/auth';
import { openPlaidLink } from '../services/plaid';
import { GradientBackground, GlassCard, AnimatedButton } from '../components/ui';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { globalStyles } from '../theme/styles';
import colors from '../theme/colors';
import { typography, spacing } from '../theme/tokens';

/**
 * Settings screen with profile, bank linking, notifications, and legal sections.
 */
export default function SettingsScreen({ navigation }) {
  const {
    user,
    bankLinked,
    setBankLinked,
    setUser,
    notificationsEnabled,
    setNotificationsEnabled,
    persist,
  } = useStore();

  const profileAnim = useEntranceAnimation(0);
  const bankAnim = useEntranceAnimation(80);
  const notifAnim = useEntranceAnimation(160);
  const legalAnim = useEntranceAnimation(240);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    persist();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Loading' }],
    });
  };

  const handleLinkBank = async () => {
    await openPlaidLink(
      () => {
        setBankLinked(true);
        persist();
      },
      () => {}
    );
  };

  const handleNotificationsToggle = (value) => {
    setNotificationsEnabled(value);
    persist();
  };

  const legalItems = [
    { label: 'Terms & Conditions' },
    { label: 'Privacy Policy' },
    { label: 'Disclosures' },
  ];

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}
        <Animated.View style={profileAnim}>
          <GlassCard>
            <Text style={styles.sectionLabel}>PROFILE</Text>
            <Text style={styles.sectionTitle}>{user?.name || 'Your Account'}</Text>
            <Text style={styles.emailText}>{user?.email || 'Not signed in'}</Text>
            <AnimatedButton
              title="Log Out"
              variant="secondary"
              onPress={handleLogout}
              style={styles.buttonSpacing}
            />
          </GlassCard>
        </Animated.View>

        {/* Bank Account */}
        <Animated.View style={bankAnim}>
          <GlassCard>
            <Text style={styles.sectionLabel}>CONNECTED ACCOUNT</Text>
            <Text style={styles.sectionTitle}>Bank Account</Text>
            {bankLinked && (
              <View style={styles.linkedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.linkedText}>Bank account connected</Text>
              </View>
            )}
            <AnimatedButton
              title={bankLinked ? 'Reconnect Bank' : 'Link Bank Account'}
              variant="primary"
              onPress={handleLinkBank}
              style={styles.buttonSpacing}
            />
          </GlassCard>
        </Animated.View>

        {/* Notifications */}
        <Animated.View style={notifAnim}>
          <GlassCard>
            <View style={styles.notifRow}>
              <View>
                <Text style={styles.sectionLabel}>PREFERENCES</Text>
                <Text style={styles.sectionTitle}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.textTertiary, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Legal */}
        <Animated.View style={legalAnim}>
          <GlassCard>
            <Text style={styles.sectionLabel}>LEGAL</Text>
            {legalItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.legalRow, index < legalItems.length - 1 && styles.legalDivider]}
                activeOpacity={0.65}
              >
                <Text style={styles.legalLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 100,
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.primaryMuted,
    marginBottom: 4,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 4,
  },
  emailText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  buttonSpacing: {
    marginTop: 14,
  },
  linkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  linkedText: {
    ...typography.callout,
    color: colors.success,
  },
  notifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
  },
  legalDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 215, 0, 0.1)',
  },
  legalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
