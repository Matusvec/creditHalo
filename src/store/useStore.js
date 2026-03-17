/**
 * Root Zustand store — composes all feature slices.
 *
 * Import convention (unchanged for all screens):
 *   import { useStore } from '../store/useStore';
 *
 * Persistence is manual: call persist() after mutations you want saved,
 * and call hydrate() once on app start (e.g. in LoadingScreen).
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createAuthSlice } from './slices/authSlice';
import { createEducationSlice } from './slices/educationSlice';
import { createSocialSlice } from './slices/socialSlice';
import { createFinanceSlice } from './slices/financeSlice';
import { createGoalsSlice } from './slices/goalsSlice';
import { createGamificationSlice } from './slices/gamificationSlice';
import { createHealthScoreSlice } from './slices/healthScoreSlice';

const STORAGE_KEY = '@credithalo_store';

export const useStore = create((set, get) => ({
  // ── Slice composition ──────────────────────────────────────────────────────
  ...createAuthSlice(set, get),
  ...createEducationSlice(set, get),
  ...createSocialSlice(set, get),
  ...createFinanceSlice(set, get),
  ...createGoalsSlice(set, get),
  ...createGamificationSlice(set, get),
  ...createHealthScoreSlice(set, get),

  // ── Alerts (small enough to live in the root store) ───────────────────────
  alerts: [],
  notificationsEnabled: true,

  /**
   * Push a new alert onto the alerts list.
   * @param {{ title: string, message: string, type?: string }} alert
   */
  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        ...state.alerts,
        { id: Date.now().toString(), ...alert },
      ],
    })),

  /**
   * Remove an alert by its ID.
   * @param {string} id
   */
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),

  /**
   * Toggle push-notification opt-in.
   * @param {boolean} enabled
   */
  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

  // ── Persistence ───────────────────────────────────────────────────────────

  /**
   * Load persisted state from AsyncStorage into the store.
   * Call once on app start (e.g. in LoadingScreen).
   */
  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const p = JSON.parse(stored);
        set({
          // Auth
          user: p.user ?? null,
          isLoggedIn: p.isLoggedIn ?? false,
          bankLinked: p.bankLinked ?? false,
          // Education
          streak: p.streak ?? 0,
          lastStreakDate: p.lastStreakDate ?? null,
          completedLessons: p.completedLessons ?? [],
          // Social
          posts: p.posts ?? [],
          likedPostIds: p.likedPostIds ?? {},
          postComments: p.postComments ?? {},
          joinedCommunities: p.joinedCommunities ?? [],
          // Finance
          transactions: p.transactions ?? [],
          transactionsGenerated: p.transactionsGenerated ?? false,
          budgets: p.budgets ?? {},
          budgetMonth: p.budgetMonth ?? null,
          subscriptions: p.subscriptions ?? [],
          cancelledSubscriptions: p.cancelledSubscriptions ?? [],
          accounts: p.accounts ?? [],
          holdings: p.holdings ?? [],
          netWorthHistory: p.netWorthHistory ?? [],
          bills: p.bills ?? [],
          // Goals — normalise legacy shapes (content → text)
          goals: (p.goals ?? [])
            .filter((g) => g && (g.text != null || g.content != null))
            .map((g) => ({
              ...g,
              id: g.id,
              text: g.text ?? g.content ?? '',
              completed: g.completed ?? false,
            })),
          completedGoalCount: p.completedGoalCount ?? 0,
          // Gamification
          xp: p.xp ?? 0,
          level: p.level ?? 1,
          badges: p.badges ?? [],
          activeChallenges: p.activeChallenges ?? [],
          completedChallenges: p.completedChallenges ?? [],
          // Health score
          healthScore: p.healthScore ?? 0,
          healthBreakdown: p.healthBreakdown ?? {},
          healthHistory: p.healthHistory ?? [],
          // Alerts
          alerts: p.alerts ?? [],
          notificationsEnabled: p.notificationsEnabled ?? true,
        });
      }
    } catch (e) {
      console.warn('Failed to hydrate store:', e);
    }
  },

  /**
   * Save the current store state to AsyncStorage.
   * Call after any mutation that should survive an app restart.
   */
  persist: async () => {
    const s = get();
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          // Auth
          user: s.user,
          isLoggedIn: s.isLoggedIn,
          bankLinked: s.bankLinked,
          // Education
          streak: s.streak,
          lastStreakDate: s.lastStreakDate,
          completedLessons: s.completedLessons,
          // Social
          posts: s.posts,
          likedPostIds: s.likedPostIds,
          postComments: s.postComments,
          joinedCommunities: s.joinedCommunities,
          // Finance
          transactions: s.transactions,
          transactionsGenerated: s.transactionsGenerated,
          budgets: s.budgets,
          budgetMonth: s.budgetMonth,
          subscriptions: s.subscriptions,
          cancelledSubscriptions: s.cancelledSubscriptions,
          accounts: s.accounts,
          holdings: s.holdings,
          netWorthHistory: s.netWorthHistory,
          bills: s.bills,
          // Goals
          goals: s.goals,
          completedGoalCount: s.completedGoalCount,
          // Gamification
          xp: s.xp,
          level: s.level,
          badges: s.badges,
          activeChallenges: s.activeChallenges,
          completedChallenges: s.completedChallenges,
          // Health score
          healthScore: s.healthScore,
          healthBreakdown: s.healthBreakdown,
          healthHistory: s.healthHistory,
          // Alerts
          alerts: s.alerts,
          notificationsEnabled: s.notificationsEnabled,
        })
      );
    } catch (e) {
      console.warn('Failed to persist store:', e);
    }
  },
}));
