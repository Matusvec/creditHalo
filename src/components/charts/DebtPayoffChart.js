import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';
import { chartConfig, CHART_COLORS, formatCurrency } from './chartTheme';

const SCREEN_W = Dimensions.get('window').width;
const AVALANCHE_COLOR = CHART_COLORS[1]; // '#4FC3F7'

/**
 * Dual-line chart comparing snowball vs avalanche debt payoff methods.
 * @param {{ snowballData: { value: number, label: string }[], avalancheData: { value: number, label: string }[], height?: number }} props
 */
const DebtPayoffChart = ({ snowballData = [], avalancheData = [], height = 200 }) => {
  const hasData = snowballData.length > 0 || avalancheData.length > 0;

  if (!hasData) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.empty}>No payoff data available</Text>
      </View>
    );
  }

  const chartWidth = SCREEN_W - 80;

  const snowball = snowballData.map((d) => ({ value: d.value ?? 0, label: d.label }));
  const avalanche = avalancheData.map((d) => ({ value: d.value ?? 0, label: d.label }));

  const allValues = [...snowball, ...avalanche].map((d) => d.value);
  const maxVal = Math.max(...allValues, 1);

  return (
    <View style={styles.container}>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Snowball</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: AVALANCHE_COLOR }]} />
          <Text style={styles.legendText}>Avalanche</Text>
        </View>
      </View>

      <LineChart
        data={snowball.length ? snowball : [{ value: 0 }]}
        data2={avalanche.length ? avalanche : [{ value: 0 }]}
        width={chartWidth}
        height={height}
        curved
        color1={colors.primary}
        color2={AVALANCHE_COLOR}
        thickness={2}
        thickness2={2}
        initialSpacing={12}
        endSpacing={12}
        noOfSections={4}
        maxValue={maxVal * 1.05}
        yAxisColor={chartConfig.axisColor}
        xAxisColor={chartConfig.axisColor}
        yAxisTextStyle={{ color: chartConfig.labelColor, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: chartConfig.labelColor, fontSize: 10 }}
        rulesColor={chartConfig.gridColor}
        rulesType="solid"
        dataPointsColor1={colors.primary}
        dataPointsColor2={AVALANCHE_COLOR}
        dataPointsRadius={3}
        hideDataPoints={snowball.length > 20}
        backgroundColor="transparent"
        formatYLabel={(v) => formatCurrency(Number(v))}
        isAnimated
        animationDuration={800}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS_BG,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: spacing.md,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: radii.round,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  empty: {
    color: colors.textTertiary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default DebtPayoffChart;
