import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { AnimatedButton, GlassModal } from '../../components/ui';
import { useHaptic } from '../../hooks/useHaptic';
import colors from '../../theme/colors';
import { radii, spacing } from '../../theme/tokens';

export default function AlertSetup({ visible, onClose, onAdd }) {
  const [alertName, setAlertName] = useState('');
  const [alertTime, setAlertTime] = useState('09:00');
  const [alertDay, setAlertDay] = useState('');
  const [alertFreq, setAlertFreq] = useState('monthly');
  const { trigger } = useHaptic();

  const handleAdd = () => {
    if (alertName.trim()) {
      onAdd({ name: alertName.trim(), time: alertTime, day: alertDay, frequency: alertFreq });
      trigger('success');
      setAlertName('');
      setAlertDay('');
      onClose();
    }
  };

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <Text style={styles.title}>Set Up Alert</Text>
      <TextInput style={styles.input} placeholder="e.g. Credit card payment due" placeholderTextColor={colors.textTertiary} value={alertName} onChangeText={setAlertName} />
      <TextInput style={styles.input} placeholder="Time (e.g. 09:00)" placeholderTextColor={colors.textTertiary} value={alertTime} onChangeText={setAlertTime} />
      <TextInput style={styles.input} placeholder="Day (e.g. 15th)" placeholderTextColor={colors.textTertiary} value={alertDay} onChangeText={setAlertDay} />
      <Text style={styles.fieldLabel}>Frequency</Text>
      <View style={styles.freqRow}>
        {['daily', 'weekly', 'monthly'].map((f) => (
          <Pressable key={f} onPress={() => setAlertFreq(f)} style={[styles.chip, alertFreq === f ? styles.chipActive : styles.chipInactive]}>
            <Text style={[styles.chipText, alertFreq === f ? styles.chipTextActive : styles.chipTextInactive]}>{f}</Text>
          </Pressable>
        ))}
      </View>
      <AnimatedButton title="Add Alert" variant="primary" onPress={handleAdd} style={{ marginBottom: 12 }} />
      <AnimatedButton title="Cancel" variant="ghost" onPress={onClose} />
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
  freqRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radii.round, borderWidth: 1 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipInactive: { backgroundColor: 'rgba(255, 248, 230, 0.06)', borderColor: colors.glassBorder },
  chipText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  chipTextActive: { color: colors.background },
  chipTextInactive: { color: colors.textSecondary },
});
