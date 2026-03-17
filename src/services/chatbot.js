import { getSpendingByCategory, getIncomeVsExpenses } from './mockTransactions';

// ---------------------------------------------------------------------------
// Mock responses grouped by topic
// ---------------------------------------------------------------------------

const MOCK_RESPONSES = {
  spending: [
    "Looking at your spending patterns, dining and entertainment tend to be the biggest discretionary categories. Try setting a monthly limit and tracking it weekly.",
    "Your top spending categories this month look like Dining, Shopping, and Groceries. Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
    "Small recurring purchases add up fast. A daily $5 coffee adds up to $1,825 a year — making coffee at home just 3 days a week saves over $700.",
    "Your spending trends show elevated dining expenses compared to your 3-month average. Try meal prepping on Sundays to cut restaurant costs by 40-60%.",
    "Impulse spending often happens late at night. Consider a 24-hour rule: if you still want something tomorrow, buy it then.",
  ],
  budgeting: [
    "The most effective budget method for your situation might be zero-based budgeting — assign every dollar a job before the month begins.",
    "Try the envelope method digitally: create named savings buckets for each category (groceries, dining, fun) and only spend what's in each.",
    "Your budget adherence score can improve by setting budgets in at least 5 categories. Start with your top 3 spending categories.",
    "When you overspend in one category, immediately transfer that amount from another to stay budget-neutral for the month.",
    "Review your subscriptions monthly — the average American has 4-5 subscriptions they've forgotten about, costing $50-80/month.",
  ],
  goals: [
    "Breaking your goal into quarterly milestones makes it 60% more likely you'll achieve it. What's your 90-day target?",
    "The best time to set up automatic transfers toward your goal is right when your paycheck hits — before you have a chance to spend it.",
    "Your current savings capacity suggests you could hit your goal faster by cutting 2-3 dining visits per month and redirecting that money.",
    "For short-term goals (under 1 year), keep the money in a high-yield savings account earning 4-5% APY — your money grows while you save.",
    "Celebrate small wins! Reaching 25%, 50%, and 75% of your goal keeps motivation high. Set reminders to acknowledge each milestone.",
  ],
  debt: [
    "For your credit card debt, the avalanche method (highest APR first) saves the most interest — you'd save hundreds versus the snowball method.",
    "Making one extra payment per year on a loan can cut years off the repayment timeline and save significant interest.",
    "Your credit utilization is a key score factor. Aim to keep each card below 30% of its limit — below 10% is ideal for maximum score benefit.",
    "Balance transfers to a 0% intro APR card can make sense if you can pay off the balance before the promo period ends. Calculate the transfer fee vs. interest saved.",
    "Debt consolidation can simplify payments and potentially lower your interest rate, but only makes sense if the new rate is actually lower.",
  ],
  investing: [
    "Time in the market beats timing the market — even small regular investments compound dramatically over 20-30 years.",
    "Your 401(k) match is the best guaranteed return you can get. If you're not contributing enough to get the full match, you're leaving free money on the table.",
    "Index funds like VOO and VTI provide diversified exposure at ultra-low cost (0.03-0.05% expense ratio) vs. 1%+ for active funds.",
    "Dollar-cost averaging — investing a fixed amount on a schedule — removes the stress of trying to time the market and smooths out volatility.",
    "For money you won't need for 10+ years, stocks are historically the best asset class. For 1-5 years, consider bonds or high-yield savings.",
  ],
  credit: [
    "Your credit score is made up of: 35% payment history, 30% utilization, 15% length of history, 10% new credit, 10% credit mix.",
    "Set up autopay for at least the minimum payment on all accounts — a single missed payment can drop your score 50-100 points.",
    "Don't close old credit cards even if unused — the age of your accounts boosts your score. Just use them occasionally to keep them active.",
    "If you have a secured card, ask your issuer to upgrade it after 12 months of on-time payments — this typically doesn't require a hard inquiry.",
    "Check your credit report at annualcreditreport.com for free. Disputing errors can result in score improvements within 30-45 days.",
  ],
  general: [
    "Your financial health score reflects multiple dimensions — improving even one area (like adding a budget) can lift your overall score meaningfully.",
    "The most powerful financial habit is paying yourself first: automate transfers to savings and investments before spending on anything else.",
    "An emergency fund of 3-6 months of expenses is your financial foundation. Without it, any unexpected expense can derail your goals.",
    "Financial wellness is a marathon, not a sprint. Consistency in small habits — tracking, saving, learning — compounds over time.",
    "Consider a monthly money date with yourself: 30 minutes to review spending, check goals, and celebrate progress. Consistency is everything.",
  ],
};

// Keyword to topic mapping for smart response selection
const KEYWORD_MAP = [
  { keywords: ['spend', 'spending', 'purchase', 'bought', 'shop', 'dining', 'restaurant', 'grocery', 'groceries'], topic: 'spending' },
  { keywords: ['budget', 'budgeting', 'track', 'category', 'envelope', 'overspend', 'limit'], topic: 'budgeting' },
  { keywords: ['goal', 'goals', 'save for', 'target', 'milestone', 'achieve', 'dream'], topic: 'goals' },
  { keywords: ['debt', 'loan', 'credit card', 'interest', 'payoff', 'owe', 'payment', 'balance'], topic: 'debt' },
  { keywords: ['invest', 'investing', 'stock', 'etf', '401k', 'ira', 'portfolio', 'market', 'retire'], topic: 'investing' },
  { keywords: ['credit', 'score', 'fico', 'utilization', 'report', 'inquiry', 'bureaus'], topic: 'credit' },
];

/**
 * Select the most relevant mock response based on keywords in the user message.
 * @param {string} message
 * @returns {string}
 */
function selectMockResponse(message) {
  const lower = message.toLowerCase();
  for (const { keywords, topic } of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      const responses = MOCK_RESPONSES[topic];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  // Default to general
  const general = MOCK_RESPONSES.general;
  return general[Math.floor(Math.random() * general.length)];
}

/**
 * Builds a financial context string for the AI system prompt from the store state.
 * @param {object} store - Zustand store state snapshot
 * @returns {string}
 */
export function buildFinancialContext(store) {
  try {
    const { transactions = [], healthScore = 0, goals = [], accounts = [] } = store;

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let savingsRate = 0;

    if (transactions.length > 0) {
      const summary = getIncomeVsExpenses(transactions, 1);
      if (summary.length > 0) {
        monthlyIncome = summary[0].income;
        monthlyExpenses = summary[0].expenses;
        savingsRate = summary[0].savingsRate;
      }
    }

    const totalDebt = accounts
      .filter((a) => a.balance < 0)
      .reduce((sum, a) => sum + Math.abs(a.balance), 0);

    const activeGoals = goals.filter((g) => !g.completed).length;

    return (
      `User's financial context: Monthly income ~$${Math.round(monthlyIncome).toLocaleString()}. ` +
      `Monthly spending ~$${Math.round(monthlyExpenses).toLocaleString()}. ` +
      `Savings rate: ${savingsRate}%. ` +
      `Financial health score: ${healthScore}/100. ` +
      `Active goals: ${activeGoals}. ` +
      `Total debt: $${Math.round(totalDebt).toLocaleString()}.`
    );
  } catch {
    return 'User is working on improving their financial health.';
  }
}

/**
 * Sends a message to the AI chatbot and returns a response.
 * Falls back to smart mock responses if no API key is present.
 * @param {string} message - User's message
 * @param {Array<{role: string, content: string}>} [conversationHistory=[]] - Prior messages for context
 * @param {string} [financialContext=''] - Optional system context string
 * @returns {Promise<string>}
 */
export const sendMessage = async (message, conversationHistory = [], financialContext = '') => {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });

      const systemContent =
        'You are Credit Halo Angel, a friendly and knowledgeable financial wellness assistant. ' +
        'Give concise, actionable advice about budgeting, saving, debt management, investing, and credit. ' +
        'Be encouraging and personalized. Do not provide regulated financial advice — always recommend consulting a licensed advisor for major decisions. ' +
        (financialContext ? `\n\n${financialContext}` : '');

      const messages = [
        { role: 'system', content: systemContent },
        ...conversationHistory.slice(-8), // keep last 8 for context window efficiency
        { role: 'user', content: message },
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || selectMockResponse(message);
    } catch (e) {
      console.warn('OpenAI error:', e);
      return selectMockResponse(message);
    }
  }
  return selectMockResponse(message);
};
