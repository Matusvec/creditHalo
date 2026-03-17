/**
 * Goals slice — savings/financial goals with milestone and AI-analysis support.
 *
 * Backward-compatible API:
 *   addGoal(text)        — still works; options are optional
 *   completeGoal(id)     — unchanged behaviour (removes goal, bumps count)
 * @module goalsSlice
 */
const uuidv4 = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

/**
 * Creates the goals slice for the Zustand store.
 * @param {Function} set - Zustand set function
 * @param {Function} get - Zustand get function
 * @returns {object} Goals state and actions
 */
export const createGoalsSlice = (set, get) => ({
  goals: [],
  completedGoalCount: 0,

  /**
   * Add a new goal.
   * The first argument is the goal text (string), matching the existing API.
   * An optional second argument carries extended metadata.
   * @param {string} text
   * @param {{ targetAmount?: number, currentAmount?: number, deadline?: string, category?: string }} [options={}]
   */
  addGoal: (text, options = {}) =>
    set((state) => ({
      goals: [
        ...state.goals,
        {
          id: uuidv4(),
          text,
          completed: false,
          targetAmount: options.targetAmount ?? null,
          currentAmount: options.currentAmount ?? 0,
          deadline: options.deadline ?? null,
          category: options.category ?? null,
          aiAnalysis: null,
          milestones: [],
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  /**
   * Mark a goal as complete and remove it from the active list.
   * Increments the completedGoalCount counter.
   * @param {string} id - Goal ID
   */
  completeGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
      completedGoalCount: state.completedGoalCount + 1,
    })),

  /**
   * Update the current saved amount for a goal.
   * @param {string} id - Goal ID
   * @param {number} amount
   */
  updateGoalProgress: (id, amount) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, currentAmount: amount } : g
      ),
    })),

  /**
   * Attach an AI-generated analysis object to a goal.
   * @param {string} id - Goal ID
   * @param {object} analysis
   */
  setGoalAIAnalysis: (id, analysis) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, aiAnalysis: analysis } : g
      ),
    })),

  /**
   * Add a milestone to a goal's milestone list.
   * @param {string} goalId
   * @param {{ target: number, label: string }} milestone
   */
  addGoalMilestone: (goalId, milestone) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId
          ? { ...g, milestones: [...(g.milestones || []), milestone] }
          : g
      ),
    })),

  /**
   * Mark a milestone as reached by its target value.
   * @param {string} goalId
   * @param {number} milestoneTarget
   */
  markMilestoneReached: (goalId, milestoneTarget) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              milestones: (g.milestones || []).map((m) =>
                m.target === milestoneTarget ? { ...m, reached: true } : m
              ),
            }
          : g
      ),
    })),
});
