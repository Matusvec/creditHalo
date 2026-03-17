const uuidv4 = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
import { addDays, differenceInDays, parseISO, format } from 'date-fns';

// ---------------------------------------------------------------------------
// Types (JSDoc)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Subscription
 * @property {string} id
 * @property {string} merchant
 * @property {number} amount
 * @property {string} category
 * @property {'monthly'|'annual'|'weekly'} frequency
 * @property {string} lastChargeDate
 * @property {string} nextExpectedDate
 * @property {boolean} isActive
 */

// ---------------------------------------------------------------------------
// Detection logic
// ---------------------------------------------------------------------------

/**
 * Analyzes transactions and returns detected recurring subscriptions.
 * Detects merchants appearing at regular ~25-35 day intervals for monthly,
 * ~7 day intervals for weekly, or ~360-370 day intervals for annual.
 * @param {Array<Object>} transactions
 * @returns {Subscription[]}
 */
export function detectSubscriptions(transactions) {
  // Group expenses by merchant
  const byMerchant = {};
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    const key = t.merchant;
    if (!byMerchant[key]) byMerchant[key] = { txs: [], category: t.category };
    byMerchant[key].txs.push(t);
  }

  const subscriptions = [];

  for (const [merchant, { txs, category }] of Object.entries(byMerchant)) {
    if (txs.length < 2) continue;

    const sorted = txs.slice().sort((a, b) => (a.date > b.date ? 1 : -1));

    // Compute gaps between consecutive occurrences
    const gaps = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(differenceInDays(parseISO(sorted[i].date), parseISO(sorted[i - 1].date)));
    }

    const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    const variance = gaps.reduce((s, g) => s + Math.pow(g - avgGap, 2), 0) / gaps.length;
    const stdDev = Math.sqrt(variance);

    // Reject noisy patterns (high standard deviation)
    if (stdDev > 12) continue;

    let frequency;
    if (avgGap >= 6 && avgGap <= 9) {
      frequency = 'weekly';
    } else if (avgGap >= 25 && avgGap <= 35) {
      frequency = 'monthly';
    } else if (avgGap >= 355 && avgGap <= 375) {
      frequency = 'annual';
    } else {
      continue; // unrecognized cadence
    }

    const lastTx = sorted[sorted.length - 1];
    const lastDate = parseISO(lastTx.date);
    const gapDays = frequency === 'weekly' ? 7 : frequency === 'monthly' ? 30 : 365;
    const nextExpectedDate = format(addDays(lastDate, gapDays), 'yyyy-MM-dd');

    // Amount: use median of last 3 charges to smooth outliers
    const recentAmounts = sorted.slice(-3).map((t) => Math.abs(t.amount));
    recentAmounts.sort((a, b) => a - b);
    const amount = recentAmounts[Math.floor(recentAmounts.length / 2)];

    subscriptions.push({
      id: uuidv4(),
      merchant,
      amount: Math.round(amount * 100) / 100,
      category,
      frequency,
      lastChargeDate: lastTx.date,
      nextExpectedDate,
      isActive: true,
    });
  }

  // Sort by amount descending
  return subscriptions.sort((a, b) => b.amount - a.amount);
}

/**
 * Returns aggregate summary of detected subscriptions.
 * @param {Subscription[]} subscriptions
 * @returns {{ monthlyTotal: number, annualProjection: number, count: number }}
 */
export function getSubscriptionSummary(subscriptions) {
  let monthlyTotal = 0;

  for (const sub of subscriptions) {
    if (sub.frequency === 'monthly') {
      monthlyTotal += sub.amount;
    } else if (sub.frequency === 'annual') {
      monthlyTotal += sub.amount / 12;
    } else if (sub.frequency === 'weekly') {
      monthlyTotal += sub.amount * 4.33;
    }
  }

  return {
    monthlyTotal: Math.round(monthlyTotal * 100) / 100,
    annualProjection: Math.round(monthlyTotal * 12 * 100) / 100,
    count: subscriptions.length,
  };
}

/**
 * Groups subscriptions by category with per-category totals.
 * @param {Subscription[]} subscriptions
 * @returns {Array<{category: string, total: number, items: Subscription[]}>}
 */
export function getSubscriptionsByCategory(subscriptions) {
  const map = {};

  for (const sub of subscriptions) {
    const cat = sub.category;
    if (!map[cat]) map[cat] = { category: cat, total: 0, items: [] };
    map[cat].items.push(sub);

    let monthly = sub.amount;
    if (sub.frequency === 'annual') monthly = sub.amount / 12;
    else if (sub.frequency === 'weekly') monthly = sub.amount * 4.33;
    map[cat].total += monthly;
  }

  return Object.values(map)
    .map((c) => ({ ...c, total: Math.round(c.total * 100) / 100 }))
    .sort((a, b) => b.total - a.total);
}
