/**
 * @typedef {Object} Badge
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} description - Short description shown to the user
 * @property {string} icon - Ionicons icon name
 * @property {{ type: string, count: number }} requirement - Unlock condition
 * @property {string} color - Accent color for the badge
 */

/** @type {Badge[]} */
export const BADGES = [
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete 5 lessons',
    icon: 'school',
    requirement: { type: 'lessons', count: 5 },
    color: '#4FC3F7',
  },
  {
    id: 'budget-master',
    name: 'Budget Master',
    description: 'Set budgets for 5 categories',
    icon: 'wallet',
    requirement: { type: 'budgets', count: 5 },
    color: '#81C784',
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: '7-day learning streak',
    icon: 'flame',
    requirement: { type: 'streak', count: 7 },
    color: '#FF8A65',
  },
  {
    id: 'monthly-champion',
    name: 'Monthly Champion',
    description: '30-day learning streak',
    icon: 'trophy',
    requirement: { type: 'streak', count: 30 },
    color: '#FFD54F',
  },
  {
    id: 'goal-setter',
    name: 'Goal Setter',
    description: 'Set 3 financial goals',
    icon: 'flag',
    requirement: { type: 'goals_set', count: 3 },
    color: '#CE93D8',
  },
  {
    id: 'achiever',
    name: 'Achiever',
    description: 'Complete 3 goals',
    icon: 'ribbon',
    requirement: { type: 'goals_complete', count: 3 },
    color: '#F48FB1',
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Make 5 community posts',
    icon: 'chatbubbles',
    requirement: { type: 'posts', count: 5 },
    color: '#4DD0E1',
  },
  {
    id: 'financial-fitness',
    name: 'Financial Fitness',
    description: 'Reach health score of 70+',
    icon: 'fitness',
    requirement: { type: 'health_score', count: 70 },
    color: '#AED581',
  },
  {
    id: 'saver',
    name: 'Saver',
    description: 'Complete a savings challenge',
    icon: 'cash',
    requirement: { type: 'challenges_complete', count: 1 },
    color: '#4DB6AC',
  },
  {
    id: 'investor',
    name: 'Investor',
    description: 'View investment portfolio',
    icon: 'trending-up',
    requirement: { type: 'investments_viewed', count: 1 },
    color: '#7986CB',
  },
];

/**
 * Checks if a badge requirement is met given user stats.
 * @param {Badge} badge
 * @param {Record<string, number>} stats - e.g. { lessons: 6, streak: 9, budgets: 2 }
 * @returns {boolean}
 */
export function isBadgeUnlocked(badge, stats) {
  const current = stats[badge.requirement.type] || 0;
  return current >= badge.requirement.count;
}

/**
 * Returns all badges with their unlocked status given current stats.
 * @param {Record<string, number>} stats
 * @returns {Array<Badge & { unlocked: boolean }>}
 */
export function getBadgesWithStatus(stats) {
  return BADGES.map((badge) => ({
    ...badge,
    unlocked: isBadgeUnlocked(badge, stats),
  }));
}
