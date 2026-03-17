import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';
import { chartConfig } from './chartTheme';

const SCREEN_W = Dimensions.get('window').width;

/**
 * Area chart with smooth fill using LineChart's areaChart mode.
 * @param {{ data: { value: number, label?: string }[], color?: string, height?: number, showDataPoints?: boolean }} props
 */
const AreaChart = ({ data = [], color = colors.primary, height = 160, showDataPoints = false }) => {
  if (!data.length) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.empty}>No data available</Text>
      </View>
    );
  }

  const chartWidth = SCREEN_W - 80;

  const formatted = data.map((d) => ({
    value: d.value ?? 0,
    label: d.label,
  }));

  return (
    <View style={styles.container}>
      <LineChart
        data={formatted}
        areaChart
        width={chartWidth}
        height={height}
        curved
        color={color}
        thickness={2}
        startFillColor={color}
        endFillColor="transparent"
        startOpacity={0.25}
        endOpacity={0}
        initialSpacing={16}
        endSpacing={16}
        noOfSections={4}
        yAxisColor={chartConfig.axisColor}
        xAxisColor={chartConfig.axisColor}
        yAxisTextStyle={{ color: chartConfig.labelColor, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: chartConfig.labelColor, fontSize: 10 }}
        rulesColor={chartConfig.gridColor}
        rulesType="solid"
        dataPointsColor={color}
        dataPointsRadius={showDataPoints ? 4 : 0}
        hideDataPoints={!showDataPoints}
        backgroundColor="transparent"
        isAnimated
        animateOnDataChange
        animationDuration={700}
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
});

export default AreaChart;
