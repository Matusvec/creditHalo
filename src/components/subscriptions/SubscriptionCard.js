import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import colors from '../../theme/colors';
import { spacing, radii } from '../../theme/tokens';

/** Maps subscription categories to icon names */
const SUB_ICONS = {
  Subscriptions: 'play-circle-outline',
  Streaming: 'play-circle-outline',
  Music: 'musical-notes-outline',
  Fitness: 'barbell-outline',
  'Cloud Storage': 'cloud-outline',
  Software: 'code-slash-outline',
  News: 'newspaper-outline',
  Gaming: 'game-controller-outline',
};

/**
 * Card displaying a single subscription with cancel action.
 * @param {{ subscription: object, onCancel?: () => void, cancelled?: boolean }} props
 */
const SubscriptionCard = ({ subscription, onCancel, cancelled = false }) => {
  const {
    merchant,
    amount,
    category,
    frequency,
    nextExpectedDate,
    lastChargeDate,
  } = subscription;

  const icon = SUB_ICONS[category] || SUB_ICONS[subscription.subcategory] || 'card-outline';

  const monthlyEquiv =
    frequency === 'annual'
      ? (amount / 12).toFixed(2)
      : frequency === 'weekly'
      ? (amount * 4.33).toFixed(2)
      : amount.toFixed(2);

  const nextDate = nextExpectedDate
    ? new Date(nextExpectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <GlassCard style={[styles.card, cancelled && styles.cancelled]}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, cancelled && styles.iconWrapCancelled]}>
          <Ionicons name={icon} size={20} color={cancelled ? colors.textTertiary : colors.primary} />
        </View>

        <View style={styles.info}>
          <Text style={[styles.merchant, cancelled && styles.textDimmed]}>{merchant}</Text>
          <Text style={styles.meta}>
            {category}
            {frequency ? ` · ${frequency}` : ''}
          </Text>
          {nextDate && !cancelled && (
            <Text style={styles.nextDate}>Next: {nextDate}</Text>
          )}
          {cancelled && subscription.cancelledDate && (
            <Text style={styles.cancelledLabel}>
              Cancelled {new Date(subscription.cancelledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          )}
        </View>

        <View style={styles.amountBlock}>
          <Text style={[styles.amount, cancelled && styles.textDimmed]}>
            ${monthlyEquiv}
          </Text>
          <Text style={styles.perMonth}>/mo</Text>
          {!cancelled && onCancel && (
            <Pressable onPress={onCancel} hitSlop={8} style={styles.cancelBtn}>
              <Ionicons name="close-circle-outline" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  cancelled: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.round,
    backgroundColor: 'rgba(212, 168, 67, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapCancelled: {
    backgroundColor: 'rgba(255, 248, 230, 0.04)',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  merchant: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  textDimmed: {
    color: colors.textSecondary,
  },
  meta: {
    fontSize: 12,
    color: colors.textTertiary,
    textTransform: 'capitalize',
  },
  nextDate: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
  },
  cancelledLabel: {
    fontSize: 11,
    color: colors.error,
    marginTop: 2,
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  perMonth: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  cancelBtn: {
    marginTop: spacing.xs,
  },
});

export default SubscriptionCard;
