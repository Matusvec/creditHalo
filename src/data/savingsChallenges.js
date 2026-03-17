/**
 * @typedef {Object} SavingsChallenge
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} duration - Duration in the unit appropriate for type (days/weeks/weekends)
 * @property {number|null} totalSavings - Target savings amount; null if variable
 * @property {string} icon - Ionicons icon name
 * @property {string} color - Accent color
 * @property {string} type - 'progressive'|'tracking'|'automatic'|'challenge'|'event-based'
 * @property {function(number): number} [getWeeklyTarget] - For progressive challenges
 */

/** @type {SavingsChallenge[]} */
export const SAVINGS_CHALLENGES = [
  {
    id: '52-week',
    name: '52-Week Challenge',
    description: 'Save $1 in week 1, $2 in week 2... up to $52 in week 52',
    duration: 52,
    totalSavings: 1378,
    icon: 'calendar',
    color: '#4FC3F7',
    getWeeklyTarget: (week) => week,
    type: 'progressive',
  },
  {
    id: 'no-spend-weekend',
    name: 'No-Spend Weekend',
    description: 'Track weekends with zero discretionary spending',
    duration: 8,
    totalSavings: null,
    icon: 'wallet',
    color: '#81C784',
    type: 'tracking',
  },
  {
    id: 'round-up',
    name: 'Round-Up Challenge',
    description: 'Round up every purchase to the nearest $5 and save the difference',
    duration: 30,
    totalSavings: null,
    icon: 'arrow-up-circle',
    color: '#FF8A65',
    type: 'automatic',
  },
  {
    id: 'pantry-week',
    name: 'Pantry Week',
    description: 'Spend $0 on dining and groceries for one week — use what you have',
    duration: 7,
    totalSavings: 150,
    icon: 'restaurant',
    color: '#CE93D8',
    type: 'challenge',
  },
  {
    id: 'five-dollar',
    name: '$5 Bill Challenge',
    description: 'Save $5 every time you eat out. Digital equivalent of saving every $5 bill',
    duration: 30,
    totalSavings: null,
    icon: 'cash',
    color: '#FFD54F',
    type: 'event-based',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a challenge by its ID.
 * @param {string} id
 * @returns {SavingsChallenge|undefined}
 */
export function getChallengeById(id) {
  return SAVINGS_CHALLENGES.find((c) => c.id === id);
}

/**
 * Calculates the total target savings for the 52-week challenge up to a given week.
 * @param {number} currentWeek - Week number the user is currently on (1-52)
 * @returns {number} Cumulative savings up to and including currentWeek
 */
export function get52WeekCumulativeTarget(currentWeek) {
  const week = Math.min(52, Math.max(1, currentWeek));
  // Sum of 1..week = week * (week + 1) / 2
  return (week * (week + 1)) / 2;
}

/**
 * Calculates progress percentage for an active challenge.
 * @param {SavingsChallenge} challenge
 * @param {number} completedUnits - Weeks completed, weekends tracked, days passed, etc.
 * @returns {number} Percentage 0–100
 */
export function getChallengeProgress(challenge, completedUnits) {
  if (!challenge.duration) return 0;
  return Math.min(100, Math.round((completedUnits / challenge.duration) * 100));
}

/**
 * Returns an estimated savings amount for variable challenges given user transaction data.
 * Estimates are based on typical spending patterns.
 * @param {string} challengeId
 * @param {{ avgDiningPerVisit?: number, avgTransactionAmount?: number, weekendSpend?: number }} spendingProfile
 * @returns {number|null} Estimated savings or null if can't estimate
 */
export function estimateChallengeSavings(challengeId, spendingProfile = {}) {
  switch (challengeId) {
    case 'round-up': {
      const avgTx = spendingProfile.avgTransactionAmount || 35;
      const avgRoundUp = avgTx % 5 === 0 ? 2.5 : 5 - (avgTx % 5);
      const txPerMonth = 40; // typical
      return Math.round(avgRoundUp * txPerMonth);
    }
    case 'no-spend-weekend': {
      const weekendSavings = spendingProfile.weekendSpend || 80;
      return weekendSavings * 8; // 8 successful weekends
    }
    case 'five-dollar': {
      const diningVisits = 20; // ~20 times/month
      return diningVisits * 5;
    }
    default:
      return null;
  }
}
