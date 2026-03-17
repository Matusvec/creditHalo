import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

/**
 * Small colored dot used to mark bill due dates on the calendar.
 * Green = paid, gold = upcoming, red = overdue.
 * @param {{ color?: string, size?: number }} props
 */
const BillDot = ({ color = colors.primary, size = 6 }) => (
  <View
    style={[
      styles.dot,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      },
    ]}
  />
);

const styles = StyleSheet.create({
  dot: {
    flexShrink: 0,
  },
});

export default BillDot;
