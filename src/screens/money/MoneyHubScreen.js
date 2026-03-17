import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, GlassCard } from '../../components/ui';
import { useEntranceAnimation } from '../../hooks/useEntranceAnimation';
import { useHaptic } from '../../hooks/useHaptic';
import LoanCalculator from '../insights/LoanCalculator';
import colors from '../../theme/colors';
import { spacing, radii } from '../../theme/tokens';

/** Feature card definitions for the money hub grid */
const FEATURE_CARDS = [
  {
    icon: 'pie-chart',
    title: 'Spending',
    subtitle: 'Category breakdown',
    route: 'Spending',
  },
  {
    icon: 'wallet',
    title: 'Budgets',
    subtitle: 'Track monthly limits',
    route: 'Budget',
  },
  {
    icon: 'card',
    title: 'Subscriptions',
    subtitle: 'Recurring charges',
    route: 'Subscriptions',
  },
  {
    icon: 'business',
    title: 'Accounts',
    subtitle: 'Linked bank accounts',
    route: 'Accounts',
  },
  {
    icon: 'trending-up',
    title: 'Investments',
    subtitle: 'Portfolio overview',
    route: 'Investments',
  },
  {
    icon: 'calendar',
    title: 'Bill Calendar',
    subtitle: 'Upcoming due dates',
    route: 'BillCalendar',
  },
  {
    icon: 'speedometer',
    title: 'Credit Score',
    subtitle: 'Simulate your score',
    route: 'CreditScoreSim',
  },
  {
    icon: 'trending-down',
    title: 'Debt Payoff',
    subtitle: 'Payoff strategies',
    route: 'DebtPayoff',
  },
  {
    icon: 'calculator',
    title: 'Loan Calc',
    subtitle: 'Estimate payments',
    route: 'LoanCalculator',
  },
];

/**
 * MoneyHubScreen — navigation grid for all money-related features.
 * @param {{ navigation: object }} props
 */
export default function MoneyHubScreen({ navigation }) {
  const [loanVisible, setLoanVisible] = useState(false);
  const { trigger } = useHaptic();

  const headerStyle = useEntranceAnimation(0);
  const gridStyle = useEntranceAnimation(150);

  const handleCardPress = (card) => {
    trigger('light');
    if (card.route === 'LoanCalculator') {
      setLoanVisible(true);
    } else {
      navigation.navigate(card.route);
    }
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
            <Text style={styles.title}>Money</Text>
            <Text style={styles.subtitle}>Your financial command center</Text>
          </Animated.View>

          {/* Feature grid */}
          <Animated.View style={[styles.grid, gridStyle]}>
            {FEATURE_CARDS.map((card, index) => (
              <FeatureCard
                key={card.route}
                card={card}
                onPress={() => handleCardPress(card)}
              />
            ))}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Loan Calculator modal */}
      <LoanCalculator visible={loanVisible} onClose={() => setLoanVisible(false)} />
    </GradientBackground>
  );
}

/**
 * Individual feature card in the grid.
 * @param {{ card: object, onPress: () => void }} props
 */
function FeatureCard({ card, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.cardWrap, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.cardInner}>
        {/* Gold left accent bar */}
        <View style={styles.accentBar} />

        <View style={styles.cardBody}>
          <View style={styles.iconCircle}>
            <Ionicons name={`${card.icon}-outline`} size={22} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {card.subtitle}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={14}
          color={colors.textTertiary}
          style={styles.chevron}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
    gap: spacing.xl,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardWrap: {
    width: '47%',
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 248, 230, 0.06)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
    overflow: 'hidden',
    minHeight: 80,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    opacity: 0.8,
  },
  cardBody: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.round,
    backgroundColor: 'rgba(212, 168, 67, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  chevron: {
    marginRight: spacing.sm,
  },
});
