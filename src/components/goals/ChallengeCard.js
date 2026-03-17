import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '../ui';
import colors from '../../theme/colors';
import { spacing, radii, GLASS_BG, GLASS_BORDER } from '../../theme/tokens';

/**
 * Card for displaying a savings challenge with progress indicator.
 * Works for both active (from store) and available challenges.
 * @param {{ challenge: object, activeData?: object, onPress?: () => void, onStart?: () => void }} props
 */
const ChallengeCard = ({ challenge, activeData, onPress, onStart }) => {
  const isActive = !!activeData;
  const progress = isActive ? Math.min(1, (activeData.progress || 0) / (activeData.target || 1)) : 0;
  const progressPct = Math.round(progress * 100);

  const getProgressLabel = () => {
    if (!isActive) return null;
    if (challenge.type === 'progressive') {
      const week = activeData.progress || 0;
      const saved = (week * (week + 1)) / 2;
      return `Week ${week} of ${challenge.duration} · $${saved} saved`;
    }
    if (challenge.type === 'tracking') {
      return `${activeData.progress || 0} / ${challenge.duration} weekends completed`;
    }
    return `${progressPct}% complete`;
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      {/* Color accent top bar */}
      <View style={[styles.topAccent, { backgroundColor: challenge.color }]} />

      <View style={styles.body}>
        {/* Icon + name row */}
        <View style={styles.headerRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${challenge.color}22` }]}>
            <Ionicons name={challenge.icon} size={20} color={challenge.color} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.name} numberOfLines={1}>{challenge.name}</Text>
            {isActive && (
              <View style={[styles.activeBadge, { backgroundColor: `${challenge.color}22` }]}>
                <View style={[styles.activeDot, { backgroundColor: challenge.color }]} />
                <Text style={[styles.activeBadgeText, { color: challenge.color }]}>Active</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>{challenge.description}</Text>

        {/* Savings estimate */}
        <View style={styles.statsRow}>
          {challenge.totalSavings != null && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>${challenge.totalSavings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>target savings</Text>
            </View>
          )}
          <View style={styles.stat}>
            <Text style={styles.statValue}>{challenge.duration}</Text>
            <Text style={styles.statLabel}>{challenge.type === 'tracking' ? 'weekends' : challenge.duration === 52 ? 'weeks' : 'days'}</Text>
          </View>
        </View>

        {/* Progress for active challenges */}
        {isActive && (
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>{getProgressLabel()}</Text>
            <ProgressBar
              progress={progress}
              height={6}
              style={styles.bar}
            />
          </View>
        )}

        {/* Start button for available challenges */}
        {!isActive && onStart && (
          <Pressable
            style={({ pressed }) => [
              styles.startBtn,
              { borderColor: challenge.color, backgroundColor: `${challenge.color}18` },
              pressed && { opacity: 0.7 },
            ]}
            onPress={onStart}
          >
            <Text style={[styles.startBtnText, { color: challenge.color }]}>Start Challenge</Text>
            <Ionicons name="play-circle" size={14} color={challenge.color} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS_BG,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    overflow: 'hidden',
    width: 220,
    marginRight: spacing.md,
  },
  topAccent: {
    height: 3,
    width: '100%',
    opacity: 0.7,
  },
  body: { padding: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleBlock: { flex: 1, gap: 4 },
  name: { fontSize: 14, fontWeight: '700', color: colors.text },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.round,
    alignSelf: 'flex-start',
  },
  activeDot: { width: 5, height: 5, borderRadius: 3 },
  activeBadgeText: { fontSize: 10, fontWeight: '600' },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  stat: { alignItems: 'flex-start' },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textTertiary, marginTop: 1 },
  progressSection: { marginTop: spacing.xs },
  progressLabel: { fontSize: 11, color: colors.textTertiary, marginBottom: 6 },
  bar: {},
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: 8,
    marginTop: spacing.xs,
  },
  startBtnText: { fontSize: 12, fontWeight: '600' },
});

export default ChallengeCard;
