import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { spacing, radii, shadows, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

/**
 * AI insight card with a gold left accent bar, icon+title, and optional CTA.
 * @param {{ icon: string, title: string, message: string, actionLabel?: string, onAction?: () => void }} props
 */
const InsightCard = ({ icon, title, message, actionLabel, onAction }) => (
  <View style={styles.card}>
    {/* Gold left accent */}
    <View style={styles.accent} />

    <View style={styles.body}>
      <View style={styles.titleRow}>
        {icon && (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={16} color={colors.primary} />
          </View>
        )}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
      </View>

      <Text style={styles.message}>{message}</Text>

      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.primary} />
        </Pressable>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS_BG,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.subtle,
  },
  accent: {
    width: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radii.md,
    borderBottomLeftRadius: radii.md,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    gap: 2,
  },
  actionPressed: {
    opacity: 0.7,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default InsightCard;
