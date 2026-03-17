import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import colors from '../../theme/colors';
import { spacing, radii } from '../../theme/tokens';
import { chartConfig } from './chartTheme';

/**
 * Compact bar chart for dashboard summaries.
 * @param {{ data: { value: number, label: string, frontColor?: string }[], height?: number, barWidth?: number, showLabels?: boolean }} props
 */
const MiniBarChart = ({ data = [], height = 120, barWidth = 20, showLabels = true }) => {
  if (!data.length) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.empty}>No data</Text>
      </View>
    );
  }

  const formatted = data.map((d) => ({
    value: d.value ?? 0,
    label: d.label,
    frontColor: d.frontColor || colors.primary,
    topLabelComponent: () => null,
  }));

  return (
    <View style={styles.container}>
      <BarChart
        data={formatted}
        height={height}
        barWidth={barWidth}
        spacing={barWidth * 0.6}
        noOfSections={3}
        yAxisColor="transparent"
        xAxisColor={chartConfig.axisColor}
        yAxisTextStyle={{ color: chartConfig.labelColor, fontSize: 9 }}
        xAxisLabelTextStyle={{
          color: showLabels ? chartConfig.labelColor : 'transparent',
          fontSize: 9,
        }}
        hideRules
        isAnimated
        animationDuration={600}
        backgroundColor="transparent"
        roundedTop
        disablePress
        initialSpacing={barWidth * 0.4}
        endSpacing={barWidth * 0.4}
        hideYAxisText
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  empty: {
    color: colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: spacing.lg,
  },
});

export default MiniBarChart;
