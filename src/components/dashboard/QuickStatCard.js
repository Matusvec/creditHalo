import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { spacing, radii, shadows, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

/**
 * Compact stat card for dashboard overview panels.
 * @param {{ label: string, value: string | number, icon?: string, trend?: string | number, trendDirection?: 'up' | 'down' | 'neutral' }} props
 */
const QuickStatCard = ({ label, value, icon, trend, trendDirection = 'neutral' }) => {
  const trendColor =
    trendDirection === 'up' ? colors.success :
    trendDirection === 'down' ? colors.error :
    colors.textTertiary;

  const trendIcon =
    trendDirection === 'up' ? 'arrow-up' :
    trendDirection === 'down' ? 'arrow-down' :
    'remove';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {icon && (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={16} color={colors.primary} />
          </View>
        )}
        {trend != null && (
          <View style={[styles.trendBadge, { backgroundColor: `${trendColor}20` }]}>
            <Ionicons name={trendIcon} size={10} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor }]}>{trend}</Text>
          </View>
        )}
      </View>

      <Text style={styles.value} numberOfLines={1}>{value}</Text>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS_BG,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: spacing.md,
    flex: 1,
    minWidth: 100,
    ...shadows.subtle,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: radii.round,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 3,
    letterSpacing: 0.2,
  },
});

export default QuickStatCard;
