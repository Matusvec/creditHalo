import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

/** Maps category names to Ionicons icon identifiers */
const CATEGORY_ICONS = {
  Groceries: 'basket-outline',
  Dining: 'restaurant-outline',
  Gas: 'car-outline',
  Transportation: 'car-sport-outline',
  Shopping: 'bag-outline',
  Entertainment: 'film-outline',
  Healthcare: 'medkit-outline',
  'Personal Care': 'cut-outline',
  Subscriptions: 'refresh-outline',
  Utilities: 'flash-outline',
  Rent: 'home-outline',
  Insurance: 'shield-outline',
  Transfer: 'swap-horizontal-outline',
  Investment: 'trending-up-outline',
  Income: 'arrow-down-circle-outline',
};

/**
 * A single row representing one transaction in a list.
 * @param {{ transaction: object, onPress?: () => void }} props
 */
const TransactionRow = ({ transaction, onPress }) => {
  const isIncome = transaction.amount > 0;
  const amountColor = isIncome ? colors.success : colors.text;
  const amountPrefix = isIncome ? '+' : '-';
  const absAmount = Math.abs(transaction.amount);
  const icon = CATEGORY_ICONS[transaction.category] || 'ellipse-outline';

  const formattedDate = transaction.date
    ? new Date(transaction.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>

      <View style={styles.info}>
        <Text style={styles.merchant} numberOfLines={1}>
          {transaction.merchant}
        </Text>
        <Text style={styles.meta}>
          {transaction.category}
          {formattedDate ? ` · ${formattedDate}` : ''}
        </Text>
      </View>

      <Text style={[styles.amount, { color: amountColor }]}>
        {amountPrefix}${absAmount.toFixed(2)}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    gap: spacing.md,
  },
  rowPressed: {
    backgroundColor: 'rgba(255, 248, 230, 0.04)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.round,
    backgroundColor: 'rgba(212, 168, 67, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  merchant: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 0,
  },
});

export default TransactionRow;
