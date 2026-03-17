import React, { useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable, Platform,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { useStore } from '../store/useStore';
import { generateTransactions, getSpendingByCategory, getIncomeVsExpenses, detectAnomalies } from '../services/mockTransactions';
import { MOCK_ACCOUNTS, MOCK_HOLDINGS, getNetWorth, getNetWorthHistory } from '../services/mockAccounts';
import { GradientBackground, GlassCard } from '../components/ui';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { useHaptic } from '../hooks/useHaptic';
import ScoreRing from '../components/charts/ScoreRing';
import MiniBarChart from '../components/charts/MiniBarChart';
import QuickStatCard from '../components/dashboard/QuickStatCard';
import TransactionRow from '../components/dashboard/TransactionRow';
import InsightCard from '../components/dashboard/InsightCard';
import SmartGoalCard from '../components/goals/SmartGoalCard';
import colors from '../theme/colors';
import { spacing, radii, shadows, GLASS_BG, GLASS_BORDER } from '../theme/tokens';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Dashboard — the financial command center. Main home tab.
 */
export default function DashboardScreen({ navigation }) {
  const {
    user, transactions, transactionsGenerated, setTransactions,
    accounts, setAccounts, setHoldings, setNetWorthHistory,
    healthScore, calculateHealthScore, goals,
  } = useStore();

  const { trigger } = useHaptic();

  // Entrance animation delays
  const headerAnim = useEntranceAnimation(0);
  const scoreAnim = useEntranceAnimation(80);
  const statsAnim = useEntranceAnimation(140);
  const snapshotAnim = useEntranceAnimation(200);
  const alertsAnim = useEntranceAnimation(260);
  const goalsAnim = useEntranceAnimation(320);
  const txAnim = useEntranceAnimation(380);
  const aiAnim = useEntranceAnimation(440);

  useEffect(() => {
    if (!transactionsGenerated) {
      setTransactions(generateTransactions(6));
    }
    if (!accounts.length) {
      setAccounts(MOCK_ACCOUNTS);
      setHoldings(MOCK_HOLDINGS);
      setNetWorthHistory(getNetWorthHistory(12));
    }
    calculateHealthScore();
  }, []);

  // Derived data
  const spendingByCategory = useMemo(() => {
    if (!transactions.length) return [];
    return getSpendingByCategory(transactions, 0).slice(0, 5);
  }, [transactions]);

  const incomeVsExpenses = useMemo(() => {
    if (!transactions.length) return null;
    const data = getIncomeVsExpenses(transactions, 1);
    return data[0] || null;
  }, [transactions]);

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions],
  );

  const anomalies = useMemo(() => {
    if (!transactions.length) return [];
    return detectAnomalies(transactions).slice(0, 1);
  }, [transactions]);

  const topGoal = useMemo(() => {
    const active = (goals || []).filter((g) => g && !g.completed);
    return active[0] || null;
  }, [goals]);

  // Formatted values
  const netWorth = getNetWorth();
  const netWorthFormatted = netWorth >= 0 ? `$${Math.round(netWorth).toLocaleString()}` : `-$${Math.round(Math.abs(netWorth)).toLocaleString()}`;
  const monthlySpending = incomeVsExpenses ? `$${Math.round(incomeVsExpenses.expenses).toLocaleString()}` : '—';
  const savingsRate = incomeVsExpenses ? `${incomeVsExpenses.savingsRate}%` : '—';

  const chartData = spendingByCategory.map((c) => ({
    value: c.amount,
    label: c.category.substring(0, 4),
  }));

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerAnim]}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.name}>{firstName}</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                style={styles.iconBtn}
                onPress={() => { trigger('light'); navigation.navigate('Achievements'); }}
              >
                <Ionicons name="trophy-outline" size={22} color={colors.primary} />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                onPress={() => { trigger('light'); navigation.navigate('Settings'); }}
              >
                <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Health Score Ring */}
          <Animated.View style={scoreAnim}>
            <Pressable
              onPress={() => { trigger('light'); navigation.navigate('HealthScore'); }}
              style={({ pressed }) => [styles.scoreCard, pressed && { opacity: 0.85 }]}
            >
              <GlassCard style={styles.scoreInner}>
                <View style={styles.scoreRow}>
                  <ScoreRing score={healthScore} maxScore={100} size={140} label="Health Score" />
                  <View style={styles.scoreInfo}>
                    <Text style={styles.scoreTitle}>Financial Health</Text>
                    <Text style={styles.scoreSubtitle}>
                      {healthScore >= 70 ? 'Excellent — keep it up!' : healthScore >= 50 ? 'Good — room to grow' : 'Needs attention'}
                    </Text>
                    <Pressable
                      style={styles.viewDetailBtn}
                      onPress={() => { trigger('light'); navigation.navigate('HealthScore'); }}
                    >
                      <Text style={styles.viewDetailText}>View Breakdown</Text>
                      <Ionicons name="chevron-forward" size={13} color={colors.primary} />
                    </Pressable>
                  </View>
                </View>
              </GlassCard>
            </Pressable>
          </Animated.View>

          {/* Quick Stats */}
          <Animated.View style={[styles.statsRow, statsAnim]}>
            <QuickStatCard label="Net Worth" value={netWorthFormatted} icon="trending-up" trendDirection="up" />
            <QuickStatCard label="Monthly Spend" value={monthlySpending} icon="cart-outline" />
            <QuickStatCard label="Savings Rate" value={savingsRate} icon="save-outline" trendDirection={incomeVsExpenses?.savingsRate > 10 ? 'up' : 'down'} />
          </Animated.View>

          {/* Spending Snapshot */}
          <Animated.View style={snapshotAnim}>
            <GlassCard>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Spending Snapshot</Text>
                <Pressable onPress={() => trigger('light')}>
                  <Text style={styles.sectionLink}>View all →</Text>
                </Pressable>
              </View>
              {chartData.length > 0 ? (
                <>
                  <MiniBarChart data={chartData} height={120} barWidth={28} />
                  <View style={styles.legendRow}>
                    {spendingByCategory.slice(0, 3).map((c) => (
                      <View key={c.category} style={styles.legendItem}>
                        <Text style={styles.legendLabel} numberOfLines={1}>{c.category}</Text>
                        <Text style={styles.legendValue}>${Math.round(c.amount)}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.emptyText}>Loading transactions...</Text>
              )}
            </GlassCard>
          </Animated.View>

          {/* Active Alerts */}
          {anomalies.length > 0 && (
            <Animated.View style={alertsAnim}>
              <Text style={styles.sectionLabel}>Active Alerts</Text>
              {anomalies.map((a, i) => (
                <InsightCard
                  key={i}
                  icon={a.percentChange > 0 ? 'trending-up' : 'trending-down'}
                  title={`${a.category} Spending Alert`}
                  message={a.message}
                  actionLabel="See transactions"
                  onAction={() => trigger('light')}
                />
              ))}
            </Animated.View>
          )}

          {/* Goal Progress */}
          <Animated.View style={goalsAnim}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Goal Progress</Text>
              <Pressable onPress={() => { trigger('light'); navigation.navigate('GoalsTab'); }}>
                <Text style={styles.sectionLink}>See all goals →</Text>
              </Pressable>
            </View>
            {topGoal ? (
              <SmartGoalCard
                goal={topGoal}
                onComplete={() => {}}
                onPress={() => { trigger('light'); navigation.navigate('GoalsTab'); }}
              />
            ) : (
              <GlassCard>
                <Text style={styles.emptyText}>Set your first financial goal to track progress here.</Text>
              </GlassCard>
            )}
          </Animated.View>

          {/* Recent Transactions */}
          <Animated.View style={txAnim}>
            <GlassCard>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <Pressable onPress={() => trigger('light')}>
                  <Text style={styles.sectionLink}>See all →</Text>
                </Pressable>
              </View>
              {recentTransactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
              {recentTransactions.length === 0 && (
                <Text style={styles.emptyText}>No transactions yet.</Text>
              )}
            </GlassCard>
          </Animated.View>

          {/* AI Insight */}
          {anomalies.length === 0 && (
            <Animated.View style={aiAnim}>
              <InsightCard
                icon="sparkles"
                title="AI Financial Tip"
                message="Your savings rate is on track! Consider increasing your emergency fund by $200/month to reach 6 months of expenses."
                actionLabel="Ask AI for advice"
                onAction={() => { trigger('medium'); navigation.navigate('Chatbot'); }}
              />
            </Animated.View>
          )}
        </ScrollView>

        {/* Floating AI Chat Button */}
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.94 }] }]}
          onPress={() => { trigger('medium'); navigation.navigate('Chatbot'); }}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={60} tint="dark" style={styles.fabBlur}>
              <Ionicons name="chatbubble-ellipses" size={22} color={colors.primary} />
            </BlurView>
          ) : (
            <View style={[styles.fabBlur, styles.fabAndroid]}>
              <Ionicons name="chatbubble-ellipses" size={22} color={colors.primary} />
            </View>
          )}
        </Pressable>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
  },
  headerLeft: {},
  greeting: { fontSize: 14, color: colors.textTertiary, marginBottom: 2 },
  name: { fontSize: 32, fontWeight: '700', color: colors.text, letterSpacing: 0.3 },
  headerActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.round,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreCard: { marginBottom: 12 },
  scoreInner: { marginBottom: 0 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  scoreInfo: { flex: 1 },
  scoreTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  scoreSubtitle: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.sm },
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  viewDetailText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  sectionLink: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  legendItem: { alignItems: 'center', flex: 1 },
  legendLabel: { fontSize: 10, color: colors.textTertiary, marginBottom: 2 },
  legendValue: { fontSize: 13, fontWeight: '600', color: colors.text },

  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.sm },

  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    zIndex: 50,
    ...shadows.goldGlow,
  },
  fabBlur: {
    width: 56,
    height: 56,
    borderRadius: radii.round,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  fabAndroid: { backgroundColor: '#1E1B16' },
});
