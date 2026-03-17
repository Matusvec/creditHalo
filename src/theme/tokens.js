import { Platform } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const shadows = {
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  goldGlow: {
    shadowColor: '#D4A843',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const blur = {
  light: 20,
  medium: 40,
  heavy: 60,
  tabBar: 80,
};

export const springs = {
  entrance: {
    damping: 20,
    stiffness: 90,
    mass: 1,
  },
  press: {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
  },
  modal: {
    damping: 22,
    stiffness: 120,
    mass: 1,
  },
  bounce: {
    damping: 10,
    stiffness: 100,
    mass: 0.8,
  },
};

export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.35,
  },
  headline: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.38,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.24,
  },
  callout: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.08,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0,
  },
  small: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.07,
  },
};

export const GLASS_BG = 'rgba(255, 248, 230, 0.08)';
export const GLASS_BORDER = 'rgba(255, 215, 0, 0.15)';
export const GLASS_HIGHLIGHT = 'rgba(255, 248, 230, 0.04)';

export const isIOS = Platform.OS === 'ios';
