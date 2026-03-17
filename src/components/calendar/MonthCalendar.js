import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, addMonths, subMonths } from 'date-fns';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Monthly calendar grid showing bill dots on due dates.
 * @param {{ currentMonth: Date, bills: Array, onDayPress: (date: Date, bills: Array) => void, onMonthChange: (date: Date) => void }} props
 */
const MonthCalendar = ({ currentMonth = new Date(), bills = [], onDayPress, onMonthChange }) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Prefix empty cells for the weekday offset
  const startOffset = getDay(monthStart);
  const cells = [...Array(startOffset).fill(null), ...days];

  // Build a map of date string -> bills for O(1) lookup
  const billMap = useMemo(() => {
    const map = {};
    for (const bill of bills) {
      if (!bill.dueDate) continue;
      const key = bill.dueDate.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(bill);
    }
    return map;
  }, [bills]);

  const handlePrev = () => onMonthChange?.(subMonths(currentMonth, 1));
  const handleNext = () => onMonthChange?.(addMonths(currentMonth, 1));

  return (
    <View style={styles.container}>
      {/* Month header */}
      <View style={styles.header}>
        <Pressable onPress={handlePrev} style={styles.navBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </Pressable>
        <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <Pressable onPress={handleNext} style={styles.navBtn} hitSlop={8}>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Day labels */}
      <View style={styles.dayLabels}>
        {DAY_LABELS.map((d) => (
          <Text key={d} style={styles.dayLabel}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (!day) {
            return <View key={`empty-${idx}`} style={styles.cell} />;
          }

          const dateKey = format(day, 'yyyy-MM-dd');
          const dayBills = billMap[dateKey] || [];
          const hasUnpaid = dayBills.some((b) => !b.isPaid);
          const hasPaid = dayBills.some((b) => b.isPaid);
          const isCurrentDay = isToday(day);
          const inMonth = isSameMonth(day, currentMonth);

          return (
            <Pressable
              key={dateKey}
              style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
              onPress={() => dayBills.length > 0 ? onDayPress?.(day, dayBills) : null}
            >
              <View style={[styles.dayCircle, isCurrentDay && styles.todayCircle]}>
                <Text style={[
                  styles.dayNum,
                  !inMonth && styles.dayNumFaded,
                  isCurrentDay && styles.todayNum,
                ]}>
                  {format(day, 'd')}
                </Text>
              </View>

              {/* Bill dots */}
              {(hasUnpaid || hasPaid) && (
                <View style={styles.dotsRow}>
                  {hasUnpaid && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
                  {hasPaid && <View style={[styles.dot, { backgroundColor: colors.success }]} />}
                </View>
              )}
            </Pressable>
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
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  navBtn: {
    padding: spacing.xs,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dayLabels: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '500',
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.285%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  cellPressed: {
    opacity: 0.7,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    backgroundColor: `${colors.primary}30`,
  },
  dayNum: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  dayNumFaded: {
    color: colors.textTertiary,
    opacity: 0.4,
  },
  todayNum: {
    color: colors.primary,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default MonthCalendar;
