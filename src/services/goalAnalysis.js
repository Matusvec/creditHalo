import { format, addMonths, differenceInMonths } from 'date-fns';

// ---------------------------------------------------------------------------
// Feasibility analysis
// ---------------------------------------------------------------------------

/**
 * Analyzes whether a financial goal is achievable given the user's finances.
 * @param {{ text: string, targetAmount?: number, deadline?: string, category?: string }} goal
 * @param {{ monthlyIncome: number, monthlyExpenses: number, savingsRate: number, totalDebt: number, monthlyDebtPayments: number }} financialData
 * @returns {{ feasibility: 'Very Achievable'|'Achievable'|'Challenging'|'Long-term', timeframe: string, score: number, steps: string[], tips: string[], reasoning: string }}
 */
export function analyzeGoalFeasibility(goal, financialData) {
  const { monthlyIncome, monthlyExpenses, savingsRate, totalDebt, monthlyDebtPayments } = financialData;
  const disposableIncome = monthlyIncome - monthlyExpenses;
  const monthlySavingsCapacity = Math.max(0, disposableIncome);

  let score = 50; // base

  // Adjust for savings rate
  if (savingsRate >= 20) score += 20;
  else if (savingsRate >= 10) score += 10;
  else if (savingsRate < 0) score -= 20;

  // Adjust for disposable income
  if (disposableIncome >= 500) score += 15;
  else if (disposableIncome >= 200) score += 5;
  else if (disposableIncome < 0) score -= 25;

  // Adjust for debt burden
  const debtToIncomeRatio = monthlyIncome > 0 ? monthlyDebtPayments / monthlyIncome : 1;
  if (debtToIncomeRatio > 0.43) score -= 20;
  else if (debtToIncomeRatio > 0.36) score -= 10;
  else if (debtToIncomeRatio < 0.2) score += 10;

  // Time-to-goal estimate
  let estimatedMonths = 12;
  if (goal.targetAmount && goal.targetAmount > 0) {
    estimatedMonths = monthlySavingsCapacity > 0 ? Math.ceil(goal.targetAmount / monthlySavingsCapacity) : 999;
    // Penalize if takes very long
    if (estimatedMonths > 60) score -= 20;
    else if (estimatedMonths > 24) score -= 10;
    else if (estimatedMonths <= 6) score += 15;
  }

  // Check deadline feasibility
  if (goal.deadline) {
    const deadlineDate = new Date(goal.deadline);
    const monthsToDeadline = differenceInMonths(deadlineDate, new Date());
    if (goal.targetAmount && monthsToDeadline < estimatedMonths) {
      score -= 25; // deadline is too tight
    } else if (monthsToDeadline >= estimatedMonths * 1.5) {
      score += 10; // plenty of buffer
    }
  }

  score = Math.min(100, Math.max(1, score));

  let feasibility;
  if (score >= 75) feasibility = 'Very Achievable';
  else if (score >= 55) feasibility = 'Achievable';
  else if (score >= 35) feasibility = 'Challenging';
  else feasibility = 'Long-term';

  // Timeframe label
  let timeframe;
  if (estimatedMonths <= 3) timeframe = `${estimatedMonths} months`;
  else if (estimatedMonths <= 12) timeframe = `${estimatedMonths} months`;
  else if (estimatedMonths < 999) {
    const years = Math.floor(estimatedMonths / 12);
    const months = estimatedMonths % 12;
    timeframe = months > 0 ? `${years}yr ${months}mo` : `${years} years`;
  } else {
    timeframe = 'Requires income increase';
  }

  const steps = _buildSteps(goal, financialData, monthlySavingsCapacity);
  const tips = _buildTips(goal, financialData, score);
  const reasoning = _buildReasoning(financialData, monthlySavingsCapacity, estimatedMonths, goal);

  return { feasibility, timeframe, score, steps, tips, reasoning };
}

function _buildSteps(goal, { monthlyIncome, monthlyExpenses, monthlyDebtPayments }, monthlySavingsCapacity) {
  const steps = [];

  if (goal.targetAmount) {
    steps.push(`Set a dedicated savings target of $${goal.targetAmount.toLocaleString()}`);
  }

  if (monthlySavingsCapacity > 0) {
    steps.push(`Automate $${Math.round(monthlySavingsCapacity * 0.5).toLocaleString()}/month transfers to a dedicated goal account`);
  } else {
    steps.push('Reduce monthly expenses by at least $200 to create positive cash flow');
  }

  steps.push('Review and cut subscriptions or dining expenses to free up additional funds');
  steps.push('Track progress monthly and adjust contributions as income changes');

  if (monthlyDebtPayments / monthlyIncome > 0.3) {
    steps.push('Consider consolidating high-interest debt to lower monthly obligations');
  }

  return steps;
}

function _buildTips(goal, { monthlyIncome, monthlyExpenses, savingsRate }, score) {
  const tips = [];

  if (savingsRate < 10) {
    tips.push('Increasing your savings rate by even 5% would meaningfully accelerate this goal');
  }

  const diningEstimate = monthlyExpenses * 0.15; // rough estimate
  if (diningEstimate > 300) {
    tips.push(`Your dining spending (~$${Math.round(diningEstimate)}/month) is your biggest opportunity to free up cash`);
  }

  tips.push('A high-yield savings account earning 4-5% APY will help your money grow while you save');

  if (score < 50) {
    tips.push('Consider a side income stream or negotiating a raise to make this goal more achievable');
  }

  if (goal.category === 'emergency') {
    tips.push('Keep emergency funds in a liquid account — avoid investing money you may need quickly');
  }

  return tips;
}

function _buildReasoning(
  { monthlyIncome, monthlyExpenses, savingsRate, totalDebt },
  monthlySavingsCapacity,
  estimatedMonths,
  goal,
) {
  const disposable = monthlyIncome - monthlyExpenses;
  const savingsPct = savingsRate.toFixed(0);

  let text = `With a monthly savings capacity of $${Math.round(Math.max(0, disposable)).toLocaleString()} and a ${savingsPct}% savings rate`;

  if (goal.targetAmount) {
    if (estimatedMonths < 999) {
      const projectedDate = format(addMonths(new Date(), estimatedMonths), 'MMMM yyyy');
      text += `, you could reach $${goal.targetAmount.toLocaleString()} by ${projectedDate}`;
    } else {
      text += `, reaching $${goal.targetAmount.toLocaleString()} requires increasing your monthly surplus`;
    }
  }

  if (totalDebt > 0) {
    text += `. Managing $${totalDebt.toLocaleString()} in total debt impacts available cash flow`;
  }

  text += '.';
  return text;
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

/**
 * Generates milestone checkpoints for a goal with a target amount.
 * @param {{ targetAmount: number, currentAmount?: number }} goal
 * @returns {Array<{target: number, label: string, reached: boolean}>}
 */
export function generateGoalMilestones(goal) {
  const target = goal.targetAmount || 0;
  const current = goal.currentAmount || 0;
  const milestones = [0.25, 0.5, 0.75, 1.0];

  return milestones.map((pct) => {
    const milestoneAmount = Math.round(target * pct * 100) / 100;
    const label = pct < 1 ? `${Math.round(pct * 100)}% — $${milestoneAmount.toLocaleString()}` : `Goal reached! $${milestoneAmount.toLocaleString()}`;
    return {
      target: milestoneAmount,
      label,
      reached: current >= milestoneAmount,
    };
  });
}

// ---------------------------------------------------------------------------
// Progress calculation
// ---------------------------------------------------------------------------

/**
 * Calculates goal progress and estimates completion date.
 * @param {{ targetAmount: number }} goal
 * @param {number} currentAmount - Amount saved so far
 * @param {number} [monthlySavingsRate=200] - Estimated monthly contribution
 * @returns {{ percentage: number, amountRemaining: number, estimatedCompletion: string }}
 */
export function calculateGoalProgress(goal, currentAmount, monthlySavingsRate = 200) {
  const target = goal.targetAmount || 0;
  const percentage = target > 0 ? Math.min(100, Math.round((currentAmount / target) * 100)) : 0;
  const amountRemaining = Math.max(0, Math.round((target - currentAmount) * 100) / 100);

  let estimatedCompletion = 'N/A';
  if (amountRemaining > 0 && monthlySavingsRate > 0) {
    const monthsLeft = Math.ceil(amountRemaining / monthlySavingsRate);
    estimatedCompletion = format(addMonths(new Date(), monthsLeft), 'MMMM yyyy');
  } else if (amountRemaining <= 0) {
    estimatedCompletion = 'Completed';
  }

  return { percentage, amountRemaining, estimatedCompletion };
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

/**
 * Returns personalized goal-specific recommendations based on financial context.
 * @param {{ text: string, targetAmount?: number, category?: string }} goal
 * @param {{ monthlyIncome: number, monthlyExpenses: number, savingsRate: number, totalDebt: number, monthlyDebtPayments: number }} financialData
 * @returns {string[]}
 */
export function getGoalRecommendations(goal, financialData) {
  const { monthlyIncome, monthlyExpenses, savingsRate, totalDebt, monthlyDebtPayments } = financialData;
  const recs = [];
  const disposable = monthlyIncome - monthlyExpenses;
  const diningEstimate = Math.round(monthlyExpenses * 0.15);

  if (diningEstimate > 200) {
    recs.push(`Your dining spending of ~$${diningEstimate}/month is your biggest opportunity to free up cash`);
  }

  if (savingsRate < 15) {
    const targetSavings = Math.round(monthlyIncome * 0.15);
    recs.push(`Boosting your savings rate to 15% means setting aside $${targetSavings.toLocaleString()}/month`);
  }

  if (totalDebt > 0 && monthlyDebtPayments / monthlyIncome > 0.2) {
    recs.push(`Reducing your debt-to-income ratio below 20% would free up $${Math.round(monthlyDebtPayments * 0.2).toLocaleString()}/month`);
  }

  if (goal.targetAmount && goal.targetAmount >= 1000) {
    recs.push(`Opening a high-yield savings account would earn ~$${Math.round(goal.targetAmount * 0.045 / 12)}/month in interest toward this goal`);
  }

  if (disposable < 300) {
    recs.push('Auditing subscriptions and recurring charges is the fastest way to find extra cash without changing your lifestyle');
  }

  recs.push('Automate your contributions on payday so saving happens before spending');

  return recs;
}
