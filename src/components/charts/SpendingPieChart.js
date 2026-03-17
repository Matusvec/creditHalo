import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';
import { CHART_COLORS, formatCurrency } from './chartTheme';

/**
 * Spending breakdown pie chart with legend and center total label.
 * @param {{ data: { label: string, value: number, color?: string }[], size?: number, showLabels?: boolean, onPress?: (item: object) => void }} props
 */
const SpendingPieChart = ({ data = [], size = 160, showLabels = true, onPress }) => {
  if (!data.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No spending data</Text>
      </View>
    );
  }

  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  const pieData = data.map((item, i) => ({
    value: item.value || 0,
    color: item.color || CHART_COLORS[i % CHART_COLORS.length],
    text: item.label,
    onPress: () => onPress?.(item),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <PieChart
          data={pieData}
          donut
          radius={size / 2}
          innerRadius={size / 2 - 28}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerValue}>{formatCurrency(total)}</Text>
              <Text style={styles.centerSub}>total</Text>
            </View>
          )}
          strokeColor={colors.background}
          strokeWidth={2}
        />
      </View>

      {showLabels && (
        <View style={styles.legend}>
          {data.map((item, i) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
            return (
              <View key={i} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: item.color || CHART_COLORS[i % CHART_COLORS.length] }]} />
                <Text style={styles.legendLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.legendValue}>{formatCurrency(item.value)}</Text>
                <Text style={styles.legendPct}>{pct}%</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS_BG,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: spacing.lg,
    alignItems: 'center',
  },
  chartWrapper: {
    marginBottom: spacing.lg,
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  centerSub: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  legend: {
    width: '100%',
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.round,
    flexShrink: 0,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.xs,
  },
  legendPct: {
    fontSize: 11,
    color: colors.textTertiary,
    width: 40,
    textAlign: 'right',
  },
  empty: {
    color: colors.textTertiary,
    fontSize: 14,
    padding: spacing.xl,
  },
});

export default SpendingPieChart;
