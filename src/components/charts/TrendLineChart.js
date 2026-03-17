import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';
import { chartConfig } from './chartTheme';

const SCREEN_W = Dimensions.get('window').width;

/**
 * Trend line chart with optional area fill and custom Y-axis prefix.
 * @param {{ data: { value: number, label?: string, dataPointText?: string }[], width?: number, height?: number, curved?: boolean, color?: string, showArea?: boolean, yAxisPrefix?: string, formatLabel?: (v: number) => string }} props
 */
const TrendLineChart = ({
  data = [],
  width,
  height = 180,
  curved = true,
  color = colors.primary,
  showArea = false,
  yAxisPrefix = '',
  formatLabel,
}) => {
  if (!data.length) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.empty}>No data available</Text>
      </View>
    );
  }

  const chartWidth = width || SCREEN_W - 80;

  const formatted = data.map((d) => ({
    value: d.value ?? 0,
    label: d.label,
    dataPointText: d.dataPointText,
  }));

  const maxVal = Math.max(...formatted.map((d) => d.value));
  const noSteps = 4;

  return (
    <View style={styles.container}>
      <LineChart
        data={formatted}
        width={chartWidth}
        height={height}
        curved={curved}
        color={color}
        thickness={2}
        areaChart={showArea}
        startFillColor={showArea ? color : 'transparent'}
        endFillColor={showArea ? 'transparent' : 'transparent'}
        startOpacity={showArea ? 0.3 : 0}
        endOpacity={0}
        initialSpacing={12}
        endSpacing={12}
        noOfSections={noSteps}
        yAxisColor={chartConfig.axisColor}
        xAxisColor={chartConfig.axisColor}
        yAxisTextStyle={{ color: chartConfig.labelColor, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: chartConfig.labelColor, fontSize: 10 }}
        rulesColor={chartConfig.gridColor}
        rulesType="solid"
        yAxisPrefix={yAxisPrefix}
        dataPointsColor={color}
        dataPointsRadius={3}
        hideDataPoints={formatted.length > 20}
        backgroundColor="transparent"
        formatYLabel={formatLabel || ((v) => `${yAxisPrefix}${Number(v).toFixed(0)}`)}
        maxValue={maxVal > 0 ? undefined : 100}
        pointerConfig={{
          pointerStripHeight: height - 20,
          pointerStripColor: chartConfig.axisColor,
          pointerStripWidth: 1,
          pointerColor: color,
          radius: 5,
          pointerLabelWidth: 80,
          pointerLabelHeight: 36,
          activatePointersOnLongPress: false,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items) => (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>
                {yAxisPrefix}{Number(items[0]?.value ?? 0).toFixed(0)}
              </Text>
            </View>
          ),
        }}
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
  empty: {
    color: colors.textTertiary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  tooltip: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  tooltipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TrendLineChart;
