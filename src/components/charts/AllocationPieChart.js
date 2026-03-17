import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';
import { CHART_COLORS, formatCurrency, formatPercent } from './chartTheme';

/**
 * Donut-style allocation pie chart with legend showing percentages.
 * @param {{ data: { label: string, value: number, color?: string }[], showPercentages?: boolean }} props
 */
const AllocationPieChart = ({ data = [], showPercentages = true }) => {
  if (!data.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No allocation data</Text>
      </View>
    );
  }

  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  const pieData = data.map((item, i) => ({
    value: item.value || 0,
    color: item.color || CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <View style={styles.container}>
      <PieChart
        data={pieData}
        donut
        radius={80}
        innerRadius={54}
        strokeColor={colors.background}
        strokeWidth={2}
        centerLabelComponent={() => (
          <View style={styles.center}>
            <Text style={styles.centerValue}>{formatCurrency(total)}</Text>
            <Text style={styles.centerSub}>total</Text>
          </View>
        )}
      />

      <View style={styles.legend}>
        {data.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const itemColor = item.color || CHART_COLORS[i % CHART_COLORS.length];
          return (
            <View key={i} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: itemColor }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>{item.label}</Text>
              {showPercentages && (
                <Text style={[styles.legendPct, { color: itemColor }]}>
                  {formatPercent(pct)}
                </Text>
              )}
              <Text style={styles.legendValue}>{formatCurrency(item.value)}</Text>
            </View>
          );
        })}
      </View>
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
    gap: spacing.lg,
  },
  center: {
    alignItems: 'center',
  },
  centerValue: {
    fontSize: 15,
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
  legendPct: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  legendValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  empty: {
    color: colors.textTertiary,
    fontSize: 14,
    padding: spacing.xl,
  },
});

export default AllocationPieChart;
