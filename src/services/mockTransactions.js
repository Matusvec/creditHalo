const uuidv4 = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  differenceInDays,
  isSameMonth,
  isAfter,
  isBefore,
  parseISO,
} from 'date-fns';

// ---------------------------------------------------------------------------
// Seeded pseudo-random generator (LCG, seed 42)
// ---------------------------------------------------------------------------

let _seed = 42;

function seedRandom() {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff;
  return (_seed >>> 0) / 0xffffffff;
}

function resetSeed() {
  _seed = 42;
}

/** Returns a float in [min, max) using the seeded RNG. */
function randBetween(min, max) {
  return min + seedRandom() * (max - min);
}

/** Returns an integer in [min, max] using the seeded RNG. */
function randIntBetween(min, max) {
  return Math.floor(randBetween(min, max + 1));
}

/** Picks a random element from an array using the seeded RNG. */
function pickRandom(arr) {
  return arr[randIntBetween(0, arr.length - 1)];
}

// ---------------------------------------------------------------------------
// Variance helper
// ---------------------------------------------------------------------------

/** Applies ±variance% random variation to a base amount. */
function withVariance(amount, variancePct = 0.2) {
  const delta = amount * variancePct * (seedRandom() * 2 - 1);
  return Math.round((amount + delta) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Transaction builders
// ---------------------------------------------------------------------------

function tx(date, amount, merchant, category, subcategory, isRecurring = false, accountId = 'checking-1') {
  return {
    id: uuidv4(),
    date: format(date, 'yyyy-MM-dd'),
    amount,
    merchant,
    category,
    subcategory,
    isRecurring,
    accountId,
  };
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Generates a deterministic set of transactions covering `months` calendar months.
 * @param {number} months - Number of past months to generate (default 6)
 * @returns {Array<Object>} Transactions sorted by date descending
 */
export function generateTransactions(months = 6) {
  resetSeed();

  const today = new Date();
  const startDate = startOfMonth(subMonths(today, months - 1));
  const allDays = eachDayOfInterval({ start: startDate, end: today });
  const transactions = [];

  // Helper: which month offset is this date in? (0 = current month)
  const monthOffset = (d) => {
    for (let i = 0; i < months; i++) {
      const ref = subMonths(today, i);
      if (isSameMonth(d, ref)) return i;
    }
    return null;
  };

  // --- Fixed monthly events (anchor to each month in range) ---------------
  for (let m = 0; m < months; m++) {
    const refMonth = subMonths(today, months - 1 - m);
    const mStart = startOfMonth(refMonth);

    const day1 = new Date(mStart.getFullYear(), mStart.getMonth(), 1);
    const day5 = new Date(mStart.getFullYear(), mStart.getMonth(), 5);
    const day15 = new Date(mStart.getFullYear(), mStart.getMonth(), 15);

    // Guard: don't emit future dates
    const cap = (d) => (isAfter(d, today) ? null : d);

    // Income: 1st
    if (cap(day1)) transactions.push(tx(day1, 2450, 'Direct Deposit', 'Income', 'Paycheck', true));
    // Income: 15th
    if (cap(day15)) transactions.push(tx(day15, 2450, 'Direct Deposit', 'Income', 'Paycheck', true));
    // Rent: 1st
    if (cap(day1)) transactions.push(tx(day1, -1400, 'Apartment Rent', 'Rent', 'Housing', true));
    // Insurance: 5th
    if (cap(day5)) transactions.push(tx(day5, -145, 'State Farm Auto', 'Insurance', 'Auto Insurance', true));
    // Savings transfer: varied day
    const savingsDay = cap(new Date(mStart.getFullYear(), mStart.getMonth(), 10));
    if (savingsDay) transactions.push(tx(savingsDay, -200, 'Transfer to Savings', 'Transfer', 'Savings', true, 'savings-1'));
    // Investment transfers
    const investDay1 = cap(new Date(mStart.getFullYear(), mStart.getMonth(), 20));
    if (investDay1) transactions.push(tx(investDay1, -200, 'Fidelity Transfer', 'Investment', 'Brokerage', true, 'invest-1'));
    const investDay2 = cap(new Date(mStart.getFullYear(), mStart.getMonth(), 20));
    if (investDay2) transactions.push(tx(investDay2, -150, '401k Contribution', 'Investment', 'Retirement', true, 'invest-2'));

    // Subscriptions (various days)
    const netflixDay = cap(new Date(mStart.getFullYear(), mStart.getMonth(), 8));
    if (netflixDay) transactions.push(tx(netflixDay, -15.49, 'Netflix', 'Subscriptions', 'Streaming', true));
    const spotifyDay = cap(new Date(mStart.getFullYear(), mStart.getMonth(), 12));
    if (spotifyDay) transactions.push(tx(spotifyDay, -10.99, 'Spotify', 'Subscriptions', 'Music', true));
    const gymDay = cap(new Date(mStart.getFullYear(), mStart.getMonth(), 3));
    if (gymDay) transactions.push(tx(gymDay, -49.99, 'Planet Fitness', 'Subscriptions', 'Fitness', true));
    const icloudDay = cap(new Date(mStart.getFullYear(), mStart.getMonth(), 18));
    if (icloudDay) transactions.push(tx(icloudDay, -2.99, 'iCloud', 'Subscriptions', 'Cloud Storage', true));

    // Utilities
    const elecDay = cap(new Date(mStart.getFullYear(), mStart.getMonth(), 22));
    if (elecDay) transactions.push(tx(elecDay, -withVariance(110, 0.25), 'Electric Co', 'Utilities', 'Electricity', true));
    const waterDay = cap(new Date(mStart.getFullYear(), mStart.getMonth(), 24));
    if (waterDay) transactions.push(tx(waterDay, -withVariance(90, 0.2), 'Water Service', 'Utilities', 'Water', true));
    const internetDay = cap(new Date(mStart.getFullYear(), mStart.getMonth(), 26));
    if (internetDay) transactions.push(tx(internetDay, -withVariance(80, 0.05), 'Internet Provider', 'Utilities', 'Internet', true));
  }

  // --- Variable/frequent transactions (iterate over all days) -------------
  let gasLastDay = null;

  for (const day of allDays) {
    if (isAfter(day, today)) break;

    const dayOfWeek = day.getDay(); // 0=Sun
    const mOff = monthOffset(day);

    // Dining anomaly multiplier: months 1-2 ago (offset 1 and 2) get +40%
    const diningMultiplier = mOff === 1 || mOff === 2 ? 1.4 : 1.0;

    // Groceries: ~1-2x per week (trigger on Mon and optionally Thu)
    if (dayOfWeek === 1 || (dayOfWeek === 4 && seedRandom() < 0.6)) {
      const groceryMerchants = ['Whole Foods', "Trader Joe's", 'Kroger'];
      transactions.push(tx(day, -withVariance(randBetween(45, 120), 0.15), pickRandom(groceryMerchants), 'Groceries', 'Grocery Store'));
    }

    // Dining: 2-4x per week
    if (dayOfWeek !== 0 && seedRandom() < 0.45 * diningMultiplier) {
      const diningMerchants = ['Chipotle', 'Starbucks', 'Local Restaurant', 'DoorDash', 'Pizza Hut'];
      const baseAmt = randBetween(10, 45);
      transactions.push(tx(day, -withVariance(baseAmt * diningMultiplier, 0.15), pickRandom(diningMerchants), 'Dining', 'Restaurant'));
    }

    // Gas: every 8-10 days
    if (!gasLastDay || differenceInDays(day, gasLastDay) >= randIntBetween(8, 10)) {
      if (seedRandom() < 0.85) {
        const gasMerchants = ['Shell', 'BP', 'Chevron'];
        transactions.push(tx(day, -withVariance(randBetween(35, 55), 0.15), pickRandom(gasMerchants), 'Gas', 'Fuel'));
        gasLastDay = day;
      }
    }

    // Transportation: ~2-3x/month (trigger probabilistically)
    if (seedRandom() < 0.09) {
      const rideshare = ['Uber', 'Lyft'];
      transactions.push(tx(day, -withVariance(randBetween(15, 35), 0.2), pickRandom(rideshare), 'Transportation', 'Rideshare'));
    }

    // Shopping: 1-3x/month
    if (seedRandom() < 0.07) {
      const shopMerchants = ['Amazon', 'Target', 'Best Buy'];
      transactions.push(tx(day, -withVariance(randBetween(20, 120), 0.2), pickRandom(shopMerchants), 'Shopping', 'Retail'));
    }

    // Entertainment: 1-2x/month
    if (seedRandom() < 0.05) {
      const entMerchants = ['AMC Theaters', 'Steam'];
      transactions.push(tx(day, -withVariance(randBetween(10, 30), 0.15), pickRandom(entMerchants), 'Entertainment', 'Leisure'));
    }

    // Healthcare: 0-1x/month
    if (seedRandom() < 0.025) {
      const healthMerchants = ['CVS Pharmacy', 'Dr. Smith Office'];
      transactions.push(tx(day, -withVariance(randBetween(20, 80), 0.2), pickRandom(healthMerchants), 'Healthcare', 'Medical'));
    }

    // Personal care: 0-1x/month
    if (seedRandom() < 0.02) {
      const careMerchants = ['Great Clips', 'Ulta Beauty'];
      transactions.push(tx(day, -withVariance(randBetween(15, 50), 0.2), pickRandom(careMerchants), 'Personal Care', 'Grooming'));
    }
  }

  // Sort descending by date
  return transactions.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Returns transactions for a given month offset (0 = current month).
 * @param {Array<Object>} transactions
 * @param {number} monthOffset
 * @returns {Array<Object>}
 */
export function getTransactionsByMonth(transactions, monthOffset = 0) {
  const ref = subMonths(new Date(), monthOffset);
  const start = format(startOfMonth(ref), 'yyyy-MM-dd');
  const end = format(endOfMonth(ref), 'yyyy-MM-dd');
  return transactions.filter((t) => t.date >= start && t.date <= end);
}

/**
 * Aggregates spending by category for a given month.
 * @param {Array<Object>} transactions
 * @param {number} monthOffset
 * @returns {Array<{category: string, amount: number, count: number, avgPerTransaction: number}>}
 */
export function getSpendingByCategory(transactions, monthOffset = 0) {
  const monthly = getTransactionsByMonth(transactions, monthOffset);
  const map = {};

  for (const t of monthly) {
    if (t.amount >= 0) continue; // skip income
    const cat = t.category;
    if (!map[cat]) map[cat] = { category: cat, amount: 0, count: 0 };
    map[cat].amount += Math.abs(t.amount);
    map[cat].count += 1;
  }

  return Object.values(map)
    .map((c) => ({ ...c, amount: Math.round(c.amount * 100) / 100, avgPerTransaction: Math.round((c.amount / c.count) * 100) / 100 }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Detects recurring charges across all transactions.
 * @param {Array<Object>} transactions
 * @returns {Array<{merchant: string, amount: number, category: string, frequency: string, lastDate: string}>}
 */
export function detectRecurringCharges(transactions) {
  const byMerchant = {};

  for (const t of transactions) {
    if (t.amount >= 0) continue;
    if (!byMerchant[t.merchant]) byMerchant[t.merchant] = [];
    byMerchant[t.merchant].push(t);
  }

  const results = [];

  for (const [merchant, txs] of Object.entries(byMerchant)) {
    if (txs.length < 2) continue;
    const sorted = txs.slice().sort((a, b) => (a.date > b.date ? 1 : -1));
    const gaps = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(differenceInDays(parseISO(sorted[i].date), parseISO(sorted[i - 1].date)));
    }
    const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    const stdDev = Math.sqrt(gaps.map((g) => Math.pow(g - avgGap, 2)).reduce((s, v) => s + v, 0) / gaps.length);

    // Low variance means regular interval
    if (stdDev > 10) continue;

    const frequency = avgGap <= 10 ? 'weekly' : avgGap <= 35 ? 'monthly' : 'annual';
    const lastTx = sorted[sorted.length - 1];

    results.push({
      merchant,
      amount: Math.abs(lastTx.amount),
      category: lastTx.category,
      frequency,
      lastDate: lastTx.date,
    });
  }

  return results.sort((a, b) => b.amount - a.amount);
}

/**
 * Detects spending anomalies by comparing current month to prior average.
 * @param {Array<Object>} transactions
 * @returns {Array<{category: string, currentMonth: number, previousAvg: number, percentChange: number, message: string}>}
 */
export function detectAnomalies(transactions) {
  const anomalies = [];
  const categories = [...new Set(transactions.filter((t) => t.amount < 0).map((t) => t.category))];

  for (const cat of categories) {
    const current = getSpendingByCategory(transactions, 0).find((c) => c.category === cat)?.amount || 0;
    const prev1 = getSpendingByCategory(transactions, 1).find((c) => c.category === cat)?.amount || 0;
    const prev2 = getSpendingByCategory(transactions, 2).find((c) => c.category === cat)?.amount || 0;
    const prev3 = getSpendingByCategory(transactions, 3).find((c) => c.category === cat)?.amount || 0;

    const prevMonths = [prev1, prev2, prev3].filter((v) => v > 0);
    if (prevMonths.length === 0 || current === 0) continue;

    const previousAvg = prevMonths.reduce((s, v) => s + v, 0) / prevMonths.length;
    const percentChange = ((current - previousAvg) / previousAvg) * 100;

    if (Math.abs(percentChange) >= 20) {
      const direction = percentChange > 0 ? 'up' : 'down';
      anomalies.push({
        category: cat,
        currentMonth: Math.round(current * 100) / 100,
        previousAvg: Math.round(previousAvg * 100) / 100,
        percentChange: Math.round(percentChange),
        message: `${cat} spending is ${direction} ${Math.abs(Math.round(percentChange))}% vs. your 3-month average`,
      });
    }
  }

  return anomalies.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));
}

/**
 * Returns monthly income vs expenses summary.
 * @param {Array<Object>} transactions
 * @param {number} months
 * @returns {Array<{month: string, income: number, expenses: number, savings: number, savingsRate: number}>}
 */
export function getIncomeVsExpenses(transactions, months = 6) {
  return Array.from({ length: months }, (_, i) => {
    const offset = months - 1 - i;
    const monthly = getTransactionsByMonth(transactions, offset);
    const income = monthly.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = monthly.filter((t) => t.amount < 0 && t.category !== 'Transfer' && t.category !== 'Investment').reduce((s, t) => s + Math.abs(t.amount), 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
    const ref = subMonths(new Date(), offset);
    return {
      month: format(ref, 'MMM'),
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      savingsRate,
    };
  });
}
