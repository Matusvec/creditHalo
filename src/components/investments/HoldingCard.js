import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { spacing, radii, shadows, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

/**
 * Card displaying a single investment holding with gain/loss info.
 * @param {{ holding: object, performance: { totalValue: number, totalCost: number, gainLoss: number, gainLossPercent: number } }} props
 */
const HoldingCard = ({ holding, performance }) => {
  if (!holding) return null;

  const { symbol, name, shares, currentPrice, type } = holding;
  const { totalValue = 0, gainLoss = 0, gainLossPercent = 0 } = performance || {};

  const isPositive = gainLoss >= 0;
  const gainColor = isPositive ? colors.success : colors.error;
  const gainIcon = isPositive ? 'trending-up' : 'trending-down';
  const gainPrefix = isPositive ? '+' : '';

  const typeColor = {
    ETF: '#4FC3F7',
    Stock: '#CE93D8',
    'Mutual Fund': '#81C784',
    Bond: '#FFD54F',
  }[type] || colors.primaryMuted;

  return (
    <View style={styles.card}>
      {/* Left: symbol circle + info */}
      <View style={styles.left}>
        <View style={[styles.symbolBadge, { backgroundColor: `${typeColor}20` }]}>
          <Text style={[styles.symbolText, { color: typeColor }]} numberOfLines={1}>
            {symbol?.length > 4 ? symbol.slice(0, 4) : symbol}
          </Text>
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.meta}>
            {shares} shares · ${currentPrice?.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Right: value + gain */}
      <View style={styles.right}>
        <Text style={styles.value}>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        <View style={styles.gainRow}>
          <Ionicons name={gainIcon} size={11} color={gainColor} />
          <Text style={[styles.gainText, { color: gainColor }]}>
            {gainPrefix}${Math.abs(gainLoss).toFixed(2)} ({gainPrefix}{gainLossPercent.toFixed(2)}%)
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS_BG,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.subtle,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    marginRight: spacing.sm,
  },
  symbolBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  symbolText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  meta: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
    flexShrink: 0,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  gainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gainText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default HoldingCard;
