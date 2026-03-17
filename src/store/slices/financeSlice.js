/**
 * Finance slice — transactions, budgets, subscriptions, accounts, holdings,
 * net-worth history, and bills.
 * @module financeSlice
 */
const uuidv4 = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

/**
 * Creates the finance slice for the Zustand store.
 * @param {Function} set - Zustand set function
 * @param {Function} get - Zustand get function
 * @returns {object} Finance state and actions
 */
export const createFinanceSlice = (set, get) => ({
  transactions: [],
  transactionsGenerated: false,
  /** @type {Object.<string, { limit: number, rollover: boolean }>} */
  budgets: {},
  /** @type {string|null} Format: 'YYYY-MM' */
  budgetMonth: null,
  /** @type {Array<{ id: string, name: string, amount: number, nextDate: string }>} */
  subscriptions: [],
  cancelledSubscriptions: [],
  accounts: [],
  holdings: [],
  /** @type {Array<{ date: string, score: number }>} */
  netWorthHistory: [],
  /** @type {Array<{ id: string, name: string, amount: number, dueDate: string, category: string, isPaid: boolean, isRecurring: boolean }>} */
  bills: [],

  /**
   * Replace the full transactions list and mark it as generated.
   * @param {Array} transactions
   */
  setTransactions: (transactions) =>
    set({ transactions, transactionsGenerated: true }),

  /**
   * Set or update a budget limit for a spending category.
   * @param {string} category
   * @param {number} limit
   * @param {boolean} [rollover=false] - Whether unused budget rolls over
   */
  setBudget: (category, limit, rollover = false) =>
    set((state) => ({
      budgets: { ...state.budgets, [category]: { limit, rollover } },
    })),

  /**
   * Remove a budget category entirely.
   * @param {string} category
   */
  removeBudget: (category) =>
    set((state) => {
      const budgets = { ...state.budgets };
      delete budgets[category];
      return { budgets };
    }),

  /**
   * Set the currently active budget month.
   * @param {string} month - Format 'YYYY-MM'
   */
  setBudgetMonth: (month) => set({ budgetMonth: month }),

  /**
   * Replace the detected subscriptions list.
   * @param {Array} subscriptions
   */
  setSubscriptions: (subscriptions) => set({ subscriptions }),

  /**
   * Remove a subscription and move it to the cancelled list with a cancel date.
   * @param {string} id - Subscription ID
   */
  cancelSubscription: (id) =>
    set((state) => {
      const sub = state.subscriptions.find((s) => s.id === id);
      return {
        subscriptions: state.subscriptions.filter((s) => s.id !== id),
        cancelledSubscriptions: sub
          ? [
              ...state.cancelledSubscriptions,
              { ...sub, cancelledDate: new Date().toISOString() },
            ]
          : state.cancelledSubscriptions,
      };
    }),

  /**
   * Replace the linked accounts list.
   * @param {Array} accounts
   */
  setAccounts: (accounts) => set({ accounts }),

  /**
   * Replace the investment holdings list.
   * @param {Array} holdings
   */
  setHoldings: (holdings) => set({ holdings }),

  /**
   * Replace the net-worth history snapshots.
   * @param {Array} history
   */
  setNetWorthHistory: (history) => set({ netWorthHistory: history }),

  /**
   * Add a new bill with a generated UUID.
   * @param {object} bill - Bill data (name, amount, dueDate, category, isRecurring)
   */
  addBill: (bill) =>
    set((state) => ({
      bills: [...state.bills, { id: uuidv4(), isPaid: false, ...bill }],
    })),

  /**
   * Mark a bill as paid.
   * @param {string} id - Bill ID
   */
  markBillPaid: (id) =>
    set((state) => ({
      bills: state.bills.map((b) =>
        b.id === id ? { ...b, isPaid: true } : b
      ),
    })),

  /**
   * Remove a bill permanently.
   * @param {string} id - Bill ID
   */
  removeBill: (id) =>
    set((state) => ({
      bills: state.bills.filter((b) => b.id !== id),
    })),
});
