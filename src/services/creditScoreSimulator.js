import { format, addMonths } from 'date-fns';

// ---------------------------------------------------------------------------
// Base score calculation
// ---------------------------------------------------------------------------

/**
 * Calculates a base credit score (~680) derived from account data.
 * Uses weighted scoring across utilization, account mix, and balances.
 * @param {Array<Object>} accounts
 * @returns {number} Score in range 300–850
 */
export function calculateBaseScore(accounts) {
  const creditAccounts = accounts.filter((a) => a.type === 'credit');
  const totalBalance = creditAccounts.reduce((s, a) => s + Math.abs(a.balance), 0);
  const totalLimit = creditAccounts.reduce((s, a) => s + (a.limit || 0), 0);
  const utilization = totalLimit > 0 ? totalBalance / totalLimit : 0;

  // Base = 850, penalize utilization heavily
  let score = 850;

  // Utilization penalty (up to -150 pts)
  if (utilization > 0.9) score -= 150;
  else if (utilization > 0.7) score -= 120;
  else if (utilization > 0.5) score -= 90;
  else if (utilization > 0.3) score -= 50;
  else if (utilization > 0.1) score -= 20;
  else score -= 5;

  // Account mix bonus (up to +20)
  const types = new Set(accounts.map((a) => a.type));
  score += Math.min(types.size * 4, 20);

  // Loan penalty for high balances
  const loans = accounts.filter((a) => a.type === 'loan');
  for (const loan of loans) {
    const pctPaid = loan.originalBalance ? 1 - Math.abs(loan.balance) / Math.abs(loan.originalBalance) : 0;
    if (pctPaid > 0.5) score += 10;
  }

  // Recent activity — slight inquiry simulation
  score -= 15;

  // Payment history assumption — mostly on time
  score -= 10;

  return Math.min(850, Math.max(300, Math.round(score)));
}

// ---------------------------------------------------------------------------
// Score factors
// ---------------------------------------------------------------------------

/**
 * Returns individual credit score factor breakdowns with status ratings.
 * @param {Array<Object>} accounts
 * @returns {Array<{factor: string, score: number, maxScore: number, status: 'good'|'fair'|'poor', description: string}>}
 */
export function getScoreFactors(accounts) {
  const creditAccounts = accounts.filter((a) => a.type === 'credit');
  const totalBalance = creditAccounts.reduce((s, a) => s + Math.abs(a.balance), 0);
  const totalLimit = creditAccounts.reduce((s, a) => s + (a.limit || 0), 0);
  const utilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

  const utilizationScore = utilization < 10 ? 30 : utilization < 30 ? 24 : utilization < 50 ? 15 : utilization < 75 ? 8 : 3;
  const utilizationStatus = utilization < 10 ? 'good' : utilization < 30 ? 'fair' : 'poor';

  const accountTypes = new Set(accounts.map((a) => a.type));
  const mixScore = accountTypes.size >= 4 ? 10 : accountTypes.size === 3 ? 8 : accountTypes.size === 2 ? 5 : 3;
  const mixStatus = accountTypes.size >= 3 ? 'good' : accountTypes.size === 2 ? 'fair' : 'poor';

  return [
    {
      factor: 'Payment History',
      score: 28,
      maxScore: 35,
      status: 'fair',
      description: 'A few late payments in the past 2 years are impacting your score',
    },
    {
      factor: 'Credit Utilization',
      score: utilizationScore,
      maxScore: 30,
      status: utilizationStatus,
      description: `You're using ${Math.round(utilization)}% of your available credit (ideal: under 30%)`,
    },
    {
      factor: 'Account Age',
      score: 9,
      maxScore: 15,
      status: 'fair',
      description: 'Average account age is 3.2 years — older accounts improve this factor',
    },
    {
      factor: 'Credit Mix',
      score: mixScore,
      maxScore: 10,
      status: mixStatus,
      description: `You have ${accountTypes.size} account types — diversity improves your score`,
    },
    {
      factor: 'Recent Inquiries',
      score: 7,
      maxScore: 10,
      status: 'fair',
      description: '2 hard inquiries in the past 12 months — they age off after 2 years',
    },
  ];
}

// ---------------------------------------------------------------------------
// Simulators
// ---------------------------------------------------------------------------

/**
 * Simulates score impact of paying off a debt balance.
 * @param {number} currentScore
 * @param {number} payoffAmount
 * @param {number} totalCreditBalance
 * @param {number} totalCreditLimit
 * @returns {{ newScore: number, scoreDelta: number, newUtilization: number, oldUtilization: number }}
 */
export function simulatePayoff(currentScore, payoffAmount, totalCreditBalance, totalCreditLimit) {
  const oldUtilization = totalCreditLimit > 0 ? (totalCreditBalance / totalCreditLimit) * 100 : 0;
  const newBalance = Math.max(0, totalCreditBalance - payoffAmount);
  const newUtilization = totalCreditLimit > 0 ? (newBalance / totalCreditLimit) * 100 : 0;

  // Score improvement estimate based on utilization drop
  const utilizationDrop = oldUtilization - newUtilization;
  let scoreDelta = 0;
  if (utilizationDrop > 20) scoreDelta = Math.round(utilizationDrop * 1.8);
  else if (utilizationDrop > 10) scoreDelta = Math.round(utilizationDrop * 1.4);
  else scoreDelta = Math.round(utilizationDrop * 1.0);

  const newScore = Math.min(850, currentScore + scoreDelta);

  return {
    newScore,
    scoreDelta,
    newUtilization: Math.round(newUtilization * 10) / 10,
    oldUtilization: Math.round(oldUtilization * 10) / 10,
  };
}

/**
 * Simulates score impact of opening a new credit card.
 * @param {number} currentScore
 * @param {number} newCreditLimit
 * @param {number} totalCreditBalance
 * @param {number} totalCreditLimit
 * @returns {{ newScore: number, scoreDelta: number, newUtilization: number }}
 */
export function simulateNewCard(currentScore, newCreditLimit, totalCreditBalance, totalCreditLimit) {
  const newTotalLimit = totalCreditLimit + newCreditLimit;
  const newUtilization = newTotalLimit > 0 ? (totalCreditBalance / newTotalLimit) * 100 : 0;
  const oldUtilization = totalCreditLimit > 0 ? (totalCreditBalance / totalCreditLimit) * 100 : 0;

  const utilizationDrop = oldUtilization - newUtilization;
  // New card also triggers hard inquiry penalty
  const inquiryPenalty = 8;
  const utilizationGain = Math.round(utilizationDrop * 1.2);
  const scoreDelta = utilizationGain - inquiryPenalty;
  const newScore = Math.min(850, Math.max(300, currentScore + scoreDelta));

  return {
    newScore,
    scoreDelta,
    newUtilization: Math.round(newUtilization * 10) / 10,
  };
}

/**
 * Simulates score improvement from N months of on-time payments.
 * @param {number} currentScore
 * @param {number} months
 * @returns {{ newScore: number, scoreDelta: number, monthByMonth: Array<{month: string, score: number}> }}
 */
export function simulateOnTimePayments(currentScore, months) {
  const monthByMonth = [];
  let score = currentScore;
  const today = new Date();

  for (let i = 1; i <= months; i++) {
    // Diminishing returns: more impact early, less later
    const gain = i <= 3 ? 4 : i <= 6 ? 3 : i <= 12 ? 2 : 1;
    score = Math.min(850, score + gain);
    monthByMonth.push({
      month: format(addMonths(today, i), 'MMM yyyy'),
      score,
    });
  }

  return {
    newScore: score,
    scoreDelta: score - currentScore,
    monthByMonth,
  };
}

// ---------------------------------------------------------------------------
// Personalized tips
// ---------------------------------------------------------------------------

/**
 * Generates personalized credit improvement tips based on account data.
 * @param {Array<Object>} accounts
 * @returns {string[]}
 */
export function getPersonalizedTips(accounts) {
  const tips = [];
  const creditAccounts = accounts.filter((a) => a.type === 'credit');
  const totalBalance = creditAccounts.reduce((s, a) => s + Math.abs(a.balance), 0);
  const totalLimit = creditAccounts.reduce((s, a) => s + (a.limit || 0), 0);
  const overallUtilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;

  // Per-card utilization tips
  for (const card of creditAccounts) {
    if (!card.limit) continue;
    const util = Math.round((Math.abs(card.balance) / card.limit) * 100);
    if (util > 30) {
      const payoffTarget = Math.abs(card.balance) - card.limit * 0.3;
      tips.push(
        `Paying off $${Math.round(payoffTarget)} on your ${card.name} would drop its utilization from ${util}% to 30%`,
      );
    }
  }

  if (overallUtilization > 30) {
    tips.push(`Your overall credit utilization is ${overallUtilization}% — aim for under 30% to meaningfully boost your score`);
  }

  const loans = accounts.filter((a) => a.type === 'loan');
  if (loans.length > 0) {
    tips.push('Making extra payments on your student loan reduces debt-to-income and improves long-term score trajectory');
  }

  const hasInvestments = accounts.some((a) => a.type === 'investment' || a.type === 'retirement');
  if (!hasInvestments) {
    tips.push('Opening an investment account diversifies your financial profile — lenders favor financial stability');
  }

  tips.push('Set up automatic minimum payments on all cards to avoid any missed payment penalties');
  tips.push('Avoid applying for new credit within 6 months of a major loan application (mortgage, auto)');

  return tips;
}
