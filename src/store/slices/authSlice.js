/**
 * Auth slice — user session and bank-link state.
 * @module authSlice
 */

/**
 * Creates the auth slice for the Zustand store.
 * @param {Function} set - Zustand set function
 * @returns {object} Auth state and actions
 */
export const createAuthSlice = (set) => ({
  user: null,
  isLoggedIn: false,
  bankLinked: false,

  /**
   * Set the current user and toggle isLoggedIn accordingly.
   * @param {object|null} user
   */
  setUser: (user) => set({ user, isLoggedIn: !!user }),

  /**
   * Clear the session.
   */
  logout: () => set({ user: null, isLoggedIn: false }),

  /**
   * Mark whether the user has linked a bank account.
   * @param {boolean} linked
   */
  setBankLinked: (linked) => set({ bankLinked: linked }),
});
