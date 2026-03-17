import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { getAccountAnalysis, openPlaidLink } from '../services/plaid';
import { GradientBackground, GlassCard, AnimatedButton, GlassModal } from '../components/ui';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { useHaptic } from '../hooks/useHaptic';
import colors from '../theme/colors';
import { radii } from '../theme/tokens';

import LoanCalculator from './insights/LoanCalculator';
import BudgetTool from './insights/BudgetTool';
import AlertSetup from './insights/AlertSetup';

function ActionCard({ iconName, title, subtitle, onPress }) {
  const { trigger } = useHaptic();
  return (
    <Pressable onPress={() => { trigger('light'); onPress?.(); }} style={({ pressed }) => [pressed && { opacity: 0.72 }]}>
      <GlassCard style={styles.actionCard}>
        <View style={styles.goldAccent} />
        <View style={styles.actionIconWrap}>
          <Ionicons name={iconName} size={22} color={colors.primary} />
        </View>
        <View style={styles.actionTextWrap}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </GlassCard>
    </Pressable>
  );
}

export default function InsightsScreen() {
  const { bankLinked, setBankLinked, addAlert, alerts, removeAlert, persist } = useStore();
  const { trigger } = useHaptic();

  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [loanVisible, setLoanVisible] = useState(false);
  const [budgetVisible, setBudgetVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const headerAnim = useEntranceAnimation(0);
  const introAnim = useEntranceAnimation(100);
  const btnAnim = useEntranceAnimation(200);
  const sectionAnim = useEntranceAnimation(300);
  const alertsAnim = useEntranceAnimation(450);

  const handleRequestAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisVisible(true);
    const results = await getAccountAnalysis();
    setAnalysisResults(results);
    setAnalysisLoading(false);
  };

  const handleLinkBank = async () => {
    await openPlaidLink(() => { setBankLinked(true); persist(); }, () => {});
  };

  const handleAddAlert = (alert) => {
    addAlert(alert);
    persist();
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={headerAnim}>
            <Text style={styles.screenTitle}>Insights</Text>
            <Text style={styles.screenSubtitle}>Your financial command center</Text>
          </Animated.View>

          <Animated.View style={introAnim}>
            <GlassCard style={styles.introCard}>
              <View style={styles.introRow}>
                <Ionicons name="sparkles" size={20} color={colors.primary} style={{ marginRight: 10, marginTop: 1 }} />
                <Text style={styles.introText}>Credit Halo analyzes your bank history to improve your financial habits and boost your score.</Text>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View style={btnAnim}>
            <AnimatedButton title="Request Credit Halo Analysis" variant="primary" onPress={handleRequestAnalysis} style={{ marginBottom: 28 }} />
          </Animated.View>

          <Animated.View style={sectionAnim}>
            <Text style={styles.sectionLabel}>Quick Actions</Text>
            <ActionCard iconName="business-outline" title="Bank Account Check" subtitle={bankLinked ? 'Account linked' : 'Link or verify your bank'} onPress={handleLinkBank} />
            <ActionCard iconName="calculator-outline" title="Loan Calculator" subtitle="Calculate monthly payments" onPress={() => setLoanVisible(true)} />
            <ActionCard iconName="wallet-outline" title="Budgeting Tool" subtitle="Income vs expenses" onPress={() => setBudgetVisible(true)} />
            <ActionCard iconName="notifications-outline" title="Set Up Alerts" subtitle="Payment reminders, bills due" onPress={() => setAlertVisible(true)} />
          </Animated.View>

          {alerts.length > 0 && (
            <Animated.View style={alertsAnim}>
              <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Your Alerts</Text>
              {alerts.filter((a) => a && a.id).map((a) => (
                <GlassCard key={a.id} style={styles.alertCard}>
                  <View style={styles.goldAccent} />
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertName}>{a.name ?? ''}</Text>
                    <Text style={styles.alertMeta}>{a.frequency} · {a.time}{a.day ? ` · ${a.day}` : ''}</Text>
                  </View>
                  <Pressable onPress={() => { trigger('light'); removeAlert(a.id); persist(); }} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </Pressable>
                </GlassCard>
              ))}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Analysis Modal */}
      <GlassModal visible={analysisVisible} onClose={() => setAnalysisVisible(false)}>
        <Text style={styles.modalTitle}>Your Analysis</Text>
        {analysisLoading ? (
          <Text style={styles.loadingText}>Analyzing your financial data…</Text>
        ) : (
          <ScrollView style={{ maxHeight: 280, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
            {analysisResults.map((r, i) => (
              <View key={i} style={styles.analysisRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} style={{ marginTop: 2 }} />
                <Text style={styles.analysisItem}>{r}</Text>
              </View>
            ))}
          </ScrollView>
        )}
        <AnimatedButton title="Close" variant="secondary" onPress={() => setAnalysisVisible(false)} />
      </GlassModal>

      <LoanCalculator visible={loanVisible} onClose={() => setLoanVisible(false)} />
      <BudgetTool visible={budgetVisible} onClose={() => setBudgetVisible(false)} />
      <AlertSetup visible={alertVisible} onClose={() => setAlertVisible(false)} onAdd={handleAddAlert} />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  screenTitle: { fontSize: 32, fontWeight: '700', color: colors.text, letterSpacing: 0.35, marginBottom: 4 },
  screenSubtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: 20 },
  introCard: { marginBottom: 16 },
  introRow: { flexDirection: 'row', alignItems: 'flex-start' },
  introText: { flex: 1, fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  actionCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, overflow: 'hidden' },
  goldAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: colors.primary, borderTopLeftRadius: radii.lg, borderBottomLeftRadius: radii.lg },
  actionIconWrap: { width: 38, height: 38, borderRadius: radii.sm, backgroundColor: 'rgba(212,168,67,0.12)', alignItems: 'center', justifyContent: 'center', marginLeft: 10, marginRight: 14 },
  actionTextWrap: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 },
  actionSubtitle: { fontSize: 13, color: colors.textSecondary },
  alertCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, overflow: 'hidden' },
  alertInfo: { flex: 1, marginLeft: 14 },
  alertName: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2 },
  alertMeta: { fontSize: 13, color: colors.textSecondary },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 20, letterSpacing: 0.3 },
  loadingText: { fontSize: 15, color: colors.textSecondary, marginBottom: 20, textAlign: 'center' },
  analysisRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 8 },
  analysisItem: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
});
