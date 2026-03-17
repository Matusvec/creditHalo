/**
 * Health score slice — composite financial wellness score and its history.
 *
 * Score breakdown (max 100):
 *   spendingHabits    : 0–20  month-over-month spending stability
 *   savingsRate       : 0–20  income vs savings
 *   debtRatio         : 0–20  debt-to-income ratio
 *   goalCompletion    : 0–15  completed goals / total goals
 *   educationProgress : 0–15  completed lessons / total lessons
 *   budgetAdherence   : 0–10  has active budgets
 * @module healthScoreSlice
 */

const TOTAL_LESSONS = 9; // 3 modules × 3 lessons

/**
 * Creates the health score slice for the Zustand store.
 * @param {Function} set - Zustand set function
 * @param {Function} get - Zustand get function
 * @returns {object} Health score state and actions
 */
export const createHealthScoreSlice = (set, get) => ({
  healthScore: 0,
  healthBreakdown: {
    spendingHabits: 0,
    savingsRate: 0,
    debtRatio: 0,
    goalCompletion: 0,
    educationProgress: 0,
    budgetAdherence: 0,
  },
  /** @type {Array<{ date: string, score: number }>} */
  healthHistory: [],

  /**
   * Recalculate the health score from current store state.
   * Reads goals, completedGoalCount, completedLessons, and budgets from the
   * combined store via get(). Updates healthScore and healthBreakdown in place.
   * @returns {number} The newly calculated score
   */
  calculateHealthScore: () => {
    const state = get();

    // Spending Habits (0-20): placeholder — stable default until real tx analysis
    const spendingHabits = 14;

    // Savings Rate (0-20): placeholder — will be derived from transactions
    const savingsRate = 12;

    // Debt Ratio (0-20): placeholder — will be derived from accounts
    const debtRatio = 10;

    // Goal Completion (0-15)
    const totalGoals =
      (state.goals?.length || 0) + (state.completedGoalCount || 0);
    const goalCompletion =
      totalGoals > 0
        ? Math.min(
            15,
            Math.round(
              ((state.completedGoalCount || 0) / Math.max(totalGoals, 1)) * 15
            )
          )
        : 0;

    // Education Progress (0-15)
    const educationProgress = Math.min(
      15,
      Math.round(
        ((state.completedLessons?.length || 0) / TOTAL_LESSONS) * 15
      )
    );

    // Budget Adherence (0-10): having active budgets earns a base score
    const budgetCount = Object.keys(state.budgets || {}).length;
    const budgetAdherence = budgetCount > 0 ? 6 : 0;

    const breakdown = {
      spendingHabits,
      savingsRate,
      debtRatio,
      goalCompletion,
      educationProgress,
      budgetAdherence,
    };
    const score = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

    set({ healthScore: score, healthBreakdown: breakdown });
    return score;
  },

  /**
   * Directly apply a pre-computed breakdown and record a history snapshot.
   * @param {{ spendingHabits: number, savingsRate: number, debtRatio: number, goalCompletion: number, educationProgress: number, budgetAdherence: number }} data
   */
  updateHealthScoreWithData: (data) => {
    const score = Object.values(data).reduce((sum, v) => sum + v, 0);
    set({
      healthScore: score,
      healthBreakdown: data,
      healthHistory: [
        ...(get().healthHistory || []),
        { date: new Date().toISOString(), score },
      ],
    });
  },

  /**
   * Replace the full health history array (used during hydration).
   * @param {Array<{ date: string, score: number }>} history
   */
  setHealthHistory: (history) => set({ healthHistory: history }),
});
