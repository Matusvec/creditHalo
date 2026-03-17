import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, isAfter, isBefore, isSameMonth, parseISO, startOfDay } from 'date-fns';

import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';
import { useStore } from '../../store/useStore';
import { detectRecurringCharges } from '../../services/mockTransactions';
import { GradientBackground, GlassCard, AnimatedButton, GlassModal } from '../../components/ui';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { useHaptic } from '../../hooks/useHaptic';
import MonthCalendar from '../../components/calendar/MonthCalendar';

const CATEGORIES = ['Utilities', 'Subscriptions', 'Rent', 'Insurance', 'Loan', 'Other'];

/** Status icon for a bill based on due date and paid status */
function BillStatusIcon({ bill }) {
  const today = startOfDay(new Date());
  const due = bill.dueDate ? startOfDay(parseISO(bill.dueDate)) : null;

  if (bill.isPaid) {
    return <Ionicons name="checkmark-circle" size={20} color={colors.success} />;
  }
  if (due && isBefore(due, today)) {
    return <Ionicons name="alert-circle" size={20} color={colors.error} />;
  }
  return <Ionicons name="time-outline" size={20} color={colors.primary} />;
}

/** Upcoming bill row */
function BillRow({ bill, onMarkPaid, onRemove }) {
  const { trigger } = useHaptic();
  const today = startOfDay(new Date());
  const due = bill.dueDate ? parseISO(bill.dueDate) : null;
  const isOverdue = due && isBefore(startOfDay(due), today) && !bill.isPaid;
  const dateLabel = due ? format(due, 'MMM d') : '—';

  return (
    <View style={styles.billRow}>
      <BillStatusIcon bill={bill} />
      <View style={styles.billInfo}>
        <Text style={[styles.billName, isOverdue && { color: colors.error }]}>{bill.name}</Text>
        <Text style={styles.billMeta}>{bill.category} · Due {dateLabel}</Text>
      </View>
      <View style={styles.billActions}>
        <Text style={styles.billAmount}>${Number(bill.amount || 0).toFixed(2)}</Text>
        {!bill.isPaid && (
          <Pressable
            style={styles.payBtn}
            onPress={() => { trigger('light'); onMarkPaid(bill.id); }}
          >
            <Text style={styles.payBtnText}>Paid</Text>
          </Pressable>
        )}
        <Pressable onPress={() => { trigger('light'); onRemove(bill.id); }} hitSlop={8}>
          <Ionicons name="trash-outline" size={14} color={colors.textTertiary} />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * BillCalendarScreen — monthly bill calendar with add/pay/remove functionality.
 */
export default function BillCalendarScreen() {
  const {
    bills,
    addBill,
    markBillPaid,
    removeBill,
    transactions,
    persist,
  } = useStore();

  const { trigger } = useHaptic();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addBillVisible, setAddBillVisible] = useState(false);
  const [selectedDayBills, setSelectedDayBills] = useState([]);
  const [dayDetailVisible, setDayDetailVisible] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDueDate, setFormDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formCategory, setFormCategory] = useState('Other');
  const [formRecurring, setFormRecurring] = useState(false);

  const headerAnim = useEntranceAnimation(0);
  const calendarAnim = useEntranceAnimation(100);
  const upcomingAnim = useEntranceAnimation(200);
  const summaryAnim = useEntranceAnimation(300);

  // Auto-populate bills from recurring transactions on first load
  useEffect(() => {
    if (!bills.length && transactions.length) {
      try {
        const recurring = detectRecurringCharges(transactions);
        recurring.forEach((r) => {
          addBill({
            name: r.merchant,
            amount: Math.abs(r.amount),
            dueDate: r.lastDate,
            category: r.category || 'Other',
            isPaid: false,
            isRecurring: true,
          });
        });
        persist();
      } catch (e) {
        console.warn('Failed to populate bills from transactions:', e);
      }
    }
  }, [transactions]);

  // Bills in current month
  const monthBills = useMemo(() => {
    return bills.filter((b) => {
      if (!b.dueDate) return false;
      try {
        return isSameMonth(parseISO(b.dueDate), currentMonth);
      } catch {
        return false;
      }
    });
  }, [bills, currentMonth]);

  // Upcoming bills: next 7 days from today
  const upcomingBills = useMemo(() => {
    const today = startOfDay(new Date());
    const horizon = addDays(today, 7);
    return bills
      .filter((b) => {
        if (!b.dueDate) return false;
        try {
          const due = startOfDay(parseISO(b.dueDate));
          return !isBefore(due, today) && !isAfter(due, horizon);
        } catch {
          return false;
        }
      })
      .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));
  }, [bills]);

  // Monthly summary
  const totalMonthlyBills = monthBills.reduce((s, b) => s + Number(b.amount || 0), 0);
  const paidBills = monthBills.filter((b) => b.isPaid);
  const unpaidBills = monthBills.filter((b) => !b.isPaid);

  const handleMarkPaid = (id) => {
    markBillPaid(id);
    persist();
  };

  const handleRemove = (id) => {
    removeBill(id);
    persist();
  };

  const handleAddBill = () => {
    if (!formName.trim() || !formAmount) return;
    try {
      addBill({
        name: formName.trim(),
        amount: parseFloat(formAmount),
        dueDate: formDueDate,
        category: formCategory,
        isPaid: false,
        isRecurring: formRecurring,
      });
      persist();
      setAddBillVisible(false);
      setFormName('');
      setFormAmount('');
      setFormDueDate(format(new Date(), 'yyyy-MM-dd'));
      setFormCategory('Other');
      setFormRecurring(false);
      trigger('success');
    } catch (e) {
      console.warn('Failed to add bill:', e);
    }
  };

  const handleDayPress = (day, dayBills) => {
    trigger('light');
    setSelectedDayBills(dayBills);
    setDayDetailVisible(true);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={headerAnim}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Bill Calendar</Text>
                <Text style={styles.subtitle}>Track and manage your bills</Text>
              </View>
              <Pressable
                style={styles.addFab}
                onPress={() => { trigger('light'); setAddBillVisible(true); }}
              >
                <Ionicons name="add" size={22} color={colors.background} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Monthly Summary */}
          <Animated.View style={summaryAnim}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>${totalMonthlyBills.toFixed(0)}</Text>
                <Text style={styles.summaryLabel}>This Month</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.success }]}>{paidBills.length}</Text>
                <Text style={styles.summaryLabel}>Paid</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.error }]}>{unpaidBills.length}</Text>
                <Text style={styles.summaryLabel}>Unpaid</Text>
              </View>
            </View>
          </Animated.View>

          {/* Calendar */}
          <Animated.View style={calendarAnim}>
            <MonthCalendar
              currentMonth={currentMonth}
              bills={bills}
              onDayPress={handleDayPress}
              onMonthChange={setCurrentMonth}
            />
          </Animated.View>

          {/* Upcoming Bills */}
          <Animated.View style={upcomingAnim}>
            <Text style={styles.sectionTitle}>Next 7 Days</Text>
            {upcomingBills.length === 0 ? (
              <GlassCard>
                <Text style={styles.emptyText}>No bills due in the next 7 days</Text>
              </GlassCard>
            ) : (
              <GlassCard style={{ paddingHorizontal: 0 }}>
                {upcomingBills.map((bill, idx) => (
                  <View key={bill.id}>
                    <BillRow
                      bill={bill}
                      onMarkPaid={handleMarkPaid}
                      onRemove={handleRemove}
                    />
                    {idx < upcomingBills.length - 1 && <View style={styles.rowDivider} />}
                  </View>
                ))}
              </GlassCard>
            )}

            {/* All unpaid this month */}
            {unpaidBills.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Unpaid This Month</Text>
                <GlassCard style={{ paddingHorizontal: 0 }}>
                  {unpaidBills.map((bill, idx) => (
                    <View key={bill.id}>
                      <BillRow
                        bill={bill}
                        onMarkPaid={handleMarkPaid}
                        onRemove={handleRemove}
                      />
                      {idx < unpaidBills.length - 1 && <View style={styles.rowDivider} />}
                    </View>
                  ))}
                </GlassCard>
              </>
            )}
          </Animated.View>
        </ScrollView>

        {/* Day Detail Modal */}
        <GlassModal visible={dayDetailVisible} onClose={() => setDayDetailVisible(false)}>
          <Text style={styles.modalTitle}>Bills Due</Text>
          {selectedDayBills.map((bill) => (
            <View key={bill.id} style={styles.modalBillRow}>
              <BillStatusIcon bill={bill} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.billName}>{bill.name}</Text>
                <Text style={styles.billMeta}>{bill.category}</Text>
              </View>
              <Text style={styles.billAmount}>${Number(bill.amount || 0).toFixed(2)}</Text>
            </View>
          ))}
          <AnimatedButton
            title="Close"
            variant="secondary"
            onPress={() => setDayDetailVisible(false)}
            style={{ marginTop: spacing.md }}
          />
        </GlassModal>

        {/* Add Bill Modal */}
        <GlassModal visible={addBillVisible} onClose={() => setAddBillVisible(false)}>
          <Text style={styles.modalTitle}>Add Bill</Text>

          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={formName}
            onChangeText={setFormName}
            placeholder="e.g. Electric Co"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.inputLabel}>Amount ($)</Text>
          <TextInput
            style={styles.input}
            value={formAmount}
            onChangeText={setFormAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
          />

          <Text style={styles.inputLabel}>Due Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={formDueDate}
            onChangeText={setFormDueDate}
            placeholder="2026-04-01"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.inputLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.categoryChip, formCategory === cat && styles.categoryChipActive]}
                  onPress={() => { trigger('light'); setFormCategory(cat); }}
                >
                  <Text style={[styles.categoryChipText, formCategory === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.toggleRow}>
            <Text style={styles.inputLabel}>Recurring</Text>
            <Switch
              value={formRecurring}
              onValueChange={setFormRecurring}
              trackColor={{ false: GLASS_BORDER, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          <AnimatedButton
            title="Save Bill"
            onPress={handleAddBill}
            disabled={!formName.trim() || !formAmount}
            style={{ marginTop: spacing.md }}
          />
        </GlassModal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  addFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: GLASS_BG,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: GLASS_BORDER,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  rowDivider: {
    height: 1,
    backgroundColor: GLASS_BORDER,
    marginHorizontal: spacing.md,
  },
  billInfo: {
    flex: 1,
    gap: 2,
  },
  billName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  billMeta: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  billActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  payBtn: {
    backgroundColor: `${colors.success}22`,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: `${colors.success}40`,
  },
  payBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalBillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 248, 230, 0.06)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  categoryChipActive: {
    backgroundColor: `${colors.primary}22`,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  categoryChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
});
