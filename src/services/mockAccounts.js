import { format, subMonths } from 'date-fns';

// ---------------------------------------------------------------------------
// Static account data
// ---------------------------------------------------------------------------

export const MOCK_ACCOUNTS = [
  {
    id: 'checking-1',
    name: 'Chase Checking',
    type: 'checking',
    balance: 3247.82,
    institution: 'Chase',
    lastFour: '4521',
  },
  {
    id: 'savings-1',
    name: 'Chase Savings',
    type: 'savings',
    balance: 8450.0,
    institution: 'Chase',
    lastFour: '7834',
  },
  {
    id: 'credit-1',
    name: 'Capital One Quicksilver',
    type: 'credit',
    balance: -1847.23,
    limit: 5000,
    rate: 24.99,
    institution: 'Capital One',
    lastFour: '2198',
  },
  {
    id: 'credit-2',
    name: 'Discover It',
    type: 'credit',
    balance: -432.5,
    limit: 3000,
    rate: 22.49,
    institution: 'Discover',
    lastFour: '6612',
  },
  {
    id: 'loan-1',
    name: 'Student Loan',
    type: 'loan',
    balance: -18750.0,
    originalBalance: -35000,
    rate: 4.5,
    minPayment: 350,
    institution: 'Navient',
    lastFour: '9901',
  },
  {
    id: 'invest-1',
    name: 'Fidelity Brokerage',
    type: 'investment',
    balance: 12340.0,
    institution: 'Fidelity',
    lastFour: '3344',
  },
  {
    id: 'invest-2',
    name: '401(k)',
    type: 'retirement',
    balance: 28750.0,
    institution: 'Fidelity',
    lastFour: '5501',
  },
];

// ---------------------------------------------------------------------------
// Investment holdings
// ---------------------------------------------------------------------------

export const MOCK_HOLDINGS = [
  {
    id: 'h1',
    accountId: 'invest-1',
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    shares: 15.2,
    avgCost: 420.5,
    currentPrice: 478.3,
    type: 'ETF',
  },
  {
    id: 'h2',
    accountId: 'invest-1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 10,
    avgCost: 175.2,
    currentPrice: 198.5,
    type: 'Stock',
  },
  {
    id: 'h3',
    accountId: 'invest-1',
    symbol: 'VTI',
    name: 'Vanguard Total Market ETF',
    shares: 8.5,
    avgCost: 225.4,
    currentPrice: 248.1,
    type: 'ETF',
  },
  {
    id: 'h4',
    accountId: 'invest-2',
    symbol: 'VFFSX',
    name: 'Vanguard 500 Index',
    shares: 45.0,
    avgCost: 510.0,
    currentPrice: 638.9,
    type: 'Mutual Fund',
  },
];

// ---------------------------------------------------------------------------
// Computed helpers
// ---------------------------------------------------------------------------

/**
 * Calculates total net worth across all accounts.
 * @returns {number}
 */
export function getNetWorth() {
  return MOCK_ACCOUNTS.reduce((sum, a) => sum + a.balance, 0);
}

/**
 * Calculates total debt (sum of all negative balances).
 * @returns {number}
 */
export function getTotalDebt() {
  return MOCK_ACCOUNTS.filter((a) => a.balance < 0).reduce((sum, a) => sum + a.balance, 0);
}

/**
 * Calculates total assets (sum of all positive balances).
 * @returns {number}
 */
export function getTotalAssets() {
  return MOCK_ACCOUNTS.filter((a) => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
}

/**
 * Generates mock net worth history showing gradual growth over N months.
 * @param {number} months
 * @returns {Array<{month: string, netWorth: number}>}
 */
export function getNetWorthHistory(months = 12) {
  const currentNW = getNetWorth();
  // Work backwards: each prior month is ~1.5% lower with slight noise
  return Array.from({ length: months }, (_, i) => {
    const offset = months - 1 - i;
    const growthFactor = Math.pow(0.985, offset);
    // Deterministic noise via sine wave to avoid random drift
    const noise = Math.sin(offset * 1.7) * 150;
    const netWorth = Math.round((currentNW * growthFactor + noise) * 100) / 100;
    return {
      month: format(subMonths(new Date(), offset), 'MMM yyyy'),
      netWorth,
    };
  });
}

/**
 * Calculates gain/loss for each holding position.
 * @returns {Array<{holding: Object, totalValue: number, totalCost: number, gainLoss: number, gainLossPercent: number}>}
 */
export function getInvestmentPerformance() {
  return MOCK_HOLDINGS.map((h) => {
    const totalValue = Math.round(h.shares * h.currentPrice * 100) / 100;
    const totalCost = Math.round(h.shares * h.avgCost * 100) / 100;
    const gainLoss = Math.round((totalValue - totalCost) * 100) / 100;
    const gainLossPercent = Math.round(((totalValue - totalCost) / totalCost) * 10000) / 100;
    return { holding: h, totalValue, totalCost, gainLoss, gainLossPercent };
  });
}

/**
 * Returns portfolio allocation by asset type.
 * @returns {Array<{type: string, value: number, percentage: number}>}
 */
export function getPortfolioAllocation() {
  const investAccounts = MOCK_ACCOUNTS.filter((a) => a.type === 'investment' || a.type === 'retirement');
  const total = investAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Map holdings to type totals
  const typeMap = {};
  for (const h of MOCK_HOLDINGS) {
    const value = h.shares * h.currentPrice;
    const type = h.type;
    typeMap[type] = (typeMap[type] || 0) + value;
  }

  // Add retirement account cash not in holdings
  const holdingsTotal = Object.values(typeMap).reduce((s, v) => s + v, 0);
  const retirementAccount = MOCK_ACCOUNTS.find((a) => a.type === 'retirement');
  if (retirementAccount) {
    const retirementHoldingsValue = MOCK_HOLDINGS.filter((h) => h.accountId === retirementAccount.id).reduce((s, h) => s + h.shares * h.currentPrice, 0);
    const cashInRetirement = retirementAccount.balance - retirementHoldingsValue;
    if (cashInRetirement > 0) {
      typeMap['Cash'] = (typeMap['Cash'] || 0) + cashInRetirement;
    }
  }

  const grandTotal = Object.values(typeMap).reduce((s, v) => s + v, 0) || total;

  return Object.entries(typeMap)
    .map(([type, value]) => ({
      type,
      value: Math.round(value * 100) / 100,
      percentage: Math.round((value / grandTotal) * 10000) / 100,
    }))
    .sort((a, b) => b.value - a.value);
}
