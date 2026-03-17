import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';
import { useStore } from '../../store/useStore';
import {
  MOCK_ACCOUNTS,
  MOCK_HOLDINGS,
  getNetWorth,
  getTotalDebt,
  getTotalAssets,
  getNetWorthHistory,
} from '../../services/mockAccounts';
import { GradientBackground, GlassCard, ProgressBar } from '../../components/ui';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { useHaptic } from '../../hooks/useHaptic';
import AreaChart from '../../components/charts/AreaChart';

const fmt = (n) =>
  Math.abs(n) >= 1000
    ? `$${(Math.abs(n) / 1000).toFixed(1)}k`
    : `$${Math.abs(n).toFixed(2)}`;

const fmtFull = (n) =>
  n < 0
    ? `-$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Returns utilization color based on percentage */
function utilizationColor(pct) {
  if (pct < 30) return colors.success;
  if (pct < 50) return colors.primary;
  return colors.error;
}

/** First letter badge for institution */
function InstitutionBadge({ name, color = colors.primary }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
      <Text style={[styles.badgeLetter, { color }]}>{(name || '?')[0].toUpperCase()}</Text>
    </View>
  );
}

/** Single account card */
function AccountCard({ account, onPress }) {
  const { trigger } = useHaptic();

  const isCreditOrLoan = account.type === 'credit' || account.type === 'loan';
  const balance = account.balance;
  const displayBalance = isCreditOrLoan ? fmtFull(Math.abs(balance)) : fmtFull(balance);
  const balanceColor = isCreditOrLoan ? colors.error : colors.success;

  let utilizationPct = null;
  let progress = null;
  if (account.type === 'credit' && account.limit) {
    utilizationPct = Math.round((Math.abs(balance) / account.limit) * 100);
    progress = Math.abs(balance) / account.limit;
  } else if (account.type === 'loan' && account.originalBalance) {
    const paid = Math.abs(account.originalBalance) - Math.abs(balance);
    progress = paid / Math.abs(account.originalBalance);
  }

  return (
    <Pressable
      onPress={() => { trigger('light'); onPress?.(); }}
      style={({ pressed }) => [pressed && { opacity: 0.8 }]}
    >
      <GlassCard style={styles.accountCard}>
        <View style={styles.accountRow}>
          <InstitutionBadge name={account.institution || account.name} />
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountMeta}>
              {account.institution}
              {account.lastFour ? ` ····${account.lastFour}` : ''}
            </Text>
          </View>
          <Text style={[styles.accountBalance, { color: balanceColor }]}>{displayBalance}</Text>
        </View>

        {/* Credit utilization bar */}
        {account.type === 'credit' && account.limit && (
          <View style={styles.utilizationWrap}>
            <View style={styles.utilizationLabel}>
              <Text style={styles.utilizationText}>
                Utilization: {utilizationPct}%
              </Text>
              <Text style={[styles.utilizationPct, { color: utilizationColor(utilizationPct) }]}>
                / ${account.limit.toLocaleString()} limit
              </Text>
            </View>
            <ProgressBar
              progress={progress}
              height={6}
              style={{ marginTop: spacing.xs }}
            />
          </View>
        )}

        {/* Loan payoff progress */}
        {account.type === 'loan' && account.originalBalance && (
          <View style={styles.utilizationWrap}>
            <View style={styles.utilizationLabel}>
              <Text style={styles.utilizationText}>
                Payoff: {Math.round(progress * 100)}%
              </Text>
              <Text style={styles.utilizationPct}>
                Original: {fmtFull(Math.abs(account.originalBalance))}
              </Text>
            </View>
            <ProgressBar progress={progress} height={6} style={{ marginTop: spacing.xs }} />
          </View>
        )}
      </GlassCard>
    </Pressable>
  );
}

/** Section of accounts grouped by type */
function AccountSection({ title, accounts, icon, onAccountPress }) {
  if (!accounts.length) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={16} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{accounts.length}</Text>
      </View>
      {accounts.map((a) => (
        <AccountCard key={a.id} account={a} onPress={() => onAccountPress?.(a)} />
      ))}
    </View>
  );
}

/**
 * AccountsScreen — shows net worth overview with all linked accounts grouped by type.
 */
export default function AccountsScreen({ navigation }) {
  const { accounts, setAccounts, setHoldings, netWorthHistory, setNetWorthHistory } = useStore();
  const { trigger } = useHaptic();

  const headerAnim = useEntranceAnimation(0);
  const netWorthAnim = useEntranceAnimation(100);
  const chartAnim = useEntranceAnimation(200);
  const accountsAnim = useEntranceAnimation(300);

  useEffect(() => {
    if (!accounts.length) {
      setAccounts(MOCK_ACCOUNTS);
      setHoldings(MOCK_HOLDINGS);
      setNetWorthHistory(getNetWorthHistory(12));
    }
  }, []);

  const displayAccounts = accounts.length ? accounts : MOCK_ACCOUNTS;
  const history = netWorthHistory.length ? netWorthHistory : getNetWorthHistory(12);

  const netWorth = displayAccounts.reduce((s, a) => s + a.balance, 0);
  const totalAssets = displayAccounts.filter((a) => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalDebt = displayAccounts.filter((a) => a.balance < 0).reduce((s, a) => s + a.balance, 0);

  const banking = displayAccounts.filter((a) => a.type === 'checking' || a.type === 'savings');
  const creditCards = displayAccounts.filter((a) => a.type === 'credit');
  const loans = displayAccounts.filter((a) => a.type === 'loan');
  const investments = displayAccounts.filter((a) => a.type === 'investment' || a.type === 'retirement');

  const chartData = history.map((h) => ({
    value: h.netWorth,
    label: h.month?.slice(0, 3) || '',
  }));

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={headerAnim}>
            <Text style={styles.title}>Accounts</Text>
            <Text style={styles.subtitle}>Your complete financial picture</Text>
          </Animated.View>

          {/* Net Worth Card */}
          <Animated.View style={netWorthAnim}>
            <GlassCard style={styles.netWorthCard}>
              <Text style={styles.netWorthLabel}>Net Worth</Text>
              <Text style={styles.netWorthValue}>{fmtFull(netWorth)}</Text>
              <View style={styles.assetDebtRow}>
                <View style={styles.assetItem}>
                  <Ionicons name="trending-up" size={13} color={colors.success} />
                  <Text style={styles.assetLabel}>Assets</Text>
                  <Text style={[styles.assetValue, { color: colors.success }]}>{fmt(totalAssets)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.assetItem}>
                  <Ionicons name="trending-down" size={13} color={colors.error} />
                  <Text style={styles.assetLabel}>Debt</Text>
                  <Text style={[styles.assetValue, { color: colors.error }]}>{fmt(Math.abs(totalDebt))}</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Net Worth Chart */}
          <Animated.View style={chartAnim}>
            <Text style={styles.sectionTitle}>12-Month Trend</Text>
            <AreaChart data={chartData} color={colors.primary} height={160} />
          </Animated.View>

          {/* Account Groups */}
          <Animated.View style={accountsAnim}>
            <AccountSection
              title="Banking"
              icon="business-outline"
              accounts={banking}
              onAccountPress={() => {}}
            />
            <AccountSection
              title="Credit Cards"
              icon="card-outline"
              accounts={creditCards}
              onAccountPress={() => {}}
            />
            <AccountSection
              title="Loans"
              icon="school-outline"
              accounts={loans}
              onAccountPress={() => {}}
            />
            <AccountSection
              title="Investments"
              icon="trending-up-outline"
              accounts={investments}
              onAccountPress={() => navigation?.navigate?.('Investments')}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    paddingBottom: 100,
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
    marginBottom: spacing.xl,
  },
  netWorthCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  netWorthLabel: {
    fontSize: 13,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  netWorthValue: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -1,
    marginBottom: spacing.md,
  },
  assetDebtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  assetLabel: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  assetValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: GLASS_BORDER,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionCount: {
    fontSize: 12,
    color: colors.textTertiary,
    backgroundColor: GLASS_BG,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.round,
  },
  accountCard: {
    marginBottom: spacing.sm,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeLetter: {
    fontSize: 16,
    fontWeight: '700',
  },
  accountInfo: {
    flex: 1,
    gap: 2,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  accountMeta: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  accountBalance: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  utilizationWrap: {
    marginTop: spacing.md,
  },
  utilizationLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  utilizationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  utilizationPct: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});
