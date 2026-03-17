/**
 * Education slice — lesson streaks and completed-lesson tracking.
 * @module educationSlice
 */

/**
 * Creates the education slice for the Zustand store.
 * @param {Function} set - Zustand set function
 * @param {Function} get - Zustand get function
 * @returns {object} Education state and actions
 */
export const createEducationSlice = (set, get) => ({
  streak: 0,
  lastStreakDate: null,
  completedLessons: [],

  /**
   * Directly set streak value and the date it was last updated.
   * @param {number} streak
   * @param {string} lastStreakDate - Date string from toDateString()
   */
  setStreak: (streak, lastStreakDate) => set({ streak, lastStreakDate }),

  /**
   * Increment streak if today hasn't been counted yet.
   * Resets to 1 if the last streak date was not yesterday.
   * @returns {number} The resulting streak value
   */
  incrementStreak: () => {
    const { lastStreakDate, streak } = get();
    const today = new Date().toDateString();
    if (lastStreakDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newStreak =
        lastStreakDate === yesterday.toDateString() ? streak + 1 : 1;
      set({ streak: newStreak, lastStreakDate: today });
      return newStreak;
    }
    return streak;
  },

  /**
   * Record a completed lesson, ignoring duplicates.
   * @param {string} lessonId
   */
  addCompletedLesson: (lessonId) =>
    set((state) => ({
      completedLessons: state.completedLessons.includes(lessonId)
        ? state.completedLessons
        : [...state.completedLessons, lessonId],
    })),
});
