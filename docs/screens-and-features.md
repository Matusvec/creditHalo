# Screens & Features Reference

## Tab Screens

### Dashboard (`DashboardScreen.js`)
- Net worth display
- Health score ring (links to HealthScore detail)
- Spending summary with category breakdown
- Recent transactions list
- Quick stat cards (savings rate, streak)
- AI-generated insight cards

### Money Hub (`screens/money/MoneyHubScreen.js`)
Entry point to all financial tools. Grid of tool cards linking to:

| Screen | File | Purpose |
|--------|------|---------|
| Spending | `SpendingScreen.js` | Category spending analysis with charts |
| Budget | `BudgetScreen.js` | Set/view monthly budgets per category |
| Subscriptions | `SubscriptionsScreen.js` | Detected recurring charges, cancel tracking |
| Accounts | `AccountsScreen.js` | Linked bank accounts overview |
| Investments | `InvestmentsScreen.js` | Holdings and portfolio view |
| Bill Calendar | `BillCalendarScreen.js` | Upcoming bills, mark paid |
| Credit Score Sim | `CreditScoreSimScreen.js` | Simulate score changes from actions |
| Debt Payoff | `DebtPayoffScreen.js` | Snowball/avalanche payoff calculator |

### Learn (`LearnScreen.js`)
- 3 course modules with 3 lessons each
- Streak tracker component
- XP progress display
- Links to `LessonDetailScreen` (modal)

### Community (`CommunityScreen.js`)
- Social feed with posts
- Like/comment functionality
- Community groups to join
- Share milestones
- Create new posts

### Goals (`screens/goals/`)
- `GoalsScreen.js` — Goal list with progress bars
- `GoalDetailScreen.js` — Single goal detail, milestones, AI analysis
- `SavingsChallengesScreen.js` — Browse/start savings challenges
- `ChatbotModal.js` — Goal-specific AI chat

## Modal/Full-Screen Screens

| Screen | Purpose |
|--------|---------|
| `SettingsScreen.js` | User preferences, logout |
| `ChatbotScreen.js` | AI financial assistant chat |
| `HealthScoreScreen.js` | Score breakdown, history, recommendations |
| `AchievementsScreen.js` | Badges earned, XP/level progress |
| `InsightsScreen.js` | Financial insights hub |
| `LoadingScreen.js` | Auth entry, onboarding, store hydration |

## Insights Tools (`screens/insights/`)

| Tool | Purpose |
|------|---------|
| `LoanCalculator.js` | Calculate loan payments and total interest |
| `BudgetTool.js` | Interactive budget planning |
| `AlertSetup.js` | Configure spending/budget alerts |

## Key Component Groups

### Dashboard Components (`components/dashboard/`)
- `QuickStatCard` — Summary metric cards
- `TransactionRow` — Single transaction line item
- `InsightCard` — AI-generated insight display

### Goal Components (`components/goals/`)
- `SmartGoalCard` — Goal card with milestone progress
- Related goal tracking UI

### Chart Components (`components/charts/`)
- `ScoreRing` — Circular progress ring (health score)
- `MiniBarChart` — Compact bar chart for spending

### Budget/Finance Components
- `components/budget/` — Budget visualization
- `components/investments/` — Holdings display
- `components/subscriptions/` — Subscription cards
- `components/calendar/` — Bill calendar display
