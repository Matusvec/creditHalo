/**
 * Gamification slice — XP, levels, badges, and challenges.
 *
 * XP reward reference (apply these at call sites):
 *   lesson complete    : +50
 *   goal set           : +20
 *   goal complete      : +100
 *   budget set         : +30
 *   daily check-in     : +10
 *   community post     : +15
 *   7-day streak       : +75
 *   challenge milestone: +40
 * @module gamificationSlice
 */

const XP_PER_LEVEL = 500;

/**
 * Creates the gamification slice for the Zustand store.
 * @param {Function} set - Zustand set function
 * @param {Function} get - Zustand get function
 * @returns {object} Gamification state and actions
 */
export const createGamificationSlice = (set, get) => ({
  xp: 0,
  level: 1,
  /** @type {string[]} Earned badge IDs */
  badges: [],
  /** @type {Array<{ id: string, type: string, startDate: string, progress: number, target: number, weeklyData?: number[] }>} */
  activeChallenges: [],
  completedChallenges: [],

  /**
   * Add XP and auto-calculate the resulting level.
   * @param {number} amount - XP to add
   * @param {string} [reason] - Optional label for debugging/analytics
   */
  addXP: (amount, reason) =>
    set((state) => {
      const newXP = state.xp + amount;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      return { xp: newXP, level: newLevel };
    }),

  /**
   * Award a badge, ignoring duplicates.
   * @param {string} badgeId
   */
  earnBadge: (badgeId) =>
    set((state) => ({
      badges: state.badges.includes(badgeId)
        ? state.badges
        : [...state.badges, badgeId],
    })),

  /**
   * Start a new challenge and add it to the active list.
   * @param {{ id: string, type?: string, duration?: number, target?: number }} challenge
   */
  startChallenge: (challenge) =>
    set((state) => ({
      activeChallenges: [
        ...state.activeChallenges,
        {
          id: challenge.id,
          type: challenge.type || challenge.id,
          startDate: new Date().toISOString(),
          progress: 0,
          target: challenge.duration ?? challenge.target,
          ...(challenge.type === 'progressive' ? { weeklyData: [] } : {}),
        },
      ],
    })),

  /**
   * Update the progress value for an active challenge.
   * @param {string} id - Challenge ID
   * @param {number} progress
   */
  updateChallengeProgress: (id, progress) =>
    set((state) => ({
      activeChallenges: state.activeChallenges.map((c) =>
        c.id === id ? { ...c, progress } : c
      ),
    })),

  /**
   * Complete a challenge: remove it from active and push to completed with a timestamp.
   * @param {string} id - Challenge ID
   */
  completeChallenge: (id) =>
    set((state) => {
      const challenge = state.activeChallenges.find((c) => c.id === id);
      return {
        activeChallenges: state.activeChallenges.filter((c) => c.id !== id),
        completedChallenges: challenge
          ? [
              ...state.completedChallenges,
              { ...challenge, completedDate: new Date().toISOString() },
            ]
          : state.completedChallenges,
      };
    }),
});
