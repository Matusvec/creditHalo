import { format, addMonths } from 'date-fns';

// ---------------------------------------------------------------------------
// Shared amortization engine
// ---------------------------------------------------------------------------

/**
 * @typedef {{ id: string, name: string, balance: number, rate: number, minPayment: number }} Debt
 * @typedef {{ month: number, payments: Array<{debtId: string, payment: number, remaining: number}> }} ScheduleMonth
 * @typedef {{ totalInterest: number, payoffDate: string, totalMonths: number, schedule: ScheduleMonth[] }} PayoffResult
 */

/**
 * Core amortization loop. Accepts debts sorted by the chosen strategy order.
 * Extra payment is applied to the first debt in the list (strategy target).
 * @param {Debt[]} sortedDebts - Debts in priority order (already sorted)
 * @param {number} extraPayment - Extra monthly payment beyond all minimums
 * @returns {PayoffResult}
 */
function amortize(sortedDebts, extraPayment) {
  // Deep clone to avoid mutating inputs
  let remaining = sortedDebts.map((d) => ({ ...d, balance: d.balance }));
  const schedule = [];
  let totalInterest = 0;
  let month = 0;
  const MAX_MONTHS = 600; // 50-year safety cap

  while (remaining.some((d) => d.balance > 0.01) && month < MAX_MONTHS) {
    month++;
    const monthPayments = [];
    let availableExtra = extraPayment;

    for (let i = 0; i < remaining.length; i++) {
      const debt = remaining[i];
      if (debt.balance <= 0.01) {
        monthPayments.push({ debtId: debt.id, payment: 0, remaining: 0 });
        continue;
      }

      const monthlyRate = debt.rate / 100 / 12;
      const interest = debt.balance * monthlyRate;
      totalInterest += interest;

      let payment = Math.min(debt.minPayment, debt.balance + interest);

      // Apply extra to the first unpaid debt (strategy target)
      const isTarget = i === remaining.findIndex((d) => d.balance > 0.01);
      if (isTarget && availableExtra > 0) {
        const canApply = Math.min(availableExtra, debt.balance + interest - payment);
        payment += Math.max(0, canApply);
        availableExtra -= canApply;
        // If target paid off, carry remaining extra to next iteration
        if (debt.balance + interest - payment < 0.01) {
          availableExtra += Math.max(0, payment - (debt.balance + interest));
        }
      }

      debt.balance = Math.max(0, debt.balance + interest - payment);

      // If this debt paid off, freed minimum flows to next debt
      if (debt.balance < 0.01) {
        debt.balance = 0;
        availableExtra += debt.minPayment; // cascade freed payment
      }

      monthPayments.push({
        debtId: debt.id,
        payment: Math.round(payment * 100) / 100,
        remaining: Math.round(debt.balance * 100) / 100,
      });
    }

    schedule.push({ month, payments: monthPayments });
  }

  const payoffDate = format(addMonths(new Date(), month), 'MMM yyyy');

  return {
    totalInterest: Math.round(totalInterest * 100) / 100,
    payoffDate,
    totalMonths: month,
    schedule,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculates debt payoff using the Snowball method (smallest balance first).
 * @param {Debt[]} debts
 * @param {number} extraPayment - Extra monthly payment beyond minimums
 * @returns {PayoffResult}
 */
export function calculateSnowball(debts, extraPayment = 0) {
  const sorted = debts.slice().sort((a, b) => a.balance - b.balance);
  return amortize(sorted, extraPayment);
}

/**
 * Calculates debt payoff using the Avalanche method (highest interest rate first).
 * @param {Debt[]} debts
 * @param {number} extraPayment - Extra monthly payment beyond minimums
 * @returns {PayoffResult}
 */
export function calculateAvalanche(debts, extraPayment = 0) {
  const sorted = debts.slice().sort((a, b) => b.rate - a.rate);
  return amortize(sorted, extraPayment);
}

/**
 * Compares Snowball vs Avalanche strategies and reports interest savings.
 * @param {Debt[]} debts
 * @param {number} extraPayment
 * @returns {{ snowball: { totalInterest: number, payoffDate: string, totalMonths: number }, avalanche: { totalInterest: number, payoffDate: string, totalMonths: number }, interestSaved: number }}
 */
export function compareStrategies(debts, extraPayment = 0) {
  const snowball = calculateSnowball(debts, extraPayment);
  const avalanche = calculateAvalanche(debts, extraPayment);

  return {
    snowball: {
      totalInterest: snowball.totalInterest,
      payoffDate: snowball.payoffDate,
      totalMonths: snowball.totalMonths,
    },
    avalanche: {
      totalInterest: avalanche.totalInterest,
      payoffDate: avalanche.payoffDate,
      totalMonths: avalanche.totalMonths,
    },
    interestSaved: Math.round((snowball.totalInterest - avalanche.totalInterest) * 100) / 100,
  };
}

/**
 * Calculates how much time and interest an extra monthly payment saves.
 * Uses Avalanche as the baseline comparison strategy.
 * @param {Debt[]} debts
 * @param {number} extraAmount - Additional monthly payment beyond minimums
 * @returns {{ monthsSaved: number, interestSaved: number, newPayoffDate: string }}
 */
export function calculateExtraPaymentImpact(debts, extraAmount) {
  const baseline = calculateAvalanche(debts, 0);
  const withExtra = calculateAvalanche(debts, extraAmount);

  return {
    monthsSaved: Math.max(0, baseline.totalMonths - withExtra.totalMonths),
    interestSaved: Math.round((baseline.totalInterest - withExtra.totalInterest) * 100) / 100,
    newPayoffDate: withExtra.payoffDate,
  };
}
