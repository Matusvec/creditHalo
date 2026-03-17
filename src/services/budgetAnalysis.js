import { getTransactionsByMonth, getSpendingByCategory } from './mockTransactions.js';

// ---------------------------------------------------------------------------
// Budget vs Actual
// ---------------------------------------------------------------------------

/**
 * Compares budgeted amounts against actual spending for a given month.
 * @param {Array<{category: string, amount: number}>} budgets - Array of budget entries
 * @param {Array<Object>} transactions - Full transaction list
 * @param {number} monthOffset - 0 = current month
 * @returns {Array<{category: string, budgeted: number, actual: number, remaining: number, percentUsed: number}>}
 */
export function getBudgetVsActual(budgets, transactions, monthOffset = 0) {
  const spending = getSpendingByCategory(transactions, monthOffset);
  const spendMap = Object.fromEntries(spending.map((s) => [s.category, s.amount]));

  return budgets.map((budget) => {
    const actual = spendMap[budget.category] || 0;
    const remaining = budget.amount - actual;
    const percentUsed = budget.amount > 0 ? Math.round((actual / budget.amount) * 100) : 0;

    return {
      category: budget.category,
      budgeted: Math.round(budget.amount * 100) / 100,
      actual: Math.round(actual * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      percentUsed,
    };
  });
}

// ---------------------------------------------------------------------------
// Budget alerts
// ---------------------------------------------------------------------------

/**
 * Generates alert objects for budget categories that are nearing or over limit.
 * Thresholds: warning >= 80%, danger >= 95%, over >= 100%
 * @param {Array<{category: string, amount: number}>} budgets
 * @param {Array<Object>} transactions
 * @param {number} monthOffset
 * @returns {Array<{category: string, percentUsed: number, message: string, severity: 'warning'|'danger'|'over'}>}
 */
export function getBudgetAlerts(budgets, transactions, monthOffset = 0) {
  const comparison = getBudgetVsActual(budgets, transactions, monthOffset);
  const alerts = [];

  for (const item of comparison) {
    if (item.percentUsed >= 100) {
      alerts.push({
        category: item.category,
        percentUsed: item.percentUsed,
        message: `You've gone over your ${item.category} budget by $${Math.abs(Math.round(item.remaining))}`,
        severity: 'over',
      });
    } else if (item.percentUsed >= 95) {
      alerts.push({
        category: item.category,
        percentUsed: item.percentUsed,
        message: `Almost at your ${item.category} budget limit — only $${Math.round(item.remaining)} left`,
        severity: 'danger',
      });
    } else if (item.percentUsed >= 80) {
      alerts.push({
        category: item.category,
        percentUsed: item.percentUsed,
        message: `You've used ${item.percentUsed}% of your ${item.category} budget`,
        severity: 'warning',
      });
    }
  }

  // Sort by severity: over > danger > warning
  const severityOrder = { over: 0, danger: 1, warning: 2 };
  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

// ---------------------------------------------------------------------------
// Budget suggestions
// ---------------------------------------------------------------------------

/**
 * Suggests budget amounts for each category based on 3-month spending averages.
 * Rounds suggested amounts to nearest $25.
 * @param {Array<Object>} transactions
 * @returns {Array<{category: string, suggested: number, basedOn: string}>}
 */
export function suggestBudgets(transactions) {
  // Gather spending across last 3 months
  const months = [0, 1, 2];
  const categoryTotals = {};
  const categoryCounts = {};

  for (const offset of months) {
    const spending = getSpendingByCategory(transactions, offset);
    for (const s of spending) {
      if (!categoryTotals[s.category]) {
        categoryTotals[s.category] = 0;
        categoryCounts[s.category] = 0;
      }
      categoryTotals[s.category] += s.amount;
      categoryCounts[s.category] += 1;
    }
  }

  return Object.entries(categoryTotals)
    .map(([category, total]) => {
      const avg = total / (categoryCounts[category] || 1);
      // Add 10% buffer and round to nearest $25
      const suggested = Math.ceil((avg * 1.1) / 25) * 25;
      return {
        category,
        suggested,
        basedOn: '3-month average',
      };
    })
    .sort((a, b) => b.suggested - a.suggested);
}
