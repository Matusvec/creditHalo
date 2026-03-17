import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, GlassCard } from '../../components/ui';
import SubscriptionCard from '../../components/subscriptions/SubscriptionCard';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { useHaptic } from '../../hooks/useHaptic';
import { useStore } from '../../store/useStore';
import { generateTransactions } from '../../services/mockTransactions';
import {
  detectSubscriptions,
  getSubscriptionSummary,
  getSubscriptionsByCategory,
} from '../../services/subscriptionDetector';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

/**
 * SubscriptionsScreen — auto-detected recurring subscription tracker.
 * @param {{ navigation: object }} props
 */
export default function SubscriptionsScreen({ navigation }) {
  const {
    transactions,
    transactionsGenerated,
    setTransactions,
    subscriptions,
    cancelledSubscriptions,
    setSubscriptions,
    cancelSubscription,
    persist,
  } = useStore();

  const { trigger } = useHaptic();

  const headerStyle = useEntranceAnimation(0);
  const summaryStyle = useEntranceAnimation(100);
  const listStyle = useEntranceAnimation(200);
  const categoryStyle = useEntranceAnimation(300);

  useEffect(() => {
    let txns = transactions;
    if (!transactionsGenerated) {
      txns = generateTransactions(6);
      setTransactions(txns);
    }
    try {
      const detected = detectSubscriptions(txns);
      setSubscriptions(detected);
    } catch (err) {
      console.warn('Subscription detection failed:', err);
    }
  }, [transactionsGenerated]);

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.isActive !== false),
    [subscriptions]
  );

  const summary = useMemo(
    () => getSubscriptionSummary(activeSubscriptions),
    [activeSubscriptions]
  );

  const byCategory = useMemo(
    () => getSubscriptionsByCategory(activeSubscriptions),
    [activeSubscriptions]
  );

  const handleCancel = (id) => {
    trigger('medium');
    cancelSubscription(id);
    persist();
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={headerStyle}>
            <Text style={styles.title}>Subscriptions</Text>
            <Text style={styles.subtitle}>Auto-detected recurring charges</Text>
          </Animated.View>

          {/* Summary card */}
          <Animated.View style={summaryStyle}>
            <GlassCard style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.summaryLabel}>Monthly Cost</Text>
                  <Text style={styles.summaryAmount}>${summary.monthlyTotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryBadge}>
                  <Ionicons name="refresh-outline" size={14} color={colors.primary} />
                  <Text style={styles.summaryBadgeText}>{summary.count} active</Text>
                </View>
              </View>
              <View style={styles.annualRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                <Text style={styles.annualText}>
                  You spend{' '}
                  <Text style={styles.annualHighlight}>
                    ${summary.annualProjection.toFixed(0)}
                  </Text>{' '}
                  per year on subscriptions
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Active subscriptions */}
          <Animated.View style={listStyle}>
            <Text style={styles.sectionTitle}>Active</Text>
            {activeSubscriptions.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="card-outline" size={32} color={colors.textTertiary} style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No subscriptions detected</Text>
                <Text style={styles.emptySubtitle}>
                  Connect your bank account and generate transactions to detect recurring charges.
                </Text>
              </GlassCard>
            ) : (
              activeSubscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onCancel={() => handleCancel(sub.id)}
                />
              ))
            )}
          </Animated.View>

          {/* Category breakdown */}
          {byCategory.length > 0 && (
            <Animated.View style={categoryStyle}>
              <Text style={styles.sectionTitle}>By Category</Text>
              <GlassCard noPadding style={styles.listCard}>
                {byCategory.map((group, index) => (
                  <View
                    key={group.category}
                    style={[
                      styles.categoryRow,
                      index < byCategory.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{group.category}</Text>
                      <Text style={styles.categoryCount}>
                        {group.items.length} subscription{group.items.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <Text style={styles.categoryTotal}>${group.total.toFixed(2)}/mo</Text>
                  </View>
                ))}
              </GlassCard>
            </Animated.View>
          )}

          {/* Cancelled subscriptions */}
          {cancelledSubscriptions.length > 0 && (
            <Animated.View style={categoryStyle}>
              <Text style={styles.sectionTitle}>Cancelled</Text>
              {cancelledSubscriptions.map((sub) => (
                <SubscriptionCard key={sub.id} subscription={sub} cancelled />
              ))}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
    gap: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
    backgroundColor: 'rgba(212, 168, 67, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.25)',
    marginBottom: 4,
  },
  summaryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  annualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 215, 0, 0.1)',
  },
  annualText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  annualHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 19,
  },
  listCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 215, 0, 0.1)',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryInfo: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  categoryCount: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  categoryTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
