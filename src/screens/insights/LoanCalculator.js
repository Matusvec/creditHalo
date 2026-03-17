import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { GlassCard, AnimatedButton, GlassModal } from '../../components/ui';
import colors from '../../theme/colors';
import { radii, spacing } from '../../theme/tokens';

export default function LoanCalculator({ visible, onClose }) {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [totalInterest, setTotalInterest] = useState(null);

  const handleCalculate = () => {
    const P = parseFloat(loanAmount) || 0;
    const r = (parseFloat(interestRate) || 0) / 100 / 12;
    const n = (parseFloat(loanTerm) || 0) * 12;
    if (P > 0 && n > 0) {
      const M = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
      setMonthlyPayment(M.toFixed(2));
      setTotalInterest(((M * n) - P).toFixed(2));
    }
  };

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <Text style={styles.title}>Loan Calculator</Text>
      <TextInput style={styles.input} placeholder="Loan amount ($)" placeholderTextColor={colors.textTertiary} value={loanAmount} onChangeText={setLoanAmount} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Interest rate (%)" placeholderTextColor={colors.textTertiary} value={interestRate} onChangeText={setInterestRate} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Term (years)" placeholderTextColor={colors.textTertiary} value={loanTerm} onChangeText={setLoanTerm} keyboardType="numeric" />
      <AnimatedButton title="Calculate" variant="primary" onPress={handleCalculate} style={styles.actionBtn} />
      {monthlyPayment !== null && (
        <GlassCard style={styles.resultCard}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Monthly payment</Text>
            <Text style={styles.resultValue}>${monthlyPayment}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total interest</Text>
            <Text style={styles.resultValue}>${totalInterest}</Text>
          </View>
        </GlassCard>
      )}
      <AnimatedButton title="Close" variant="ghost" onPress={onClose} />
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 20, letterSpacing: 0.3 },
  input: {
    backgroundColor: 'rgba(255, 248, 230, 0.06)', borderWidth: 1, borderColor: colors.glassBorder,
    borderRadius: radii.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 16, color: colors.text, marginBottom: 12,
  },
  actionBtn: { marginBottom: 12 },
  resultCard: { marginBottom: 12, marginTop: 4 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  resultLabel: { fontSize: 14, color: colors.textSecondary },
  resultValue: { fontSize: 16, fontWeight: '600', color: colors.primary },
});
