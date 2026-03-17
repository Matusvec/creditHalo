import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useHaptic } from '../../hooks/useHaptic';
import colors from '../../theme/colors';
import { blur, springs, radii } from '../../theme/tokens';

const TAB_ICONS = {
  DashboardTab: 'home',
  MoneyTab: 'wallet',
  LearnTab: 'school',
  CommunityTab: 'people',
  GoalsTab: 'flag',
};

const TAB_LABELS = {
  DashboardTab: 'Dashboard',
  MoneyTab: 'Money',
  LearnTab: 'Learn',
  CommunityTab: 'Community',
  GoalsTab: 'Goals',
};

/**
 * Custom tab bar with blur background, gold active indicator, and haptic feedback
 */
const PremiumTabBar = ({ state, descriptors, navigation }) => {
  const { trigger } = useHaptic();

  const TabBarBackground = Platform.OS === 'ios' ? BlurView : View;
  const bgProps = Platform.OS === 'ios'
    ? { intensity: blur.tabBar, tint: 'dark', style: styles.blur }
    : { style: [styles.blur, styles.androidBg] };

  return (
    <View style={styles.container}>
      <TabBarBackground {...bgProps}>
        <View style={styles.tabRow}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const iconName = TAB_ICONS[route.name] || 'ellipse';
            const label = TAB_LABELS[route.name] || route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                trigger('light');
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                {isFocused && <View style={styles.activePill} />}
                <Ionicons
                  name={isFocused ? iconName : `${iconName}-outline`}
                  size={22}
                  color={isFocused ? colors.primary : colors.textTertiary}
                />
                <Text
                  style={[
                    styles.label,
                    { color: isFocused ? colors.primary : colors.textTertiary },
                    isFocused && styles.labelActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </TabBarBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.08)',
  },
  blur: {
    overflow: 'hidden',
  },
  androidBg: {
    backgroundColor: 'rgba(26, 23, 20, 0.95)',
  },
  tabRow: {
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    borderRadius: radii.round,
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
  labelActive: {
    fontWeight: '600',
  },
});

export default PremiumTabBar;
