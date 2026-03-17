import React, { useState } from 'react';
import { View, TextInput, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, AnimatedButton, GlassModal } from '../../components/ui';
import colors from '../../theme/colors';
import { radii, spacing } from '../../theme/tokens';

export default function BudgetTool({ visible, onClose }) {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState([{ id: '1', name: '', amount: '' }]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [difference, setDifference] = useState(null);

  const handleCalculate = () => {
    const inc = parseFloat(income) || 0;
    const expTotal = expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
    setTotalExpenses(expTotal);
    setDifference((inc - expTotal).toFixed(2));
  };

  const addExpenseRow = () => {
    setExpenses((prev) => [...prev, { id: Date.now().toString(), name: '', amount: '' }]);
  };

  const updateExpense = (id, field, value) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  return (
    <GlassModal visible={visible} onClose={onClose} fullScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Budget Tool</Text>
        <Text style={styles.fieldLabel}>Monthly Income</Text>
        <TextInput style={styles.input} placeholder="Income ($)" placeholderTextColor={colors.textTertiary} value={income} onChangeText={setIncome} keyboardType="numeric" />
        <Text style={[styles.fieldLabel, { marginTop: 4 }]}>Expenses</Text>
        {expenses.map((e) => (
          <View key={e.id} style={styles.expenseRow}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Name" placeholderTextColor={colors.textTertiary} value={e.name} onChangeText={(v) => updateExpense(e.id, 'name', v)} />
            <TextInput style={[styles.input, { width: 90 }]} placeholder="$" placeholderTextColor={colors.textTertiary} value={e.amount} onChangeText={(v) => updateExpense(e.id, 'amount', v)} keyboardType="numeric" />
          </View>
        ))}
        <Pressable onPress={addExpenseRow} style={styles.addRow}>
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.addText}>Add expense</Text>
        </Pressable>
        <AnimatedButton title="Calculate" variant="primary" onPress={handleCalculate} style={styles.actionBtn} />
        {difference !== null && (
          <GlassCard style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total expenses</Text>
              <Text style={styles.resultValue}>${totalExpenses}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Income</Text>
              <Text style={styles.resultValue}>${income}</Text>
            </View>
            <View style={[styles.resultRow, styles.resultRowDivider]}>
              <Text style={styles.resultLabelStrong}>Difference</Text>
              <Text style={[styles.resultValueStrong, { color: parseFloat(difference) >= 0 ? colors.success : colors.error }]}>${difference}</Text>
            </View>
          </GlassCard>
        )}
        <AnimatedButton title="Close" variant="ghost" onPress={onClose} style={{ marginTop: 4 }} />
      </ScrollView>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 20, letterSpacing: 0.3 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255, 248, 230, 0.06)', borderWidth: 1, borderColor: colors.glassBorder,
    borderRadius: radii.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 16, color: colors.text, marginBottom: 12,
  },
  expenseRow: { flexDirection: 'row' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  addText: { fontSize: 15, color: colors.primary, fontWeight: '500' },
  actionBtn: { marginBottom: 12 },
  resultCard: { marginBottom: 12, marginTop: 4 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  resultRowDivider: { borderTopWidth: 1, borderTopColor: colors.glassBorder, marginTop: 6, paddingTop: 10 },
  resultLabel: { fontSize: 14, color: colors.textSecondary },
  resultLabelStrong: { fontWeight: '700', color: colors.text, fontSize: 16 },
  resultValue: { fontSize: 16, fontWeight: '600', color: colors.primary },
  resultValueStrong: { fontSize: 16, fontWeight: '700' },
});
